import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

export class ShoppingQueryPaginateDto {
  @ApiProperty({
    example: '1',
    description: 'numero de dados que quer buscar',
  })
  @IsNumber()
  take: number;

  @ApiProperty({
    example: '1',
    description: 'numero da pagina que quer buscar os dados',
  })
  @IsNumber()
  skip: number;

  @ApiProperty({
    example: '{ id: "DESC" }',
    description: 'Qual dado que quer ordenar a lista. Não é obrigatorio',
  })
  @IsObject()
  @IsOptional()
  orderBy?: object;

  @ApiProperty({
    example: '54321',
    description: 'codigo da loja',
  })
  @IsString()
  storeCode: string;
}
