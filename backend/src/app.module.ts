import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user/user.entity';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { Profile } from './profile/profile.entity';
import { ProfileModule } from './profile/profile.module';
import { MatchingModule } from './matching/matching.module';
import { ConnectionModule } from './connection/connection.module';
import { Connection } from './connection/connection.entity';
import { ChatModule } from './chat/chat.module';
import { Conversation } from './chat/conversation/conversation.entity';
import { Message } from './chat/message/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [User, Profile, Connection, Conversation, Message],
      synchronize: true,
    }),
    UserModule,
    AuthModule,
    ProfileModule,
    MatchingModule,
    ConnectionModule,
    ChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
