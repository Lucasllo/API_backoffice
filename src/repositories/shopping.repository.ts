import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShoppingPaginateDto } from 'src/dtos/shopping/shoppingPaginate.dto';
import { ShoppingQueryPaginateDto } from 'src/dtos/shopping/shoppingQueryPaginate.dto';
import { ShoppingEntity } from 'src/entities/shopping.entity';
import { solicitacaoCompraStatus } from 'src/enums/solicitacaoCompraStatus.enum';
import { Repository } from 'typeorm';

@Injectable()
export class ShoppingRepository {
  constructor(
    @InjectRepository(ShoppingEntity)
    private readonly shoppingRepository: Repository<ShoppingEntity>,
  ) {}

  public async findAll(
    query: ShoppingQueryPaginateDto,
  ): Promise<ShoppingPaginateDto> {
    const take = query.take || 10;
    const skip = query.skip || 0;
    const order = query.orderBy || { id: 'DESC' };
    const storeCode = query.storeCode;

    const [result, total] = await this.shoppingRepository.findAndCount({
      relations: ['userClientEntity'],
      where: { storeCode },
      order,
      take: take,
      skip: skip,
    });

    return {
      data: result,
      count: total,
    };
  }

  public findOne(id: number) {
    return this.shoppingRepository.findOne({
      where: {
        id,
      },
    });
  }

  public async updateStatus(codeStatus: solicitacaoCompraStatus, id: number) {
    const shopping = await this.findOne(id);
    shopping.status = codeStatus;
    return await this.shoppingRepository.save(shopping);
  }
}
