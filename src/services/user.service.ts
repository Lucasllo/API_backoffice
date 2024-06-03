import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { UserMapper } from 'src/mappers/user.mapper';
import { CreateUserDto } from 'src/dtos/user/createUser.dto';
import { UserEntity } from 'src/entities/user.entity';
import { LoginAuthDto } from '../dtos/login/login.dto';
import { ChangePasswordAuthDto } from 'src/dtos/password/changePasswordAuth.dto';
import { RecoverPasswordAuthDto } from 'src/dtos/password/recoverPasswordAuth.dto';
import * as bcrypt from 'bcrypt';
import { MailingService } from './mailingService';
import { UserQueryPaginateDto } from 'src/dtos/user/userQueryPaginate.dto';
import { UserDto } from 'src/dtos/user/user.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly mailingService: MailingService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.password != createUserDto.confirmPassword) {
      throw new BadRequestException('Senha e confirma senha diferentes');
    }

    const user: UserEntity = new UserEntity();
    user.storeCode = createUserDto.storeCode;
    user.password = await bcrypt.hash(
      createUserDto.password,
      await bcrypt.genSalt(),
    );
    user.role = createUserDto.role;
    user.name = createUserDto.name;
    user.email = createUserDto.email;
    user.createdAt = new Date();
    try {
      return this.userMapper.toDTO(await this.userRepository.create(user));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: UserQueryPaginateDto) {
    try {
      return this.userRepository.findAll(query);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async authorizeUser(code: number, user: UserDto) {
    try {
      return this.userRepository.authorizeUser(code, user.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async updatePassword(
    id: number,
    changePasswordAuthDto: ChangePasswordAuthDto,
  ) {
    if (
      changePasswordAuthDto.password != changePasswordAuthDto.confirmPassword
    ) {
      throw new BadRequestException('Senha invalida');
    }

    const updateUserDto = {
      password: changePasswordAuthDto.password,
    };

    return await this.userRepository.updatePassword(id, updateUserDto);
  }

  async findOne(id: number) {
    return this.userMapper.toDTO(await this.userRepository.findById(id));
  }

  async findbyId(id: number) {
    return await this.userRepository.findById(id);
  }

  async findByValidCode(validCode: number) {
    return await this.userRepository.findByValidCode(validCode);
  }

  async setValidCode(id: number, validCode: number) {
    return await this.userRepository.setValidCode(id, validCode);
  }

  login(loginAuthDto: LoginAuthDto) {
    return this.userRepository.login(loginAuthDto);
  }

  async recoverPassword(recoverPasswordAuthDto: RecoverPasswordAuthDto) {
    return await this.userRepository.findByEmail(recoverPasswordAuthDto.email);
  }
}
