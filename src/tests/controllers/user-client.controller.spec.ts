import { Test, TestingModule } from '@nestjs/testing';
import { UserClientController } from '../../controllers/userClient.controller';
import { UserClientService } from '../../services/user-client.service';

describe('UserClientController', () => {
  let controller: UserClientController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserClientController],
      providers: [UserClientService],
    }).compile();

    controller = module.get<UserClientController>(UserClientController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
