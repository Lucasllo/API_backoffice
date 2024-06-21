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
import { Role } from 'src/enums/role.enum';
import { UserPermissionMapper } from 'src/mappers/userPermission.mapper';
import { UserPaginateDto } from 'src/dtos/user/userPaginate.dto';

@Injectable()
export class UserService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly userMapper: UserMapper,
    private readonly mailingService: MailingService,
    private readonly userPermissionMapper: UserPermissionMapper,
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
    user.role = Role.User;
    user.name = createUserDto.name;
    user.email = createUserDto.email;
    user.createdAt = new Date();

    //envio de email para validar Email do usuario

    try {
      return this.userMapper.toDTO(await this.userRepository.create(user));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async findAll(query: UserQueryPaginateDto) {
    try {
      const dados = await this.userRepository.findAll(query);
      this.userPermissionMapper.toListDTO(dados.data);

      const retorno: UserPaginateDto = new UserPaginateDto();
      retorno.count = dados.count;
      retorno.data = this.userPermissionMapper.toListDTO(dados.data);

      return retorno;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async authorizeUser(code: number, user: UserDto) {
    try {
      return await this.userRepository.authorizeUser(code, user.id);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async changeRoleUser(code: number, role: string) {
    try {
      const roles = Object.values(Role).filter((r) => r == role);

      if (
        roles.length == 1 &&
        (roles[0] == Role.Admin || roles[0] == Role.User)
      ) {
        return this.userRepository.changeRoleUser(code, roles[0]);
      } else {
        throw new BadRequestException('Papel invalido!');
      }
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

  delete(id: number) {
    this.userRepository.delete(id);
  }
}
