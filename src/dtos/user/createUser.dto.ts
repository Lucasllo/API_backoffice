import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDto {
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
    example: '123456',
    description:
      'Repetir senha do usuario - Pelo menos 6 digitos, 1 numero, 1 simbolo, 1 letra maiuscula, 1 letra minuscula',
  })
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  @IsString()
  confirmPassword: string;

  @ApiProperty({
    example: '1',
    description: 'Cargo do usuario',
  })
  @IsString()
  role: string;

  @ApiProperty({
    example: '111241',
    description: 'Codigo da farmacia',
  })
  @IsString()
  storeCode: string;
}
