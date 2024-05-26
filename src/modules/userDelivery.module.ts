import { Module } from '@nestjs/common';
import { UserDeliveryService } from '../services/userDelivery.service';
import { UserDeliveryController } from '../controllers/userDelivery.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserDeliveryEntity } from 'src/entities/userDelivery.entity';
import { UserDeliveryRepository } from 'src/repositories/userDelivery.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserDeliveryEntity])],
  controllers: [UserDeliveryController],
  providers: [UserDeliveryService, UserDeliveryRepository],
})
export class UserDeliveryModule {}
