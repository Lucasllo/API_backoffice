import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthGuard } from './guard/auth.guard';
import { AuthService } from './services/auth.service';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth.module';
import { UserModule } from './modules/user.module';
import { UserClientModule } from './modules/userClient.module';
import { ProductModule } from './modules/product.module';
import { ShoppingModule } from './modules/shopping.module';
import { CategoryModule } from './modules/category.module';
import { CardModule } from './modules/card.module';
import { AddressModule } from './modules/address.module';
import { UserEntity } from './entities/user.entity';
import { UserClientEntity } from './entities/userClient.entity';
import { ProductEntity } from './entities/product.entity';
import { CategoryEntity } from './entities/category.entity';
import { ShoppingEntity } from './entities/shopping.entity';
import { CardEntity } from './entities/card.entity';
import { AddressEntity } from './entities/address.entity';
import { UserDeliveryModule } from './modules/userDelivery.module';
import { UserDeliveryEntity } from './entities/userDelivery.entity';
import { DeliveryQueueEntity } from './entities/deliveryQueue.entity';
import { DeliveryqueueModule } from './modules/deliveryqueue.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: [
        UserEntity,
        UserClientEntity,
        ProductEntity,
        CategoryEntity,
        ShoppingEntity,
        CardEntity,
        AddressEntity,
        UserDeliveryEntity,
        DeliveryQueueEntity,
      ],
      synchronize: process.env.ENV === 'developmen',
    }),
    AuthModule,
    UserModule,
    UserClientModule,
    ProductModule,
    ShoppingModule,
    CategoryModule,
    CardModule,
    AddressModule,
    UserDeliveryModule,
    DeliveryqueueModule,
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
