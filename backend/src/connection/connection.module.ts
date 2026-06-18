import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from './connection.entity';
import { User } from 'src/user/user.entity';
import { ConnectionService } from './connection.service';
import { ConnectionController } from './connection.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User, Connection])],
  providers: [ConnectionService],
  controllers: [ConnectionController],
})
export class ConnectionModule {}
