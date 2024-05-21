import { Module } from '@nestjs/common';
import { UserClientService } from '../services/user-client.service';
import { UserClientController } from '../controllers/userClient.controller';

@Module({
  controllers: [UserClientController],
  providers: [UserClientService],
})
export class UserClientModule {}
