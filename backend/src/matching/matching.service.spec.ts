import { Test, TestingModule } from '@nestjs/testing';
import { MatchingService } from './matching.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from 'src/profile/profile.entity';
import { Interest } from 'src/profile/profile-interest.enum';

const mockProfileRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockCurrentProfile: Profile = {
  id: 'user-1',
  nickname: 'Alice',
  city: 'London',
  interests: [Interest.GYM, Interest.MUSIC],
} as Profile;

const mockOtherProfile: Profile = {
  id: 'user-2',
  nickname: 'Bob',
  city: 'London',
  interests: [Interest.GYM, Interest.GAMING],
} as Profile;

const mockNoOverlapProfile: Profile = {
  id: 'user-3',
  nickname: 'Charlie',
  city: 'Manchester',
  interests: [Interest.ANIME],
} as Profile;

describe('MatchingService', () => {
  let service: MatchingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MatchingService,
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepo },
      ],
    }).compile();

    service = module.get<MatchingService>(MatchingService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getSuggestions', () => {
    it('should return empty array if current profile not found', async () => {
      mockProfileRepo.findOne.mockResolvedValue(null);
      const result = await service.getSuggestions('user-1');
      expect(result).toEqual([]);
    });

    it('should exclude the current user from results', async () => {
      mockProfileRepo.findOne.mockResolvedValue(mockCurrentProfile);
      mockProfileRepo.find.mockResolvedValue([
        mockCurrentProfile,
        mockOtherProfile,
      ]);

      const result = await service.getSuggestions('user-1');
      expect(result.every((r) => r.id !== 'user-1')).toBe(true);
    });

    it('should exclude users with no shared interests', async () => {
      mockProfileRepo.findOne.mockResolvedValue(mockCurrentProfile);
      mockProfileRepo.find.mockResolvedValue([
        mockCurrentProfile,
        mockNoOverlapProfile,
      ]);

      const result = await service.getSuggestions('user-1');
      expect(result).toHaveLength(0);
    });

    it('should return shared interests in results', async () => {
      mockProfileRepo.findOne.mockResolvedValue(mockCurrentProfile);
      mockProfileRepo.find.mockResolvedValue([
        mockCurrentProfile,
        mockOtherProfile,
      ]);

      const result = await service.getSuggestions('user-1');
      expect(result[0].sharedInterests).toContain(Interest.GYM);
    });

    it('should score same city higher', async () => {
      const differentCityProfile: Profile = {
        ...mockOtherProfile,
        id: 'user-4',
        city: 'Manchester',
      };

      mockProfileRepo.findOne.mockResolvedValue(mockCurrentProfile);
      mockProfileRepo.find.mockResolvedValue([
        mockCurrentProfile,
        mockOtherProfile,
        differentCityProfile,
      ]);

      const result = await service.getSuggestions('user-1');
      expect(result[0].score).toBeGreaterThan(result[1].score);
    });

    it('should paginate results', async () => {
      const profiles = Array.from({ length: 15 }, (_, i) => ({
        ...mockOtherProfile,
        id: `user-${i + 2}`,
      }));

      mockProfileRepo.findOne.mockResolvedValue(mockCurrentProfile);
      mockProfileRepo.find.mockResolvedValue([mockCurrentProfile, ...profiles]);

      const result = await service.getSuggestions('user-1', 1, 10);
      expect(result).toHaveLength(10);
    });
  });
});
