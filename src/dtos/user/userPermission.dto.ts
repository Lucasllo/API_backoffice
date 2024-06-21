import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsEmail, IsNumber, IsString } from 'class-validator';

export class UserPermissionDto {
  @IsNumber()
  id: number;

  @ApiProperty({
    example: 'joao',
    description: 'Nome do usuario',
  })
  @IsString()
  name: string;

  @ApiProperty({
    example: 'joao@mail.com',
    description: 'Email do usuario',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: '2024-06-10T22:36:10.000Z',
    description: 'Data de criação do usuario',
  })
  @IsDate()
  createdAt: Date;

  @IsString()
  role: string;
}
