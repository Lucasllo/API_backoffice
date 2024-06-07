import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginAuthDto } from 'src/dtos/login/login.dto';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserDeliveryEntity } from 'src/entities/userDelivery.entity';
import { UpdateUserDeliveryDto } from 'src/dtos/userDelivery/updateUserDelivery.dto';

@Injectable()
export class UserDeliveryRepository {
  constructor(
    @InjectRepository(UserDeliveryEntity)
    private readonly userDeliveryRepository: Repository<UserDeliveryEntity>,
  ) {}

  public async create(user: UserDeliveryEntity): Promise<UserDeliveryEntity> {
    return await this.userDeliveryRepository.save(user);
  }

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

  public async login({
    email,
    password,
  }: Partial<LoginAuthDto>): Promise<UserDeliveryEntity> {
    const user = await this.userDeliveryRepository.findOne({
      where: {
        email,
      },
    });

    if (user != null && (await bcrypt.compare(password, user.password))) {
      return user;
    } else {
      throw new UnauthorizedException('Email e/ou senha incorretos.');
    }
  }

  public async findByValidCode(validCode: number): Promise<UserDeliveryEntity> {
    const user = await this.userDeliveryRepository.findOne({
      where: {
        validCode,
      },
    });

    await this.userDeliveryRepository.update(
      {
        id: user.id,
      },
      { validCode: null },
    );

    return user;
  }

  public async setValidCode(
    id: number,
    validCode: number,
  ): Promise<UserDeliveryEntity> {
    const user = await this.userDeliveryRepository.findOne({
      where: {
        id,
      },
    });

    await this.userDeliveryRepository.update(
      {
        id: user.id,
      },
      { validCode: validCode },
    );

    return user;
  }

  public async updatePassword(
    id: number,
    userDeliveryDto: UpdateUserDeliveryDto,
  ): Promise<UserDeliveryEntity> {
    const user = await this.userDeliveryRepository.findOne({
      where: {
        id,
      },
    });
    user.password = userDeliveryDto.password;
    return this.userDeliveryRepository.save(user);
  }
}
