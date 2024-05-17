import { UserDto } from 'src/dtos/user.dto';
import { User } from 'src/entities/user.entity';

export class UserMapper {
  toDTO(entity: User): UserDto {
    if (entity == null) {
      return null;
    }

    const user = new UserDto();
    user.email = entity.email;
    user.name = entity.name;
    user.password = entity.password;

    return user;
  }

  toEntity(dto: UserDto): User {
    if (dto == null) {
      return null;
    }

    const user = new User();
    user.email = dto.email;
    user.name = dto.name;
    user.password = dto.password;

    return user;
  }
}
