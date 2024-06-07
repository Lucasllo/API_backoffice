import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryqueueController } from '../../controllers/deliveryqueue.controller';
import { DeliveryqueueService } from '../../services/deliveryqueue.service';

describe('DeliveryqueueController', () => {
  let controller: DeliveryqueueController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveryqueueController],
      providers: [DeliveryqueueService],
    }).compile();

    controller = module.get<DeliveryqueueController>(DeliveryqueueController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
