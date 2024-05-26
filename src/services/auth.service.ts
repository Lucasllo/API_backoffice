import { RecoverPasswordAuthDto } from '../dtos/password/recoverPasswordAuth.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginAuthDto } from '../dtos/login/login.dto';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginReturnDto } from 'src/dtos/login/loginReturn.dto';

@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'user';

  constructor(
    private readonly userservice: UserService,
    private readonly jwtService: JwtService,
  ) {}

  checkToken(token: string) {
    return this.checkInToken(token);
  }

  async login(loginAuthDto: LoginAuthDto): Promise<LoginReturnDto> {
    const user = await this.userservice.login(loginAuthDto);
    const token = this.createToken((await user).id);
    return { code: user.storeCode, role: user.role, ...token };
  }

  async recoverPassword(recoverPasswordAuthDto: RecoverPasswordAuthDto) {
    const result = await this.userservice.recoverPassword(
      recoverPasswordAuthDto,
    );
    const codigo = Math.floor(1000 + Math.random() * 9000);

    return this.createTokenRecoverPassword(codigo, (await result).id);
  }

  validateCode(code: string, passwordCode: string, id: number) {
    if (code != passwordCode) {
      throw new BadRequestException('Codigo invalido');
    }

    return this.createToken(id);
  }

  private createToken(id: number) {
    return {
      token: this.jwtService.sign(
        {},
        {
          expiresIn: '7 days',
          subject: JSON.stringify({
            user: String(id),
          }),
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
    };
  }

  private checkInToken(token: string) {
    try {
      const data = this.jwtService.verify(token, {
        audience: this.audience,
        issuer: this.issuer,
      });
      return data;
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  private createTokenRecoverPassword(codeRecover: number, id) {
    return {
      token: this.jwtService.sign(
        {
          codeRecover: codeRecover,
        },
        {
          expiresIn: '1 day',
          subject: JSON.stringify({
            codeRecover: String(codeRecover),
            user: String(id),
          }),
          issuer: this.issuer,
          audience: this.audience,
        },
      ),
    };
  }
}
