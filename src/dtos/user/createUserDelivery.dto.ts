import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateUserDeliveryDto {
  @ApiProperty({
    example: 'joao@mail.com',
    description: 'Email do usuario',
  })
  @IsString()
  email: string;

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
