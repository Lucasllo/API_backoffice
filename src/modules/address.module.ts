import { Module } from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { AddressController } from '../controllers/address.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from 'src/entities/address.entity';

@Module({
  imports: [TypeOrmModule.forFeature([AddressEntity])],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
