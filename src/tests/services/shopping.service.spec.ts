import { Test, TestingModule } from '@nestjs/testing';
import { ShoppingMapper } from '../../mappers/shopping.mapper';
import { ShoppingRepository } from '../../repositories/shopping.repository';
import { ShoppingService } from '../../services/shopping.service';

describe('ShoppingService', () => {
  let service: ShoppingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShoppingService,
        { provide: ShoppingRepository, useValue: {} },
        { provide: ShoppingMapper, useValue: {} },
      ],
    }).compile();

    service = module.get<ShoppingService>(ShoppingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
