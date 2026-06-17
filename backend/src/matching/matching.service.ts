import { InjectRepository } from "@nestjs/typeorm";
import { Profile } from "src/profile/profile.entity";
import { Repository } from "typeorm";

export class MatchingService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async getSuggestions(userId: string, page: number = 1, limit: number = 10) {
    const currentProfile = await this.profileRepository.findOne({where: {id: userId}});
    
    if(!currentProfile) return [];

    const allProfiles = await this.profileRepository.find();

    const scored = allProfiles
      .filter(profile => profile.id !== userId)
      .map(profile => ({
        profile,
        score: this.computeScore(currentProfile, profile),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

      const start = (page - 1) * limit;
      const paginated = scored.slice(start, start + limit);

      return paginated.map(({ profile, score}) => ({
        id: profile.id,
        nickname: profile.nickname,
        city: profile.city,
        interests: profile.interests,
        sharedInterests: currentProfile.interests.filter(i => profile.interests.includes(i)),
        score,
      }));
  }

  private computeScore(current: Profile, other: Profile): number {
    const sharedInterests = current.interests.filter(i => other.interests.includes(i));
    let score = sharedInterests.length * 10;

    if (current.city && other.city && current.city.toLowerCase() === other.city.toLowerCase()) {
      score +=20;
    }

    return score
  }
}