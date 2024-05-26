import { Controller, Get, Param, Delete } from '@nestjs/common';
import { UserClientService } from '../services/userClient.service';

@Controller('userClient')
export class UserClientController {
  constructor(private readonly userClientService: UserClientService) {}

  @Get()
  findAll() {
    return this.userClientService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userClientService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userClientService.remove(+id);
  }
}
