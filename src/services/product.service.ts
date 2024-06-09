import { Injectable } from '@nestjs/common';
import { ProductRepository } from 'src/repositories/product.repository';

@Injectable()
export class ProductService {
  constructor(private readonly productRepository: ProductRepository) {}

  findAll() {
    return `This action returns all product`;
  }

  findByShopping(id: number) {
    return this.productRepository.findByShopping(id);
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
