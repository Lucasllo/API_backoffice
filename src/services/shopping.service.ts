import { BadRequestException, Injectable } from '@nestjs/common';
import { ShoppingRepository } from '../repositories/shopping.repository';
import { ShoppingQueryPaginateDto } from 'src/dtos/shopping/shoppingQueryPaginate.dto';
import { solicitacaoCompraStatus } from 'src/enums/solicitacaoCompraStatus.enum';
import { ShoppingPaginateDto } from 'src/dtos/shopping/shoppingPaginate.dto';
import { ShoppingDto } from 'src/dtos/shopping/shopping.dto';
import { ShoppingMapper } from '../mappers/shopping.mapper';

@Injectable()
export class ShoppingService {
  constructor(
    private readonly shoppingRepository: ShoppingRepository,
    private readonly shoppingMapper: ShoppingMapper,
  ) {}

  async findAll(query: ShoppingQueryPaginateDto) {
    const dados = await this.shoppingRepository.findAll(query);

    const shoppingDto: ShoppingDto[] = this.shoppingMapper.toListDTO(
      dados.data,
    );

    const retorno: ShoppingPaginateDto = new ShoppingPaginateDto();
    retorno.count = dados.count;
    retorno.data = shoppingDto;

    return retorno;
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
