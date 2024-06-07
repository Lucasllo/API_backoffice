import { Controller, Post, Body } from '@nestjs/common';
import { UserDeliveryService } from '../services/userDelivery.service';
import { CreateUserDeliveryDto } from 'src/dtos/userDelivery/createUserDelivery.dto';
import { Public } from 'src/decorators/public.decorator';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { Delivery } from 'src/decorators/delivery.decorator';
import { ChangePasswordAuthDto } from 'src/dtos/password/changePasswordAuth.dto';
import { UserDeliveryDto } from 'src/dtos/userDelivery/userDelivery.dto';

@Controller('user-delivery')
export class UserDeliveryController {
  constructor(private readonly userDeliveryService: UserDeliveryService) {}

  @Public()
  @Post('create')
  create(@Body() createUserDeliveryDto: CreateUserDeliveryDto) {
    return this.userDeliveryService.create(createUserDeliveryDto);
  }

  @Roles(Role.Recover)
  @ApiBearerAuth('access-token')
  @Post('mudaSenhaDelivery')
  mudaSenha(
    @Delivery() userDelivery: UserDeliveryDto,
    @Body() changePasswordAuthDto: ChangePasswordAuthDto,
  ) {
    return this.userDeliveryService.updatePassword(
      userDelivery.id,
      changePasswordAuthDto,
    );
  }
  // @Get()
  // findAll() {
  //   return this.userDeliveryService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userDeliveryService.findOne(+id);
  // }

  // @Patch(':id')
  // update(
  //   @Param('id') id: string,
  //   @Body() updateUserDeliveryDto: UpdateUserDeliveryDto,
  // ) {
  //   return this.userDeliveryService.update(+id, updateUserDeliveryDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userDeliveryService.remove(+id);
  // }
}
