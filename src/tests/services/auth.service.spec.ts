import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../../services/auth.service';
import { MailingService } from '../../services/mailingService';
import { UserService } from '../../services/user.service';
import { UserDeliveryService } from '../../services/userDelivery.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UserService, useValue: {} },
        { provide: UserDeliveryService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: MailingService, useValue: {} },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
