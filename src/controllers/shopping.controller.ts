import { Controller, Get, Param, Delete, Body, Post } from '@nestjs/common';
import { ShoppingService } from '../services/shopping.service';
import { ShoppingQueryPaginateDto } from 'src/dtos/shopping/shoppingQueryPaginate.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';

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

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shoppingService.remove(+id);
  }
}
