import { Test, TestingModule } from '@nestjs/testing';
import { UserClientRepository } from '../../repositories/userClient.repository';
import { UserClientService } from '../../services/userClient.service';

describe('UserClientService', () => {
  let service: UserClientService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserClientService,
        { provide: UserClientRepository, useValue: {} },
      ],
    }).compile();

    service = module.get<UserClientService>(UserClientService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
