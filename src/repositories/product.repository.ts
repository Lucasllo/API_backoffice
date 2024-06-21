import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities/product.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(ProductEntity)
    private readonly productRepository: Repository<ProductEntity>,
  ) {}

  public async findByShopping(id: number) {
    return this.productRepository.find({
      relations: ['shoppingEntity'],
      where: {
        shoppingId: id,
      },
    });
  }
}
