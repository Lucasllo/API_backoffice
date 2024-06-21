import { Module } from '@nestjs/common';
import { ProductService } from '../services/product.service';
import { ProductController } from '../controllers/product.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductEntity } from 'src/entities/product.entity';
import { ProductRepository } from 'src/repositories/product.repository';
import { ProductMapper } from 'src/mappers/product.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([ProductEntity])],
  controllers: [ProductController],
  providers: [ProductService, ProductRepository, ProductMapper],
})
export class ProductModule {}
