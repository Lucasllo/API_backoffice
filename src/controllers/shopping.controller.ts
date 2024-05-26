import { Controller, Get, Param, Body, Post, UseGuards } from '@nestjs/common';
import { ShoppingService } from '../services/shopping.service';
import { ShoppingQueryPaginateDto } from 'src/dtos/shopping/shoppingQueryPaginate.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RoleGuard } from 'src/guard/role.guard';

@UseGuards(RoleGuard)
@Controller('shopping')
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Post()
  @Roles(Role.Admin, Role.User)
  findAll(@Body() query: ShoppingQueryPaginateDto) {
    return this.shoppingService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.User)
  findOne(@Param('id') id: string) {
    return this.shoppingService.findOne(+id);
  }

  // @Roles(Role.Admin)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.shoppingService.remove(+id);
  // }
}
