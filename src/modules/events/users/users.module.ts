import { Module } from '@nestjs/common';
import UsersModule from 'src/modules/routes/v1/users/users.module';
import UsersGateway from './users.gateway';

@Module({
  imports: [UsersModule],
  providers: [UsersGateway],
})
export default class _UsersModule {}
