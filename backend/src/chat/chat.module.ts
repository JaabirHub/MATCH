import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Conversation } from './conversation/conversation.entity';
import { ConnectionModule } from 'src/connection/connection.module';
import { ConversationService } from './conversation/conversation.service';
import { ConversationController } from './conversation/conversation.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation]), ConnectionModule],
  controllers: [ConversationController],
  providers: [ConversationService],
  exports: [ConversationService],
})
export class ChatModule {}
