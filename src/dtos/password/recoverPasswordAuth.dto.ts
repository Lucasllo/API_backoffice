import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class RecoverPasswordAuthDto {
  @ApiProperty({
    example: 'joao@mail.com',
    description: 'Email do usuario',
  })
  @IsString()
  email: string;
}
