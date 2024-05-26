import { Injectable } from '@nestjs/common';
import { ShoppingRepository } from '../repositories/shopping.repository';
import { ShoppingQueryPaginateDto } from 'src/dtos/shopping/shoppingQueryPaginate.dto';

@Injectable()
export class ShoppingService {
  constructor(private readonly shoppingRepository: ShoppingRepository) {}

  findAll(query: ShoppingQueryPaginateDto) {
    return this.shoppingRepository.findAll(query);
  }

  findOne(id: number) {
    return this.shoppingRepository.findOne(id);
  }

  remove(id: number) {
    return `This action removes a #${id} shopping`;
  }
}
