import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ShoppingPaginateDto } from 'src/dtos/shopping/shoppingPaginate.dto';
import { ShoppingQueryPaginateDto } from 'src/dtos/shopping/shoppingQueryPaginate.dto';
import { ShoppingEntity } from 'src/entities/shopping.entity';
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

  public async findOne(id: number) {
    return this.shoppingRepository.findOne({
      where: {
        id,
      },
    });
  }
}
