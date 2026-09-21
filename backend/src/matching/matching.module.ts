import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/profile/profile.entity';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { Connection } from 'src/connection/connection.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, Connection])],
  providers: [MatchingService],
  controllers: [MatchingController],
})
export class MatchingModule {}
