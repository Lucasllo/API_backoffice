import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { ProductEntity } from './product.entity';

@Entity({
  name: 'categoryEntity',
})
export class CategoryEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id?: number;

  @Column()
  name: string;

  @Column()
  description: string;

  @OneToMany(
    () => ProductEntity,
    (productEntity) => productEntity.categoryEntity,
  )
  productEntity: ProductEntity[];
}
