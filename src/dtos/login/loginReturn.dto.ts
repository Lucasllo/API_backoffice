import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginReturnDto {
  @ApiProperty({
    example: '213423',
    description: 'Codigo da Farmacia',
  })
  @IsString()
  code: string;

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
}
