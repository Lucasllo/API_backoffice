import { BadRequestException, Injectable } from '@nestjs/common';
import { ShoppingRepository } from '../repositories/shopping.repository';
import { ShoppingQueryPaginateDto } from 'src/dtos/shopping/shoppingQueryPaginate.dto';
import { solicitacaoCompraStatus } from 'src/enums/solicitacaoCompraStatus.enum';

@Injectable()
export class ShoppingService {
  constructor(private readonly shoppingRepository: ShoppingRepository) {}

  findAll(query: ShoppingQueryPaginateDto) {
    return this.shoppingRepository.findAll(query);
  }

  findOne(id: number) {
    return this.shoppingRepository.findOne(id);
  }

  async updateStatus(
    codeStatus: solicitacaoCompraStatus,
    codeShopping: number,
  ) {
    try {
      await this.shoppingRepository.updateStatus(codeStatus, codeShopping);
    } catch (error) {
      throw new BadRequestException('Compra/Status invalido.');
    }
  }

  remove(id: number) {
    return `This action removes a #${id} shopping`;
  }
}
