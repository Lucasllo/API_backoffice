import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { UserMapper } from 'src/mappers/user.mapper';
import { CreateUserDto } from 'src/dtos/createUser.dto';
import { UserEntity } from 'src/entities/user.entity';
import { LoginAuthDto } from '../dtos/login.dto';
import { ChangePasswordAuthDto } from 'src/dtos/changePasswordAuth.dto';
import { RecoverPasswordAuthDto } from 'src/dtos/recoverPasswordAuth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
  ) {}

  async create(createUserDto: CreateUserDto) {
    if (createUserDto.password != createUserDto.confirmPassword) {
      throw new BadRequestException('Senha e confirma senha diferentes');
    }

    const user: UserEntity = new UserEntity();
    user.code = createUserDto.code;
    user.password = await bcrypt.hash(
      createUserDto.password,
      await bcrypt.genSalt(),
    );
    user.role = createUserDto.role;
    user.name = createUserDto.name;
    user.email = createUserDto.email;

    return await this.userRepository.create(user);
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

  login(loginAuthDto: LoginAuthDto) {
    return this.userRepository.login(loginAuthDto);
  }

  async recoverPassword(recoverPasswordAuthDto: RecoverPasswordAuthDto) {
    return await this.userRepository.findByEmail(recoverPasswordAuthDto.email);
  }
}
