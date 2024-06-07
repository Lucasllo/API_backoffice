import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { DeliveryqueueService } from '../services/deliveryqueue.service';
import { UpdateDeliveryqueueDto } from '../dtos/deliveryqueue/updateDeliveryqueue.dto';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { Delivery } from 'src/decorators/delivery.decorator';
import { UserDeliveryDto } from 'src/dtos/userDelivery/userDelivery.dto';

@Controller('deliveryqueue')
export class DeliveryqueueController {
  constructor(private readonly deliveryqueueService: DeliveryqueueService) {}

  @Roles(Role.MotoBoy)
  @Post(':idShopping/:idDelivery')
  create(
    @Param('idShopping') idShopping: string,
    @Param('idDelivery') idDelivery: string,
  ) {
    return this.deliveryqueueService.create(+idShopping, +idDelivery);
  }

  @Get()
  findAll() {
    return this.deliveryqueueService.findAll();
  }

  @Roles(Role.MotoBoy)
  @Get('findByUserDelivery')
  findAllByUserDelivery(@Delivery() userDelivery: UserDeliveryDto) {
    return this.deliveryqueueService.findAllByUserDelivery(userDelivery.id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeliveryqueueDto: UpdateDeliveryqueueDto,
  ) {
    return this.deliveryqueueService.update(+id, updateDeliveryqueueDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deliveryqueueService.remove(+id);
  }
}
