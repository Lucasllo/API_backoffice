import { Module } from '@nestjs/common';
import { UserClientService } from '../services/userClient.service';
import { UserClientController } from '../controllers/userClient.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserClientEntity } from 'src/entities/userClient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserClientEntity])],
  controllers: [UserClientController],
  providers: [UserClientService],
})
export class UserClientModule {}
