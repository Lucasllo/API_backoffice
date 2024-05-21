import { Injectable } from '@nestjs/common';
import { CreateCardDto } from '../card/dto/create-card.dto';
import { UpdateCardDto } from '../card/dto/update-card.dto';

@Injectable()
export class CardService {
  create(createCardDto: CreateCardDto) {
    return 'This action adds a new card';
  }

  findAll() {
    return `This action returns all card`;
  }

  findOne(id: number) {
    return `This action returns a #${id} card`;
  }

  update(id: number, updateCardDto: UpdateCardDto) {
    return `This action updates a #${id} card`;
  }

  remove(id: number) {
    return `This action removes a #${id} card`;
  }
}
