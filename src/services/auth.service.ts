import { RecoverPasswordAuthDto } from '../dtos/password/recoverPasswordAuth.dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { LoginAuthDto } from '../dtos/login/login.dto';
import { UserService } from './user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginReturnDto } from 'src/dtos/login/loginReturn.dto';
import { MailingService } from './mailingService';
import { UserDeliveryService } from './userDelivery.service';

@Injectable()
export class AuthService {
  private issuer = 'login';
  private audience = 'user';

  constructor(
    private readonly userservice: UserService,
    private readonly userDeliveryService: UserDeliveryService,
    private readonly jwtService: JwtService,
    private readonly mailingService: MailingService,
  ) {}

  checkToken(token: string) {
    return this.checkInToken(token);
  }

  async login(loginAuthDto: LoginAuthDto): Promise<LoginReturnDto> {
    const user = await this.userservice.login(loginAuthDto);
    const token = this.createToken(user.id);
    return {
      id: user.id,
      name: user.name,
      code: user.storeCode,
      role: user.role,
      ...token,
    };
  }

  async loginDelivery(loginAuthDto: LoginAuthDto): Promise<LoginReturnDto> {
    const userDelivery = await this.userDeliveryService.login(loginAuthDto);
    const token = this.createTokenDelivery(userDelivery.id);
    return {
      id: userDelivery.id,
      name: userDelivery.name,
      role: userDelivery.role,
      ...token,
    };
  }

  async recoverPassword(recoverPasswordAuthDto: RecoverPasswordAuthDto) {
    try {
      const user = await this.userservice.recoverPassword(
        recoverPasswordAuthDto,
      );
      //salvar codigo criado no banco
      const codigo = Math.floor(1000 + Math.random() * 9000);

      await this.userservice.setValidCode(user.id, codigo);

      //enviar email
      //this.mailingService
    } catch (error) {
      throw new BadRequestException('Usuario invalido');
    }
  }

  async validateCode(code: string): Promise<LoginReturnDto> {
    try {
      const user = await this.userservice.findByValidCode(+code);
      const token = this.createTokenRecoverPassword(+code, user.id);
      return { code: user.storeCode, role: user.role, ...token };
    } catch (error) {
      throw new BadRequestException('Usuario não encontrado');
    }
  }

  async recoverPasswordDelivery(
    recoverPasswordAuthDto: RecoverPasswordAuthDto,
  ) {
    try {
      const user = await this.userDeliveryService.recoverPassword(
        recoverPasswordAuthDto,
      );
      //salvar codigo criado no banco
      const codigo = Math.floor(1000 + Math.random() * 9000);

      await this.userservice.setValidCode(user.id, codigo);

      //enviar email
      //this.mailingService
    } catch (error) {
      throw new BadRequestException('Usuario invalido');
    }
  }

  async validateCodeDelivery(code: string): Promise<LoginReturnDto> {
    try {
      const user = await this.userDeliveryService.findByValidCode(+code);
      const token = this.createTokenRecoverPassword(+code, user.id);
      return { role: user.role, ...token };
    } catch (error) {
      throw new BadRequestException('Usuario não encontrado');
    }
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

  private createTokenDelivery(id: number) {
    return {
      token: this.jwtService.sign(
        {},
        {
          expiresIn: '7 days',
          subject: JSON.stringify({
            userDelivery: String(id),
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
