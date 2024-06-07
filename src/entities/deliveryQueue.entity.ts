import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  OneToOne,
} from 'typeorm';
import { ShoppingEntity } from './shopping.entity';
import { UserDeliveryEntity } from './userDelivery.entity';
import { DeliveryStatus } from 'src/enums/deliveryStatus.enum';

@Entity({
  name: 'deliveryqueue',
})
export class DeliveryQueueEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @Column({
    default: DeliveryStatus.Waiting,
  })
  status: number;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ name: 'userDeliveryId' })
  userDeliveryId: number;

  @Column({ name: 'shoppingId' })
  shoppingId: number;

  @ManyToOne(
    () => UserDeliveryEntity,
    (userDeliveryEntity) => userDeliveryEntity.deliveryQueueEntity,
  )
  @JoinColumn({ name: 'userDeliveryId' })
  userDeliveryEntity: UserDeliveryEntity;

  @OneToOne(
    () => ShoppingEntity,
    (shoppingEntity) => shoppingEntity.deliveryQueueEntity,
  )
  @JoinColumn({ name: 'shoppingId' })
  shoppingEntity: ShoppingEntity;
}
