import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { Repository } from 'typeorm';
import { Conversation } from '../conversation/conversation.entity';
import { SendMessageDto } from './dto/send-message.dto';
import { ConnectionStatus } from 'src/connection/connection.status';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepo: Repository<Message>,

    @InjectRepository(Conversation)
    private readonly conversationRepo: Repository<Conversation>,
  ) {}

  async sendMessage(
    conversationId: string,
    userId: string,
    dto: SendMessageDto,
  ): Promise<Message> {
    const conversation = await this.getConversationForUser(
      conversationId,
      userId,
    );

    const message = this.messageRepo.create({
      conversationId: conversation.id,
      senderId: userId,
      content: dto.content.trim(),
    });

    return this.messageRepo.save(message);
  }

  async getMessages(
    conversationId: string,
    userId: string,
    query: GetMessagesQueryDto,
  ): Promise<Message[]> {
    await this.getConversationForUser(conversationId, userId);

    const queryBuilder = this.messageRepo
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.conversationId = :conversationId', {
        conversationId,
      })
      .orderBy('message.createdAt', 'DESC')
      .take(query.limit);

    if (query.before) {
      const previousMessage = await this.messageRepo.findOne({
        where: {
          id: query.before,
          conversationId,
        },
      });

      if (previousMessage) {
        queryBuilder.andWhere('message.createdAt < :createdAt', {
          createdAt: previousMessage.createdAt,
        });
      }
    }

    const messages = await queryBuilder.getMany();

    return messages.reverse();
  }

  async markMessagesAsRead(
    conversationId: string,
    userId: string,
  ): Promise<{message: string}> {
    await this.getConversationForUser(conversationId, userId);

    await this.messageRepo
      .createQueryBuilder()
      .update(Message)
      .set({
        readAt: new Date(),
      })
      .where('conversation_id = :conversationId', {
        conversationId,
      })
      .andWhere('sender_id != :userId', {
        userId,
      })
      .andWhere('read_at IS NULL')
      .execute();

      return {
        message: 'Messages marked as read',
      }
  }

  private async getConversationForUser(
    conversationId: string,
    userId: string,
  ): Promise<Conversation> {
    const conversation = await this.conversationRepo.findOne({
      where: {
        id: conversationId,
      },
      relations: {
        connection: {
          sender: true,
          receiver: true,
        },
      },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    const connection = conversation.connection;

    const isParticipant =
      connection.sender.id === userId || connection.receiver.id === userId;

    if (!isParticipant) {
      throw new ForbiddenException(
        'You are not a participant in this conversation',
      );
    }

    if (connection.connectionStatus !== ConnectionStatus.ACCEPTED) {
      throw new ForbiddenException(
        'Messaging is only available for accepted connections',
      );
    }

    return conversation;
  }
}
