import { Controller, Param, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Public } from 'src/decorators/public.decorator';
import { LoginAuthDto } from 'src/dtos/login/login.dto';
import { RecoverPasswordAuthDto } from 'src/dtos/password/recoverPasswordAuth.dto';
import { ApiTags } from '@nestjs/swagger';
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
    return this.authService.loginDelivery(loginAuthDto);
  }

  @Post('recuperaSenha')
  recuperaSenha(@Body() recoverPasswordAuthDto: RecoverPasswordAuthDto) {
    return this.authService.recoverPassword(recoverPasswordAuthDto);
  }

  @Post('validaCodigo/:codigo')
  validaCodigo(@Param('codigo') code: string): Promise<LoginReturnDto> {
    return this.authService.validateCode(code);
  }

  @Post('recuperaSenhaDelivery')
  recuperaSenhaDelivery(
    @Body() recoverPasswordAuthDto: RecoverPasswordAuthDto,
  ) {
    return this.authService.recoverPasswordDelivery(recoverPasswordAuthDto);
  }

  @Post('validaCodigoDelivery/:codigo')
  validaCodigoDelivery(@Param('codigo') code: string): Promise<LoginReturnDto> {
    return this.authService.validateCodeDelivery(code);
  }
}
