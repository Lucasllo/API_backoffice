import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UserClientEntity } from './userClient.entity';

@Entity({
  name: 'address',
})
export class AddressEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id?: number;

  @Column()
  logradouro: string;

  @Column()
  numero: string;

  @Column()
  bairro: string;

  @Column()
  cep: string;

  @Column()
  cidade: string;

  @Column()
  complemento: string;

  @Column()
  pontoReferencia: string;

  @ManyToOne(() => UserClientEntity, (user) => user.addressEntity)
  userEntity: UserClientEntity;
}
