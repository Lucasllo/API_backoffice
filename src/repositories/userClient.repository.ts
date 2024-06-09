import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserClientEntity } from 'src/entities/userClient.entity';
import { UserClientPhoneDto } from 'src/dtos/userClient/userClientPhone.dto';

@Injectable()
export class UserClientRepository {
  constructor(
    @InjectRepository(UserClientEntity)
    private readonly userClientRepository: Repository<UserClientEntity>,
  ) {}

  public async getPhone(id: number): Promise<UserClientPhoneDto> {
    const user = await this.userClientRepository.findOne({
      where: {
        id,
      },
    });

    if (user != null) {
      return { phone: user.numero };
    } else {
      throw new BadRequestException('Dado Invalido!');
    }
  }
}
