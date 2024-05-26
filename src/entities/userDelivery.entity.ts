import { Role } from 'src/enums/role.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'userdelivery' })
export class UserDeliveryEntity {
  @PrimaryGeneratedColumn({
    unsigned: true,
  })
  id: number;

  @Column({
    length: 63,
  })
  name: string;

  @Column({
    length: 127,
    unique: true,
  })
  email: string;

  @Column()
  validatedEmail: boolean;

  // @Column({
  //   length: 127,
  // })
  // password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    enum: [Role],
  })
  role: string;

  @Column({
    length: 11,
  })
  phoneNumber: string;

  @Column({
    length: 11,
  })
  cpf: string;

  @Column()
  numberVehicle: string;

  @Column()
  acceptTerms: boolean;

  @Column({ default: false })
  active: boolean;
}
