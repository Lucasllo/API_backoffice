import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { ShoppingDto } from './shopping.dto';

export class ShoppingPaginateDto {
  @ApiProperty({
    example: 'ShoppingDto[]',
    description: 'Dados das compras',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ShoppingDto)
  data: ShoppingDto[];

  @ApiProperty({
    example: '10',
    description: 'Quantidade total de dados',
  })
  @IsNumber()
  count: number;
}
