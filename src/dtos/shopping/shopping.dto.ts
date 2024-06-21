import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class ShoppingDto {
  @ApiProperty({
    example: '123',
    description: 'Id do pedido',
  })
  @IsNumber()
  id: number;

  @ApiProperty({
    example: 'Joao',
    description: 'Nome do solicitante do pedido',
  })
  @IsString()
  userClientName: string;

  @ApiProperty({
    example: '12:00:00',
    description: 'Hora do pedido',
  })
  @IsString()
  deliveryTime: string;

  @ApiProperty({
    example: '150',
    description: 'Total do pedido',
  })
  @IsString()
  value: string;

  @ApiProperty({
    example: '1',
    description: 'Status do pedido',
  })
  @IsNumber()
  status: number;

  @ApiProperty({
    example: '1',
    description: 'Modo de pagamento',
  })
  @IsNumber()
  modoPagamento: number;
}
