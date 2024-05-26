import { Injectable } from '@nestjs/common';

@Injectable()
export class UserClientService {
  findAll() {
    return `This action returns all userClient`;
  }

  findOne(id: number) {
    return `This action returns a #${id} userClient`;
  }

  remove(id: number) {
    return `This action removes a #${id} userClient`;
  }
}
