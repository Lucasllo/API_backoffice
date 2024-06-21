import { ShoppingDto } from 'src/dtos/shopping/shopping.dto';
import { ShoppingEntity } from 'src/entities/shopping.entity';

export class ShoppingMapper {
  toDTO(entity: ShoppingEntity): ShoppingDto {
    let dto: ShoppingDto = null;

    if (entity != null) {
      dto = new ShoppingDto();
      dto.userClientName = entity.userClientEntity.name;
      dto.deliveryTime = entity.deliveryTime;
      dto.value = entity.value;
      dto.status = entity.status;
      dto.modoPagamento = entity.modoPagamento;
      dto.id = entity.id;
    }

    return dto;
  }

  toEntity(dto: ShoppingDto): ShoppingEntity {
    let entity: ShoppingEntity = null;

    if (dto != null) {
      entity = new ShoppingEntity();
      entity.userClientEntity.name = dto.userClientName;
      entity.deliveryTime = dto.deliveryTime;
      entity.value = dto.value;
      entity.status = dto.status;
      entity.modoPagamento = dto.modoPagamento;
      if (dto.id) {
        entity.id = dto.id;
      }
    }

    return entity;
  }

  toListDTO(listEntity: ShoppingEntity[]): ShoppingDto[] {
    let dto: ShoppingDto[] = null;

    if (listEntity != null) {
      dto = listEntity.map((element) => {
        return this.toDTO(element);
      });
    }

    return dto;
  }

  toListEntity(listDto: ShoppingDto[]): ShoppingEntity[] {
    let entity: ShoppingEntity[] = null;

    if (listDto != null) {
      entity = listDto.map((element) => {
        return this.toEntity(element);
      });
    }

    return entity;
  }
}
