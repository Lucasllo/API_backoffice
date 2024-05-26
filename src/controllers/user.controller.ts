import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from 'src/dtos/user/createUser.dto';
import { Public } from 'src/decorators/public.decorator';
import { ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { UserQueryPaginateDto } from 'src/dtos/user/userQueryPaginate.dto';
import { User } from 'src/decorators/user.decorator';
import { UserDto } from 'src/dtos/user/user.dto';

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

  @Post('findAll')
  @Roles(Role.Admin)
  findOne(@Body() query: UserQueryPaginateDto) {
    return this.userService.findAll(query);
  }

  @Patch('authorizeUser/:id')
  @Roles(Role.Admin)
  authorizeUser(@Param('id') code: string, @User() user: UserDto) {
    return this.userService.authorizeUser(+code, user);
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.userService.remove(+id);
  // }
}
