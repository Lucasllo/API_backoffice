import { Injectable } from '@nestjs/common';

@Injectable()
export class ShoppingService {
  findAll() {
    return `This action returns all shopping`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shopping`;
  }

  remove(id: number) {
    return `This action removes a #${id} shopping`;
  }
}
