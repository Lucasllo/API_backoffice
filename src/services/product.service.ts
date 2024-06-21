import { BadRequestException, Injectable } from '@nestjs/common';
import { ProductMapper } from 'src/mappers/product.mapper';
import { ProductRepository } from 'src/repositories/product.repository';

@Injectable()
export class ProductService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly productMapper: ProductMapper,
  ) {}

  findAll() {
    return `This action returns all product`;
  }

  async findByShopping(id: number) {
    try {
      const list = await this.productRepository.findByShopping(id);
      return this.productMapper.toListDTO(list);
    } catch (error) {
      throw new BadRequestException('Pedido invalido.');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
