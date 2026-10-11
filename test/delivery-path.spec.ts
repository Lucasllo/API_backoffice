import 'dotenv/config';
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import { spawnSync } from 'node:child_process';
import * as path from 'node:path';
import { AppModule } from '../src/app.module';
import { DeliveryQueueEntity } from 'src/entities/deliveryQueue.entity';
import { ShoppingEntity } from 'src/entities/shopping.entity';

describe('delivery path', () => {
  let app: INestApplication;

  beforeAll(async () => {
    if (
      process.env.DB_HOST !== '127.0.0.1' ||
      process.env.DB_DATABASE !== 'ifarma' ||
      process.env.ENV !== 'demo'
    ) {
      throw new Error(
        'DB_HOST, DB_DATABASE ou ENV nao batem com a demo local.',
      );
    }

    const seeded = spawnSync(process.execPath, ['scripts/apply-demo-sql.js'], {
      stdio: 'inherit',
      env: process.env,
      cwd: path.join(__dirname, '..'),
    });

    if (seeded.status !== 0) {
      throw new Error('A semente da demo falhou.');
    }

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  it('login, fila, codigo 0000 e codigo 4821', async () => {
    const login = await request(app.getHttpServer())
      .post('/auth/loginDelivery')
      .send({
        email: 'entregador.demo@example.com',
        password: 'Entrega1!',
      })
      .expect(201);

    expect(typeof login.body.token).toBe('string');
    expect(login.body.token.length).toBeGreaterThan(0);
    expect(login.body.id).toBe(1);
    expect(login.body.role).toBe('4');

    const token = login.body.token;

    const queued = await request(app.getHttpServer())
      .post('/deliveryqueue/1')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(queued.text).toBe('');

    const dataSource = app.get(DataSource);
    const queueRepo = dataSource.getRepository(DeliveryQueueEntity);
    const shoppingRepo = dataSource.getRepository(ShoppingEntity);

    const waiting = await queueRepo.find({ where: { shoppingId: 1 } });
    expect(waiting).toHaveLength(1);
    expect(waiting[0].shoppingId).toBe(1);
    expect(waiting[0].userDeliveryId).toBe(1);
    expect(waiting[0].status).toBe(1);
    const queueId = waiting[0].id;

    const shoppingWaiting = await shoppingRepo.findOne({ where: { id: 1 } });
    expect(shoppingWaiting.status).toBe(6);
    expect(shoppingWaiting.verificationCode).toBe('4821');

    const wrongCode = await request(app.getHttpServer())
      .post('/deliveryqueue/validateDelivery/1/0000')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);

    expect(wrongCode.body.message).toBe('Dados invalidos');

    const stillWaiting = await queueRepo.find({ where: { shoppingId: 1 } });
    expect(stillWaiting).toHaveLength(1);
    expect(stillWaiting[0].id).toBe(queueId);
    expect(stillWaiting[0].userDeliveryId).toBe(1);
    expect(stillWaiting[0].status).toBe(1);

    const shoppingStillWaiting = await shoppingRepo.findOne({
      where: { id: 1 },
    });
    expect(shoppingStillWaiting.status).toBe(6);
    expect(shoppingStillWaiting.verificationCode).toBe('4821');

    const confirmed = await request(app.getHttpServer())
      .post('/deliveryqueue/validateDelivery/1/4821')
      .set('Authorization', `Bearer ${token}`)
      .expect(201);

    expect(confirmed.text).toBe('');

    const finished = await queueRepo.find({ where: { shoppingId: 1 } });
    expect(finished).toHaveLength(1);
    expect(finished[0].id).toBe(queueId);
    expect(finished[0].userDeliveryId).toBe(1);
    expect(finished[0].status).toBe(2);

    const shoppingFinished = await shoppingRepo.findOne({ where: { id: 1 } });
    expect(shoppingFinished.status).toBe(4);
  });
});
