import { Controller, Param, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Public } from 'src/decorators/public.decorator';
import { LoginAuthDto } from 'src/dtos/login/login.dto';
import { RecoverPasswordAuthDto } from 'src/dtos/password/recoverPasswordAuth.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { User } from 'src/decorators/user.decorator';
import { UserDto } from 'src/dtos/user/user.dto';
import { PasswordCode } from 'src/decorators/passwordCode.decorator';
import { RoleGuard } from 'src/guard/role.guard';
import { LoginReturnDto } from 'src/dtos/login/loginReturn.dto';
@Public()
@UseGuards(RoleGuard)
@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() loginAuthDto: LoginAuthDto): Promise<LoginReturnDto> {
    return this.authService.login(loginAuthDto);
  }

  @Post('loginDelivery')
  LoginDeliveryDto(
    @Body() loginAuthDto: LoginAuthDto,
  ): Promise<LoginReturnDto> {
    return this.authService.login(loginAuthDto);
  }

  @Post('recuperaSenha')
  recuperaSenha(@Body() recoverPasswordAuthDto: RecoverPasswordAuthDto) {
    return this.authService.recoverPassword(recoverPasswordAuthDto);
  }

  // @Roles(Role.Recover)
  @ApiBearerAuth('access-token')
  @Post('validaCodigo/:codigo')
  validaCodigo(
    @Param('codigo') code: string,
    @User() user: UserDto,
    @PasswordCode() passwordCode: string,
  ) {
    return this.authService.validateCode(code, passwordCode, user.id);
  }
}
