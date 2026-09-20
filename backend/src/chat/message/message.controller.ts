import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { User } from 'src/user/user.entity';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { SendMessageDto } from './dto/send-message.dto';
import { GetMessagesQueryDto } from './dto/get-messages-query.dto';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@Controller('conversations/:conversationId/messages')
@UseGuards(JwtAuthGuard)
export class MessageController {
  constructor(private readonly messageService: MessageService) {}

  @Post()
  sendMessage(
    @Request() req: RequestWithUser,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messageService.sendMessage(conversationId, req.user.id, dto);
  }

  @Get()
  getMessages(
    @Request() req: RequestWithUser,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query() query: GetMessagesQueryDto,
  ) {
    return this.messageService.getMessages(conversationId, req.user.id, query);
  }

  @Patch()
  markMessagesAsRead(
    @Request() req: RequestWithUser,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
  ) {
    return this.messageService.markMessagesAsRead(conversationId, req.user.id);
  }
}
