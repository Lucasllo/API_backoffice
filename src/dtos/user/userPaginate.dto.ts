import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, ValidateNested } from 'class-validator';
import { UserPermissionDto } from './userPermission.dto';

export class UserPaginateDto {
  @ApiProperty({
    example: 'UserDto[]',
    description: 'Dados das compras',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserPermissionDto)
  data: UserPermissionDto[];

  @ApiProperty({
    example: '10',
    description: 'Quantidade total de dados',
  })
  @IsNumber()
  count: number;
}
