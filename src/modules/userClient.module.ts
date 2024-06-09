import { Module } from '@nestjs/common';
import { UserClientService } from '../services/userClient.service';
import { UserClientController } from '../controllers/userClient.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserClientEntity } from 'src/entities/userClient.entity';
import { UserClientRepository } from 'src/repositories/userClient.repository';

@Module({
  imports: [TypeOrmModule.forFeature([UserClientEntity])],
  controllers: [UserClientController],
  providers: [UserClientService, UserClientRepository],
})
export class UserClientModule {}
