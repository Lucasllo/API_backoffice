import { Module } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { UserController } from '../controllers/user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserEntity } from 'src/entities/user.entity';
import { UserMapper } from 'src/mappers/user.mapper';
import { UserRepository } from 'src/repositories/user.repository';
import { MailingService } from 'src/services/mailingService';
import { UserPermissionMapper } from 'src/mappers/userPermission.mapper';

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity])],
  controllers: [UserController],
  providers: [
    UserService,
    UserMapper,
    UserPermissionMapper,
    UserRepository,
    MailingService,
  ],
  exports: [UserService, MailingService],
})
export class UserModule {}
