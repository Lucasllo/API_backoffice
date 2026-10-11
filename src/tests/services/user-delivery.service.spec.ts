import { Test, TestingModule } from '@nestjs/testing';
import { UserDeliveryRepository } from '../../repositories/userDelivery.repository';
import { UserDeliveryService } from '../../services/userDelivery.service';

describe('UserDeliveryService', () => {
  let service: UserDeliveryService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserDeliveryService,
        { provide: UserDeliveryRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<UserDeliveryService>(UserDeliveryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
