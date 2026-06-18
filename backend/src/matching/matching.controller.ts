import { Controller, Get, Query, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { MatchingService } from './matching.service';
import { User } from 'src/user/user.entity';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@UseGuards(JwtAuthGuard)
@Controller('matches')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('suggestions')
  getSuggestions(
    @Request() req: RequestWithUser,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.matchingService.getSuggestions(
      req.user.id,
      Number(page),
      Number(limit),
    );
  }
}
