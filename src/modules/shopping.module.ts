import { Module } from '@nestjs/common';
import { ShoppingService } from '../services/shopping.service';
import { ShoppingController } from '../controllers/shopping.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShoppingEntity } from 'src/entities/shopping.entity';
import { ShoppingRepository } from 'src/repositories/shopping.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ShoppingEntity])],
  controllers: [ShoppingController],
  providers: [ShoppingService, ShoppingRepository],
  exports: [ShoppingService],
})
export class ShoppingModule {}
