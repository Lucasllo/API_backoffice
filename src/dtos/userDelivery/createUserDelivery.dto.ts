import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsStrongPassword } from 'class-validator';

export class CreateUserDeliveryDto {
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
    example: '12345678911',
    description: 'CPF do usuario',
  })
  @IsString()
  cpf: string;

  @ApiProperty({
    example: 'ASQ8994',
    description: 'Placa do veiculo do usuario',
  })
  @IsString()
  numberVehicle: string;

  @ApiProperty({
    example: '85999999999',
    description: 'Telefone do usuario',
  })
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    example: 'true',
    description: 'Aceite termos de uso',
  })
  @IsBoolean()
  acceptTerms: boolean;
}
