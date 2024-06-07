import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
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

  @Column({ name: 'categoryEntityId' })
  categoryId: number;

  @Column({ name: 'shoppingEntityId' })
  shoppingId: number;

  @Column()
  storeCode: string;

  @ManyToOne(
    () => CategoryEntity,
    (categoryEntity) => categoryEntity.productEntity,
  )
  @JoinColumn({ name: 'categoryEntityId' })
  categoryEntity: CategoryEntity;

  @ManyToOne(
    () => ShoppingEntity,
    (shoppingEntity) => shoppingEntity.productEntity,
  )
  @JoinColumn({ name: 'shoppingEntityId' })
  shoppingEntity: ShoppingEntity;
}
