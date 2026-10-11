import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryQueueRepository } from '../../repositories/deliveryQueue.repository';
import { DeliveryqueueService } from '../../services/deliveryqueue.service';
import { ShoppingService } from '../../services/shopping.service';
import { UserDeliveryService } from '../../services/userDelivery.service';

describe('DeliveryqueueService', () => {
  let service: DeliveryqueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeliveryqueueService,
        { provide: DeliveryQueueRepository, useValue: {} },
        { provide: ShoppingService, useValue: {} },
        { provide: UserDeliveryService, useValue: {} },
      ],
    }).compile();

    service = module.get<DeliveryqueueService>(DeliveryqueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
