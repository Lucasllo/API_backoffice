import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDeliveryDto } from 'src/dtos/userDelivery/createUserDelivery.dto';
import { UserDeliveryEntity } from 'src/entities/userDelivery.entity';
import { Role } from 'src/enums/role.enum';
import { UserDeliveryRepository } from 'src/repositories/userDelivery.repository';
import * as bcrypt from 'bcrypt';
import { LoginAuthDto } from 'src/dtos/login/login.dto';
import { ChangePasswordAuthDto } from 'src/dtos/password/changePasswordAuth.dto';
import { RecoverPasswordAuthDto } from 'src/dtos/password/recoverPasswordAuth.dto';
import { UserDeliveryDto } from 'src/dtos/userDelivery/userDelivery.dto';

@Injectable()
export class UserDeliveryService {
  constructor(
    private readonly userDeliveryRepository: UserDeliveryRepository,
  ) {}

  async create(createUserDeliveryDto: CreateUserDeliveryDto) {
    if (
      createUserDeliveryDto.password != createUserDeliveryDto.confirmPassword
    ) {
      throw new BadRequestException('Senha e confirma senha diferentes');
    }

    const user: UserDeliveryEntity = new UserDeliveryEntity();
    user.password = await bcrypt.hash(
      createUserDeliveryDto.password,
      await bcrypt.genSalt(),
    );
    user.numberVehicle = createUserDeliveryDto.numberVehicle;
    user.cpf = createUserDeliveryDto.cpf;
    user.phoneNumber = createUserDeliveryDto.phoneNumber;
    user.acceptTerms = createUserDeliveryDto.acceptTerms;
    user.role = Role.MotoBoy;
    user.email = createUserDeliveryDto.email;
    user.createdAt = new Date();
    try {
      return await this.userDeliveryRepository.create(user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async login(loginAuthDto: LoginAuthDto) {
    return await this.userDeliveryRepository.login(loginAuthDto);
  }

  async findOne(id: number) {
    const user = await this.userDeliveryRepository.findById(id);
    const userDelivery = new UserDeliveryDto();
    userDelivery.email = user.email;
    userDelivery.id = user.id;
    userDelivery.name = user.name;
    userDelivery.phone = user.phoneNumber;

    return userDelivery;
  }

  async findByValidCode(validCode: number) {
    return await this.userDeliveryRepository.findByValidCode(validCode);
  }

  async setValidCode(id: number, validCode: number) {
    return await this.userDeliveryRepository.setValidCode(id, validCode);
  }

  async recoverPassword(recoverPasswordAuthDto: RecoverPasswordAuthDto) {
    return await this.userDeliveryRepository.findByEmail(
      recoverPasswordAuthDto.email,
    );
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

    const updateUserDeliveryDto = {
      password: changePasswordAuthDto.password,
    };

    return await this.userDeliveryRepository.updatePassword(
      id,
      updateUserDeliveryDto,
    );
  }

  remove(id: number) {
    return `This action removes a #${id} userDelivery`;
  }
}
