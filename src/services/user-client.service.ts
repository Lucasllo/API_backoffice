import { Injectable } from '@nestjs/common';
import { CreateUserClientDto } from '../user-client/dto/create-user-client.dto';
import { UpdateUserClientDto } from '../user-client/dto/update-user-client.dto';

@Injectable()
export class UserClientService {
  create(createUserClientDto: CreateUserClientDto) {
    return 'This action adds a new userClient';
  }

  findAll() {
    return `This action returns all userClient`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userClient`;
  }

  update(id: number, updateUserClientDto: UpdateUserClientDto) {
    return `This action updates a #${id} userClient`;
  }

  remove(id: number) {
    return `This action removes a #${id} userClient`;
  }
}
