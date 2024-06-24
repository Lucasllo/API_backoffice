import { ProductDto } from 'src/dtos/product/product.dto';
import { ProductEntity } from 'src/entities/product.entity';

export class ProductMapper {
  toDTO(entity: ProductEntity): ProductDto {
    let dto: ProductDto = null;

    if (entity != null) {
      dto = new ProductDto();
      dto.name = entity.name;
      dto.price = entity.price;
      dto.deliveryTime = entity.shoppingEntity.deliveryTime;
      dto.deliveryAddress = entity.shoppingEntity.deliveryAddress;
      dto.value = entity.shoppingEntity.value;
      dto.modoPagamento = entity.shoppingEntity.modoPagamento;
      dto.id = entity.id;
    }

    return dto;
  }

  toEntity(dto: ProductDto): ProductEntity {
    let entity: ProductEntity = null;

    if (dto != null) {
      entity = new ProductEntity();
      entity.name = dto.name;
      entity.price = dto.price;
      entity.shoppingEntity.deliveryTime = dto.deliveryTime;
      entity.shoppingEntity.deliveryAddress = dto.deliveryAddress;
      entity.shoppingEntity.value = dto.value;
      entity.shoppingEntity.modoPagamento = dto.modoPagamento;
      if (dto.id) {
        entity.id = dto.id;
      }
    }

    return entity;
  }

  toListDTO(listEntity: ProductEntity[]): ProductDto[] {
    let dto: ProductDto[] = null;

    if (listEntity != null) {
      dto = listEntity.map((element) => {
        return this.toDTO(element);
      });
    }

    return dto;
  }

  toListEntity(listDto: ProductDto[]): ProductEntity[] {
    let entity: ProductEntity[] = null;

    if (listDto != null) {
      entity = listDto.map((element) => {
        return this.toEntity(element);
      });
    }

    return entity;
  }
}
