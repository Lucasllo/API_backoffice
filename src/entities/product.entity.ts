import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { ShoppingEntity } from './shopping.entity';
import { CategoryEntity } from './category.entity';

@Entity({
  name: 'product',
})
export class ProductEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id?: number;

  @Column()
  description: string;

  @Column()
  price: string;

  @Column()
  kind: string;

  @Column()
  discount: boolean;

  @Column()
  amount: number;

  @Column()
  image: string;

  @Column()
  name: string;

  @ManyToOne(
    () => CategoryEntity,
    (categoryEntity) => categoryEntity.productEntity,
  )
  categoryEntity: CategoryEntity;

  @ManyToOne(
    () => ShoppingEntity,
    (shoppingEntity) => shoppingEntity.productEntity,
    {
      eager: true,
    },
  )
  shoppingEntity: ShoppingEntity;
}
