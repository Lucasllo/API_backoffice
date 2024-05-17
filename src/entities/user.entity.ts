import { Transform } from 'class-transformer';
import { UserDto } from 'src/dtos/user.dto';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
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
  createdAt: string;

  @UpdateDateColumn()
  updatedAt: string;

  @Column({
    enum: [1, 2, 3, 4],
  })
  role: number;

  @Transform(() => UserDto)
  toDto(): UserDto {
    return {
      name: this.name,
      email: this.email,
      password: this.password,
    };
  }
}
