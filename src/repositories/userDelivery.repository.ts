import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginAuthDto } from 'src/dtos/login/login.dto';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/dtos/user/updateUser.dto';
import { UserDeliveryEntity } from 'src/entities/userDelivery.entity';
import { CreateUserDeliveryDto } from 'src/dtos/user/createUserDelivery.dto';

@Injectable()
export class UserDeliveryRepository {
  constructor(
    @InjectRepository(UserDeliveryEntity)
    private readonly userDeliveryRepository: Repository<UserDeliveryEntity>,
  ) {}

  public async create(user: UserDeliveryEntity): Promise<UserDeliveryEntity> {
    return await this.userDeliveryRepository.save(user);
  }

  // public async updatePassword(
  //   id: number,
  //   userDto: UpdateUserDto,
  // ): Promise<UserDeliveryEntity> {
  //   const user = await this.userDeliveryRepository.findOne({
  //     where: {
  //       id,
  //     },
  //   });
  //   user.password = userDto.password;
  //   return this.userDeliveryRepository.save(user);
  // }

  public async findById(id: number): Promise<UserDeliveryEntity> {
    return this.userDeliveryRepository.findOne({
      where: {
        id,
      },
    });
  }

  public async findByEmail(email: string): Promise<UserDeliveryEntity> {
    return this.userDeliveryRepository.findOne({
      where: {
        email,
      },
    });
  }

  // public async login({
  //   email,
  //   password,
  //   storeCode,
  // }: LoginAuthDto): Promise<UserEntity> {
  //   const user = await this.userDeliveryRepository.findOne({
  //     where: {
  //       email,
  //       storeCode,
  //     },
  //   });

  //   if (user != null && (await bcrypt.compare(password, user.password))) {
  //     return user;
  //   } else {
  //     throw new UnauthorizedException('Email e/ou senha incorretos.');
  //   }
  // }
}
