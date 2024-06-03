import {
  Controller,
  Get,
  Param,
  Body,
  Post,
  UseGuards,
  Patch,
} from '@nestjs/common';
import { ShoppingService } from '../services/shopping.service';
import { ShoppingQueryPaginateDto } from 'src/dtos/shopping/shoppingQueryPaginate.dto';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { RoleGuard } from 'src/guard/role.guard';
import { solicitacaoCompraStatus } from 'src/enums/solicitacaoCompraStatus.enum';

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

  @Patch('/updateStatus/:codeShopping/:codeStatus')
  @Roles(Role.Admin, Role.User)
  updateStatus(
    @Param('codeStatus') codeStatus: solicitacaoCompraStatus,
    @Param('codeShopping') codeShopping: number,
  ) {
    return this.shoppingService.updateStatus(codeStatus, codeShopping);
  }

  // @Roles(Role.Admin)
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.shoppingService.remove(+id);
  // }
}
