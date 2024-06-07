import { PartialType } from '@nestjs/swagger';
import { UserDeliveryDto } from './userDelivery.dto';

export class UpdateUserDeliveryDto extends PartialType(UserDeliveryDto) {}
