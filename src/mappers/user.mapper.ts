import { UserDto } from 'src/dtos/user.dto';
import { UserEntity } from 'src/entities/user.entity';

export class UserMapper {
  toDTO(entity: UserEntity): UserDto {
    let user = null;

    if (entity != null) {
      user = new UserDto();
      user.email = entity.email;
      user.name = entity.name;
      user.password = entity.password;
      user.phone = entity.phone;
    }

    return user;
  }

  toEntity(dto: UserDto): UserEntity {
    let user: UserEntity = null;

    if (dto != null) {
      user = new UserEntity();
      user.email = dto.email;
      user.name = dto.name;
      user.password = dto.password;
      user.phone = dto.phone;
      if (dto.id) {
        user.id = dto.id;
      }
    }

    return user;
  }

  toListDTO(listEntity: UserEntity[]): UserDto[] {
    let user: UserDto[] = null;

    if (listEntity != null) {
      user = listEntity.map((element) => {
        return this.toDTO(element);
      });
    }

    return user;
  }

  toListEntity(listDto: UserDto[]): UserEntity[] {
    let user: UserEntity[] = null;

    if (listDto != null) {
      user = listDto.map((element) => {
        return this.toEntity(element);
      });
    }

    return user;
  }
}
