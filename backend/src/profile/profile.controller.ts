import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ProfileService } from './profile.service';
import { User } from 'src/user/user.entity';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { ProfileDTO } from './dto/profile.dto';

interface RequestWithUser extends ExpressRequest {
  user: User;
}

@UseGuards(JwtAuthGuard)
@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getAll() {
    return this.profileService.getAll();
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.profileService.getProfileById(id);
  }

  @Patch()
  updateProfile(@Request() req: RequestWithUser, @Body() dto: ProfileDTO) {
    return this.profileService.updateProfile(req.user.id, dto);
  }
}
