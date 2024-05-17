import { Injectable } from '@nestjs/common';
import { LoginAuthDto } from '../dtos/login.dto';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(private readonly userservice: UserService) {}

  create(loginAuthDto: LoginAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
