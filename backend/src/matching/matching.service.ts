import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from 'src/profile/profile.entity';
import { Connection } from 'src/connection/connection.entity';
import { ConnectionStatus } from 'src/connection/connection.status';
import { Repository } from 'typeorm';

export class MatchingService {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(Connection)
    private readonly connectionRepository: Repository<Connection>,
  ) {}

  async getSuggestions(userId: string, page = 1, limit = 10) {
    const currentProfile = await this.profileRepository.findOne({
      where: { id: userId },
    });

    if (!currentProfile) return [];

    const connections = await this.connectionRepository.find({
      where: [{ sender: { id: userId } }, { receiver: { id: userId } }],
      relations: { sender: true, receiver: true },
    });

    const excludedUserIds = new Set(
      connections
        .filter(
          (connection) =>
            connection.connectionStatus === ConnectionStatus.ACCEPTED ||
            connection.connectionStatus === ConnectionStatus.PENDING,
        )
        .map((connection) =>
          connection.sender.id === userId
            ? connection.receiver.id
            : connection.sender.id,
        ),
    );

    const allProfiles = await this.profileRepository.find();

    const scored = allProfiles
      .filter(
        (profile) => profile.id !== userId && !excludedUserIds.has(profile.id),
      )
      .map((profile) => ({
        profile,
        score: this.computeScore(currentProfile, profile),
      }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score);

    const start = (page - 1) * limit;
    const paginated = scored.slice(start, start + limit);

    return paginated.map(({ profile, score }) => ({
      id: profile.id,
      nickname: profile.nickname,
      city: profile.city,
      interests: profile.interests,
      sharedInterests: currentProfile.interests.filter((interest) =>
        profile.interests.includes(interest),
      ),
      score,
    }));
  }

  private computeScore(current: Profile, other: Profile): number {
    const sharedInterests = current.interests.filter((interest) =>
      other.interests.includes(interest),
    );

    let score = sharedInterests.length * 10;

    if (
      current.city &&
      other.city &&
      current.city.toLowerCase() === other.city.toLowerCase()
    ) {
      score += 20;
    }

    return score;
  }
}
