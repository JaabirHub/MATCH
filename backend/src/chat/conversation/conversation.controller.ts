import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ConversationService } from './conversation.service';
import { Request as ExpressRequest } from 'express';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { User } from 'src/user/user.entity';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@Controller('conversations')
@UseGuards(JwtAuthGuard)
export class ConversationController {
  constructor(private readonly conversationService: ConversationService) {}

  @Post()
  createConversation(
    @Request() req: RequestWithUser,
    @Body() dto: CreateConversationDto,
  ) {
    return this.conversationService.createConversation(
      req.user.id,
      dto.connectionId,
    );
  }
}
