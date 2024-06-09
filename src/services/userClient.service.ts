import { Injectable } from '@nestjs/common';
import { UserClientRepository } from 'src/repositories/userClient.repository';

@Injectable()
export class UserClientService {
  constructor(private readonly userClientRepository: UserClientRepository) {}

  findAll() {
    return `This action returns all userClient`;
  }

  async getPhone(idUserClient: string) {
    return await this.userClientRepository.getPhone(+idUserClient);
  }

  findOne(id: number) {
    return `This action returns a #${id} userClient`;
  }

  remove(id: number) {
    return `This action removes a #${id} userClient`;
  }
}
