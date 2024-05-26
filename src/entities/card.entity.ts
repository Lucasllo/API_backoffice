import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { tipoCartao } from 'src/enums/tipoCartao.enum';
import { UserClientEntity } from './userClient.entity';

@Entity({
  name: 'cards',
})
export class CardEntity {
  @PrimaryGeneratedColumn({})
  id: number;

  @Column()
  cardNumber: string;

  @Column()
  expirationDate: string;

  @Column()
  cvv: string;

  @Column()
  cpf_cnpj: string;

  @Column()
  cardNickname: string;

  @Column()
  name: string;

  @Column({
    default: tipoCartao.Credit,
  })
  type: number;

  @ManyToOne(() => UserClientEntity, (userEntity) => userEntity.cardEntity, {
    eager: true,
    cascade: true,
  })
  @JoinColumn({ name: 'userEntityId' })
  userEntity: UserClientEntity;
}
