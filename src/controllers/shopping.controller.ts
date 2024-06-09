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
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@UseGuards(RoleGuard)
@ApiTags('Shopping')
@Controller('shopping')
export class ShoppingController {
  constructor(private readonly shoppingService: ShoppingService) {}

  @Post()
  @Roles(Role.Admin, Role.User)
  @ApiBearerAuth('access-token')
  findAll(@Body() query: ShoppingQueryPaginateDto) {
    return this.shoppingService.findAll(query);
  }

  @Get(':id')
  @Roles(Role.Admin, Role.User)
  @ApiBearerAuth('access-token')
  findOne(@Param('id') id: string) {
    return this.shoppingService.findOne(+id);
  }

  @Patch('/updateStatus/:codeShopping/:codeStatus')
  @Roles(Role.Admin, Role.User, Role.Delivery)
  @ApiBearerAuth('access-token')
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
