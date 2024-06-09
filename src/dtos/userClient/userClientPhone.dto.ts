import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class UserClientPhoneDto {
  @ApiProperty({
    example: '859123345678',
    description: 'telefone do usuario',
  })
  @IsString()
  phone: string;
}
