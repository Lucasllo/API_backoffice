import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ProductEntity } from './product.entity';
import { solicitacaoCompraStatus } from 'src/enums/solicitacaoCompraStatus.enum';
import { modoPagamento } from 'src/enums/modoPagamento.enum';
import { UserClientEntity } from './userClient.entity';
import { DeliveryQueueEntity } from './deliveryQueue.entity';

@Entity({
  name: 'shoppings',
})
export class ShoppingEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

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
  storeCode: string;

  @Column()
  value: string;

  @Column({
    default: modoPagamento.Credit,
  })
  modoPagamento: number;

  @Column({ name: 'userEntityId' })
  userClientId: number;

  @OneToMany(
    () => ProductEntity,
    (productEntity) => productEntity.shoppingEntity,
    {
      cascade: true,
    },
  )
  productEntity: ProductEntity[];

  @ManyToOne(
    () => UserClientEntity,
    (userClientEntity) => userClientEntity.shoppingEntity,
    {},
  )
  @JoinColumn({ name: 'userEntityId' })
  userClientEntity: UserClientEntity;

  @OneToOne(
    () => DeliveryQueueEntity,
    (deliveryQueueEntity) => deliveryQueueEntity.shoppingEntity,
    {},
  )
  deliveryQueueEntity: DeliveryQueueEntity;
}
