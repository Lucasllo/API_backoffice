import { Module } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { AuthController } from '../controllers/auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UserModule } from './user.module';
import { UserDeliveryModule } from './userDelivery.module';

@Module({
  imports: [
    JwtModule.register({
      secret: String(process.env.JWT_SECRET),
      signOptions: { expiresIn: '12h' }, //usado para definir globalmente quanto tempo o jwt vai valer
    }),
    TypeOrmModule.forFeature([UserEntity]),
    UserModule,
    UserDeliveryModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [
    JwtModule.register({
      secret: String(process.env.JWT_SECRET),
      signOptions: { expiresIn: '12h' }, //usado para definir globalmente quanto tempo o jwt vai valer
    }),
  ],
})
export class AuthModule {}
