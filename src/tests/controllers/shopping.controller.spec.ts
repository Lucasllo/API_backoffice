import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingController } from '../../controllers/shopping.controller';
import { ShoppingService } from '../../services/shopping.service';

describe('ShoppingController', () => {
  let controller: ShoppingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ShoppingController],
      providers: [{ provide: ShoppingService, useValue: {} }],
    }).compile();

    controller = module.get<ShoppingController>(ShoppingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
