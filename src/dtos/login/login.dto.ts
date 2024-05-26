import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsStrongPassword } from 'class-validator';

export class LoginAuthDto {
  @ApiProperty({
    example: 'joao@mail.com',
    description: 'Email do usuario',
  })
  @IsString()
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
  password: string;

  @ApiProperty({
    example: '2312',
    description: 'Codigo da empresa',
  })
  @IsString()
  storeCode: string;
}
