import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class LoginReturnDto {
  @ApiProperty({
    example: '213423',
    description: 'Codigo da Farmacia',
  })
  @IsString()
  code?: string;

  @ApiProperty({
    example: '1',
    description: 'Codigo da Papel do usuario',
  })
  @IsString()
  role: string;

  @ApiProperty({
    example: 'pqolwjkkn123kxpoqwdiop.lknasdlknqw.zpxcpbtg',
    description: 'Token JWT',
  })
  @IsString()
  token: string;

  @ApiProperty({
    example: '1',
    description: 'Id do usuario',
  })
  @IsNumber()
  id?: number;

  @ApiProperty({
    example: 'João',
    description: 'Nome do usuario',
  })
  @IsString()
  name?: string;
}
