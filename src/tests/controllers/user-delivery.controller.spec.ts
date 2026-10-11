import { Test, TestingModule } from '@nestjs/testing';
import { UserDeliveryController } from '../../controllers/userDelivery.controller';
import { UserDeliveryService } from '../../services/userDelivery.service';

describe('UserDeliveryController', () => {
  let controller: UserDeliveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserDeliveryController],
      providers: [{ provide: UserDeliveryService, useValue: {} }],
    }).compile();

    controller = module.get<UserDeliveryController>(UserDeliveryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
