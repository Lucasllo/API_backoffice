import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateDeliveryqueueDto } from '../dtos/deliveryqueue/updateDeliveryqueue.dto';
import { DeliveryQueueRepository } from '../repositories/deliveryQueue.repository';
import { ShoppingService } from './shopping.service';
import { UserDeliveryService } from './userDelivery.service';
import { DeliveryQueueEntity } from 'src/entities/deliveryQueue.entity';

@Injectable()
export class DeliveryqueueService {
  constructor(
    private readonly deliveryQueueRepository: DeliveryQueueRepository,
    private readonly shoppingService: ShoppingService,
    private readonly userDeliveryService: UserDeliveryService,
  ) {}

  async create(idShopping: number, idDelivery: number) {
    const shopping = await this.shoppingService.findOne(idShopping);
    const delivery = await this.userDeliveryService.findOne(idDelivery);

    if (shopping != null && delivery != null) {
      const deliveryQueue = new DeliveryQueueEntity();
      deliveryQueue.createdAt = new Date();
      deliveryQueue.shoppingId = idShopping;
      deliveryQueue.userDeliveryId = idDelivery;
      this.deliveryQueueRepository.save(deliveryQueue);
    } else {
      throw new BadRequestException('Dados invalidos');
    }
  }

  findAll() {
    return `This action returns all deliveryqueue`;
  }

  findAllByUserDelivery(id: number) {
    return this.deliveryQueueRepository.findByUserDelivery(id);
  }

  update(id: number, updateDeliveryqueueDto: UpdateDeliveryqueueDto) {
    return `This action updates a #${id} deliveryqueue`;
  }

  remove(id: number) {
    return `This action removes a #${id} deliveryqueue`;
  }
}
