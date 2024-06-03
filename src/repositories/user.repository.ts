import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LoginAuthDto } from 'src/dtos/login/login.dto';
import { UserEntity } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from 'src/dtos/user/updateUser.dto';
import { UserPaginateDto } from 'src/dtos/user/userPaginate.dto';
import { UserQueryPaginateDto } from 'src/dtos/user/userQueryPaginate.dto';

@Injectable()
export class UserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  public async create(user: UserEntity): Promise<UserEntity> {
    const newUser = await this.userRepository.findOne({
      where: {
        email: user.email,
        storeCode: user.storeCode,
      },
    });

    if (newUser == null) {
      return await this.userRepository.save(user);
    } else {
      throw new BadRequestException('Email invalido.');
    }
  }

  public async updatePassword(
    id: number,
    userDto: UpdateUserDto,
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });
    user.password = userDto.password;
    return this.userRepository.save(user);
  }

  public async findById(id: number): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: {
        id,
      },
    });
  }

  public async findByValidCode(validCode: number): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        validCode,
      },
    });

    await this.userRepository.update(
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
  ): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    await this.userRepository.update(
      {
        id: user.id,
      },
      { validCode: validCode },
    );

    return user;
  }

  public async findAll(query: UserQueryPaginateDto): Promise<UserPaginateDto> {
    const take = query.take || 10;
    const skip = query.skip || 0;
    const order = query.orderBy || { id: 'DESC' };
    const storeCode = query.storeCode;

    const [result, total] = await this.userRepository.findAndCount({
      where: { storeCode },
      order,
      take: take,
      skip: skip,
    });

    return {
      data: result,
      count: total,
    };
  }

  public async authorizeUser(id: number, Userid: number) {
    const userUpdated = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userUpdated) {
      throw new BadRequestException('Codigo invalido.');
    }

    await this.userRepository.update(
      {
        id,
      },
      { active: true, userAuthorized: Userid },
    );
  }

  public findByEmail(email: string): Promise<UserEntity> {
    return this.userRepository.findOne({
      where: {
        email,
      },
    });
  }

  public async login({
    email,
    password,
    storeCode,
  }: LoginAuthDto): Promise<UserEntity> {
    const user = await this.userRepository.findOne({
      where: {
        email,
        storeCode,
        authorized: true,
      },
    });

    if (user != null && (await bcrypt.compare(password, user.password))) {
      return user;
    } else {
      throw new UnauthorizedException('Email e/ou senha incorretos.');
    }
  }
}
