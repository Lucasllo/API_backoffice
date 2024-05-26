import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateUserDeliveryDto } from 'src/dtos/user/createUserDelivery.dto';
import { UserDeliveryEntity } from 'src/entities/userDelivery.entity';
import { Role } from 'src/enums/role.enum';
import { UserDeliveryRepository } from 'src/repositories/userDelivery.repository';

@Injectable()
export class UserDeliveryService {
  constructor(
    private readonly userDeliveryRepository: UserDeliveryRepository,
  ) {}

  create(createUserDeliveryDto: CreateUserDeliveryDto) {
    // if (createUserDeliveryDto.password != createUserDeliveryDto.confirmPassword) {
    //   throw new BadRequestException('Senha e confirma senha diferentes');
    // }

    const user: UserDeliveryEntity = new UserDeliveryEntity();
    // user.password = await bcrypt.hash(
    //   createUserDto.password,
    //   await bcrypt.genSalt(),
    // );
    user.numberVehicle = createUserDeliveryDto.numberVehicle;
    user.cpf = createUserDeliveryDto.cpf;
    user.phoneNumber = createUserDeliveryDto.phoneNumber;
    user.acceptTerms = createUserDeliveryDto.acceptTerms;
    user.role = Role.MotoBoy;
    user.email = createUserDeliveryDto.email;
    user.createdAt = new Date();
    try {
      return this.userDeliveryRepository.create(user);
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  findAll() {
    return `This action returns all userDelivery`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userDelivery`;
  }

  remove(id: number) {
    return `This action removes a #${id} userDelivery`;
  }
}
