import { Test, TestingModule } from '@nestjs/testing';
import { DeliveryqueueService } from '../../services/deliveryqueue.service';

describe('DeliveryqueueService', () => {
  let service: DeliveryqueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DeliveryqueueService],
    }).compile();

    service = module.get<DeliveryqueueService>(DeliveryqueueService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
