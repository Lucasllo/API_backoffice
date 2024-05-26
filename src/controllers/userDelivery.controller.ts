import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { UserDeliveryService } from '../services/userDelivery.service';
import { CreateUserDeliveryDto } from 'src/dtos/user/createUserDelivery.dto';
import { Public } from 'src/decorators/public.decorator';

@Controller('user-delivery')
export class UserDeliveryController {
  constructor(private readonly userDeliveryService: UserDeliveryService) {}

  @Public()
  @Post()
  create(@Body() createUserDeliveryDto: CreateUserDeliveryDto) {
    return this.userDeliveryService.create(createUserDeliveryDto);
  }

  @Get()
  findAll() {
    return this.userDeliveryService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userDeliveryService.findOne(+id);
  }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateUserDeliveryDto: UpdateUserDeliveryDto,
  // ) {
  //   return this.userDeliveryService.update(+id, updateUserDeliveryDto);
  // }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userDeliveryService.remove(+id);
  }
}
