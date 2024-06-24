import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ProductDto {
  @ApiProperty({
    example: '123',
    description: 'Id do pedido',
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: 'Sabonete',
    description: 'Nome do produto',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: '12',
    description: 'Preço do produto',
  })
  @IsString()
  price: string;

  @ApiProperty({
    example: '12:00:00',
    description: 'Hora do pedido',
  })
  @IsString()
  deliveryTime: string;

  @ApiProperty({
    example: 'Professor vicente Silveira',
    description: 'Endereço do pedido',
  })
  @IsString()
  deliveryAddress: string;

  @ApiProperty({
    example: '150',
    description: 'Total do pedido',
  })
  @IsString()
  value: string;

  @ApiProperty({
    example: '1',
    description: 'Modo de pagamento',
  })
  @IsNumber()
  modoPagamento: number;
}
