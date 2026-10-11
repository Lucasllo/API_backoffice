import { Test, TestingModule } from '@nestjs/testing';
import { ProductMapper } from '../../mappers/product.mapper';
import { ProductRepository } from '../../repositories/product.repository';
import { ProductService } from '../../services/product.service';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useValue: {} },
        { provide: ProductMapper, useValue: {} },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
