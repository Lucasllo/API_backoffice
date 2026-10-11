import { Test, TestingModule } from '@nestjs/testing';
import { UserMapper } from '../../mappers/user.mapper';
import { UserPermissionMapper } from '../../mappers/userPermission.mapper';
import { UserRepository } from '../../repositories/user.repository';
import { MailingService } from '../../services/mailingService';
import { UserService } from '../../services/user.service';

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: UserRepository, useValue: {} },
        { provide: UserMapper, useValue: {} },
        { provide: MailingService, useValue: {} },
        { provide: UserPermissionMapper, useValue: {} },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
