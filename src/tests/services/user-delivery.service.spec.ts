import { Test, TestingModule } from '@nestjs/testing';
import { UserDeliveryService } from '../../services/userDelivery.service';

describe('UserDeliveryService', () => {
  let service: UserDeliveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserDeliveryService],
    }).compile();

    service = module.get<UserDeliveryService>(UserDeliveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
