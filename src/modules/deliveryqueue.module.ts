import { Module } from '@nestjs/common';
import { DeliveryqueueService } from '../services/deliveryqueue.service';
import { DeliveryqueueController } from 'src/controllers/deliveryqueue.controller';
import { DeliveryQueueEntity } from 'src/entities/deliveryQueue.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryQueueRepository } from 'src/repositories/deliveryQueue.repository';
import { ShoppingModule } from './shopping.module';
import { UserDeliveryModule } from './userDelivery.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DeliveryQueueEntity]),
    ShoppingModule,
    UserDeliveryModule,
  ],
  controllers: [DeliveryqueueController],
  providers: [DeliveryqueueService, DeliveryQueueRepository],
})
export class DeliveryqueueModule {}
