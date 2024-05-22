import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'UserBackOffice' })
export class UserEntity {
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

  @Column({
    length: 127,
  })
  password: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({
    enum: [1, 2, 3, 4, 5],
  })
  role: number;

  @Column()
  userAuthorized: number;

  @Column({
    length: 11,
  })
  phone: string;

  @Column()
  code: string;

  @Column()
  active: boolean;
}
