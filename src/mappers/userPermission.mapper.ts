import { UserPermissionDto } from 'src/dtos/user/userPermission.dto';
import { UserEntity } from 'src/entities/user.entity';

export class UserPermissionMapper {
  toDTO(entity: UserEntity): UserPermissionDto {
    let user: UserPermissionDto = null;

    if (entity != null) {
      user = new UserPermissionDto();
      user.email = entity.email;
      user.name = entity.name;
      user.createdAt = entity.createdAt;
      user.role = entity.role;
      user.id = entity.id;
    }

    return user;
  }

  toEntity(dto: UserPermissionDto): UserEntity {
    let user: UserEntity = null;

    if (dto != null) {
      user = new UserEntity();
      user.email = dto.email;
      user.name = dto.name;
      user.createdAt = dto.createdAt;
      user.role = dto.role;
      if (dto.id) {
        user.id = dto.id;
      }
    }

    return user;
  }

  toListDTO(listEntity: UserEntity[]): UserPermissionDto[] {
    let user: UserPermissionDto[] = null;

    if (listEntity != null) {
      user = listEntity.map((element) => {
        return this.toDTO(element);
      });
    }

    return user;
  }

  toListEntity(listDto: UserPermissionDto[]): UserEntity[] {
    let user: UserEntity[] = null;

    if (listDto != null) {
      user = listDto.map((element) => {
        return this.toEntity(element);
      });
    }

    return user;
  }
}
