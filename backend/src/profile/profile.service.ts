import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Profile } from './profile.entity';
import { ProfileDTO } from './dto/profile.dto';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>) {}

  getAll() {
    return this.profileRepo.find();
  }

  async getProfileById(userid: string): Promise<Profile> {
    const profile = await this.profileRepo.findOne({ where: { id: userid } });
    if (!profile) throw new NotFoundException('Profile not found');
    return profile;
  }

  async updateProfile(userId: string, dto: ProfileDTO): Promise<Profile> {
    const profile = await this.getProfileById(userId);

    if (dto.nickname !== undefined) profile.nickname = dto.nickname;
    if (dto.description !== undefined) profile.description = dto.description;
    if (dto.interests !== undefined) profile.interests = dto.interests;
    if (dto.city !== undefined) profile.city = dto.city;

    return this.profileRepo.save(profile);
  }
}
