import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from './guard/auth.guard';
import { AuthService } from './services/auth.service';
import { APP_GUARD } from '@nestjs/core';
import { UserEntity } from './entities/user.entity';
import { AuthModule } from './modules/auth.module';
import { UserModule } from './modules/user.module';
import { UserClientModule } from './modules/userClient.module';
import { ProductModule } from './modules/product.module';
import { ShoppingModule } from './modules/shopping.module';
import { CategoryModule } from './modules/category.module';
import { CardModule } from './modules/card.module';
import { AddressModule } from './modules/address.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
      database: process.env.DATABASE,
      entities: [UserEntity],
      synchronize: process.env.ENV === 'development',
    }),
    AuthModule,
    UserModule,
    UserClientModule,
    ProductModule,
    ShoppingModule,
    CategoryModule,
    CardModule,
    AddressModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
    AuthService,
  ],
})
export class AppModule {}
