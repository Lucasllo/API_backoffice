import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ShoppingEntity } from 'src/entities/shopping.entity';

export class ShoppingPaginateDto {
  @ApiProperty({
    example: 'ShoppingDto[]',
    description: 'Dados das compras',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShoppingEntity)
  data: ShoppingEntity[];

  @ApiProperty({
    example: '10',
    description: 'Quantidade total de dados',
  })
  @IsNumber()
  count: number;
}
