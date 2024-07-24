import { BadRequestException, Injectable } from '@nestjs/common';
import { DeliveryQueueRepository } from '../repositories/deliveryQueue.repository';
import { ShoppingService } from './shopping.service';
import { UserDeliveryService } from './userDelivery.service';
import { DeliveryQueueEntity } from 'src/entities/deliveryQueue.entity';
import { DeliveryStatus } from 'src/enums/deliveryStatus.enum';
import { solicitacaoCompraStatus } from 'src/enums/solicitacaoCompraStatus.enum';

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
      const shoppinggDelivery =
        await this.deliveryQueueRepository.findByShopping(idShopping);
      if (shoppinggDelivery.length <= 0) {
        const deliveryQueue = new DeliveryQueueEntity();
        deliveryQueue.createdAt = new Date();
        deliveryQueue.shoppingId = idShopping;
        deliveryQueue.userDeliveryId = idDelivery;
        deliveryQueue.status = DeliveryStatus.Waiting;
        this.deliveryQueueRepository.save(deliveryQueue);
      } else {
        throw new BadRequestException('Shopping já usado');
      }
    } else {
      throw new BadRequestException('Dados invalidos');
    }
  }

  findAllByUserDelivery(id: number) {
    return this.deliveryQueueRepository.findByUserDelivery(id);
  }

  async validateDelivery(idShopping: number, verificationCode: string) {
    const shopping = await this.shoppingService.findOne(idShopping);

    if (shopping != null) {
      if (shopping.verificationCode != verificationCode) {
        throw new BadRequestException('Dados invalidos');
      }

      const deliveryQueue = new DeliveryQueueEntity();
      deliveryQueue.updatedAt = new Date();
      deliveryQueue.status = DeliveryStatus.Finished;
      await this.deliveryQueueRepository.save(deliveryQueue);
      await this.shoppingService.updateStatus(
        solicitacaoCompraStatus.Concluded,
        shopping.id,
      );
    } else {
      throw new BadRequestException('Dados invalidos');
    }
  }

  // remove(id: number) {
  //   return `This action removes a #${id} deliveryqueue`;
  // }
}
