import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { solicitacaoCompraStatus } from 'src/enums/solicitacaoCompraStatus.enum';
import { modoPagamento } from 'src/enums/modoPagamento.enum';
import { UserClientEntity } from './userClient.entity';

@Entity({
  name: 'shoppings',
})
export class ShoppingEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id?: number;

  @Column()
  storeAddress: string;

  @Column()
  deliveryAddress: string;

  @Column()
  deliveryTime: string;

  @Column()
  duration: string;

  @Column({
    default: solicitacaoCompraStatus.Created,
  })
  status: number;

  @Column()
  verificationCode: string;

  @Column()
  value: string;

  @Column({
    default: modoPagamento.Credit,
  })
  modoPagamento: number;

  @OneToMany(
    () => ProductEntity,
    (productEntity) => productEntity.shoppingEntity,
    {
      cascade: true,
    },
  )
  @JoinTable()
  productEntity: ProductEntity[];

  @ManyToOne(
    () => UserClientEntity,
    (userEntity) => userEntity.shoppingEntity,
    {},
  )
  userEntity: UserClientEntity;
}
