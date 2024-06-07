import { PartialType } from '@nestjs/swagger';
import { CreateDeliveryqueueDto } from './createDeliveryqueue.dto';

export class UpdateDeliveryqueueDto extends PartialType(
  CreateDeliveryqueueDto,
) {}
