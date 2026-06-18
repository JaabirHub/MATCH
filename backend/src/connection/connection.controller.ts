import {
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { User } from 'src/user/user.entity';
import { ConnectionService } from './connection.service';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@UseGuards(JwtAuthGuard)
@Controller('connections')
export class ConnectionController {
  constructor(private readonly connectionService: ConnectionService) {}

  @Post('request/:receiverId')
  sendRequest(
    @Request() req: RequestWithUser,
    @Param('receiverId') id: string,
  ) {
    return this.connectionService.sendRequest(req.user.id, id);
  }

  @Patch(':id/accept')
  acceptRequest(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.connectionService.acceptRequest(req.user.id, id);
  }

  @Patch(':id/decline')
  declineRequest(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.connectionService.declineRequest(req.user.id, id);
  }

  @Patch(':id/block')
  blockUser(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.connectionService.blockUser(req.user.id, id);
  }

  @Get()
  getAcceptedConnections(@Request() req: RequestWithUser) {
    return this.connectionService.getAcceptedConnections(req.user.id);
  }

  @Get('requests')
  getPendingRequests(@Request() req: RequestWithUser) {
    return this.connectionService.getPendingRequests(req.user.id);
  }
}
