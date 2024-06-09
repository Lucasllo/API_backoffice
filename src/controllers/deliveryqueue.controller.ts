import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { DeliveryqueueService } from '../services/deliveryqueue.service';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { Delivery } from 'src/decorators/delivery.decorator';
import { UserDeliveryDto } from 'src/dtos/userDelivery/userDelivery.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guard/role.guard';

@Roles(Role.Delivery)
@UseGuards(RoleGuard)
@ApiTags('Delivery Queue')
@Controller('deliveryqueue')
export class DeliveryqueueController {
  constructor(private readonly deliveryqueueService: DeliveryqueueService) {}

  @Post(':idShopping')
  @ApiBearerAuth('access-token')
  create(
    @Param('idShopping') idShopping: string,
    @Delivery() userDelivery: UserDeliveryDto,
  ) {
    return this.deliveryqueueService.create(+idShopping, userDelivery.id);
  }

  @Get('findByUserDelivery')
  @ApiBearerAuth('access-token')
  findAllByUserDelivery(@Delivery() userDelivery: UserDeliveryDto) {
    return this.deliveryqueueService.findAllByUserDelivery(userDelivery.id);
  }

  @Post('validateDelivery/:idShopping/:codeShopping')
  @ApiBearerAuth('access-token')
  validateDelivery(
    @Param('idShopping') idShopping: string,
    @Param('codeShopping') verificationCode: string,
  ) {
    return this.deliveryqueueService.validateDelivery(
      +idShopping,
      verificationCode,
    );
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.deliveryqueueService.remove(+id);
  // }
}
