import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from 'src/dtos/createUser.dto';
import { Public } from 'src/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guard/role.guard';

// @Roles(Role.Admin, Role.User)
@UseGuards(RoleGuard)
@ApiTags('User')
@Controller('User')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('create')
  create(@Body() createPessoaDto: CreateUserDto) {
    return this.userService.create(createPessoaDto);
  }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.userService.findOne(+id);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
