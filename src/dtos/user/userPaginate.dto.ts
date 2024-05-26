import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { UserEntity } from 'src/entities/user.entity';

export class UserPaginateDto {
  @ApiProperty({
    example: 'UserDto[]',
    description: 'Dados das compras',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserEntity)
  data: UserEntity[];

  @ApiProperty({
    example: '10',
    description: 'Quantidade total de dados',
  })
  @IsNumber()
  count: number;
}
