import { Controller, Get, Param, Delete } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Role } from 'src/enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';

@ApiTags('Product')
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // @Get()
  // findAll() {
  //   return this.productService.findAll();
  // }

  @Get('findByShopping/:id')
  @Roles(Role.Admin, Role.User)
  @ApiBearerAuth('access-token')
  findByShopping(@Param('id') id: string) {
    return this.productService.findByShopping(+id);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.productService.remove(+id);
  // }
}
