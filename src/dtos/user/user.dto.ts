import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNumber,
  IsOptional,
  IsString,
  IsStrongPassword,
} from 'class-validator';

export class UserDto {
  @IsOptional()
  @IsNumber()
  id?: number;

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
    example: '123456',
    description:
      'Senha do usuario - Pelo menos 6 digitos, 1 numero, 1 simbolo, 1 letra maiuscula, 1 letra minuscula',
  })
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @IsString()
  password: string;

  @ApiProperty({
    example: '859123345678',
    description: 'telefone do usuario',
  })
  @IsString()
  phone: string;
}
