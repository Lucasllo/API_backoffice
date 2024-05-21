import { Module } from '@nestjs/common';
import { AddressService } from '../services/address.service';
import { AddressController } from '../controllers/address.controller';

@Module({
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}
