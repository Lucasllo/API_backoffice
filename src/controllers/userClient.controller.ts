import { Controller, Get, Param, Delete, UseGuards } from '@nestjs/common';
import { UserClientService } from '../services/userClient.service';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guard/role.guard';

@UseGuards(RoleGuard)
@ApiTags('User Client')
@Controller('userClient')
export class UserClientController {
  constructor(private readonly userClientService: UserClientService) {}

  // @Get()
  // findAll() {
  //   return this.userClientService.findAll();
  // }

  @Roles(Role.Delivery)
  @ApiBearerAuth('access-token')
  @Get('getPhone/:idUserClient')
  getPhone(@Param('idUserClient') idUserClient: string) {
    return this.userClientService.getPhone(idUserClient);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userClientService.findOne(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userClientService.remove(+id);
  // }
}
