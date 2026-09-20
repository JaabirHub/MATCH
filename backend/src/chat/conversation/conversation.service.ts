import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';

import { ConnectionService } from 'src/connection/connection.service';
import { ConnectionStatus } from 'src/connection/connection.status';
import { Conversation } from './conversation.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ConversationService {
  constructor(
    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,

    private readonly connectionService: ConnectionService,
  ) {}

  async createConversation(
    userId: string,
    connectionId: string,
  ): Promise<Conversation> {
    const connection =
      await this.connectionService.getConnectionOrFail(connectionId);

    const isParticipant =
      connection.sender.id === userId || connection.receiver.id === userId;

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this connection',
      );
    }

    if (connection.connectionStatus !== ConnectionStatus.ACCEPTED) {
      throw new BadRequestException(
        'A conversation can only be created for an accepted connection',
      );
    }

    const existingConversation = await this.conversationRepo.findOne({
      where: {
        connectionId,
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    const conversation = this.conversationRepo.create({
      connectionId,
      connection,
    });

    return this.conversationRepo.save(conversation);
  }
}
