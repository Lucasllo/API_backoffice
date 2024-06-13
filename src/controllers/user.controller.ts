import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Patch,
  Delete,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { CreateUserDto } from 'src/dtos/user/createUser.dto';
import { Public } from 'src/decorators/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RoleGuard } from 'src/guard/role.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Role } from 'src/enums/role.enum';
import { UserQueryPaginateDto } from 'src/dtos/user/userQueryPaginate.dto';
import { User } from 'src/decorators/user.decorator';
import { UserDto } from 'src/dtos/user/user.dto';
import { ChangePasswordAuthDto } from 'src/dtos/password/changePasswordAuth.dto';

// @Roles(Role.Admin, Role.User)
@UseGuards(RoleGuard)
@ApiTags('User')
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
  @ApiBearerAuth('access-token')
  findOne(@Body() query: UserQueryPaginateDto) {
    return this.userService.findAll(query);
  }

  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @Patch('authorizeUser/:id')
  authorizeUser(@Param('id') code: string, @User() user: UserDto) {
    return this.userService.authorizeUser(+code, user);
  }

  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @Patch('changeRoleUser/:id/:role')
  changeRoleUser(@Param('id') code: string, @Param('role') role: string) {
    return this.userService.changeRoleUser(+code, role);
  }

  @Roles(Role.Recover)
  @ApiBearerAuth('access-token')
  @Post('mudaSenha')
  mudaSenha(
    @User() user: UserDto,
    @Body() changePasswordAuthDto: ChangePasswordAuthDto,
  ) {
    return this.userService.updatePassword(user.id, changePasswordAuthDto);
  }

  @Roles(Role.Admin)
  @ApiBearerAuth('access-token')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userService.delete(+id);
  }
}
