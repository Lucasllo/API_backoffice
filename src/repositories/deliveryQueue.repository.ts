import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeliveryQueueEntity } from 'src/entities/deliveryQueue.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DeliveryQueueRepository {
  constructor(
    @InjectRepository(DeliveryQueueEntity)
    private readonly deliveryQueueRepository: Repository<DeliveryQueueEntity>,
  ) {}

  public async save(deliveryQueueEntity: DeliveryQueueEntity) {
    return await this.deliveryQueueRepository.save(deliveryQueueEntity);
  }

  public async findByUserDelivery(id: number) {
    return await this.deliveryQueueRepository.find({
      relations: ['shoppingEntity'],
      where: {
        userDeliveryId: id,
      },
    });
  }
}
