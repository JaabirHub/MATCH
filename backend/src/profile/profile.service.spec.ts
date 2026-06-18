import { Test, TestingModule } from '@nestjs/testing';
import { ProfileService } from './profile.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Profile } from './profile.entity';
import { NotFoundException } from '@nestjs/common';
import { Interest } from './profile-interest.enum';

const mockProfileRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockProfile: Profile = {
  id: 'user-id',
  nickname: 'Alice',
  description: 'Test bio',
  interests: [Interest.GYM],
  city: 'London',
} as Profile;

describe('ProfileService', () => {
  let service: ProfileService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProfileService,
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepo },
      ],
    }).compile();

    service = module.get<ProfileService>(ProfileService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('getAll', () => {
    it('should return all profiles', async () => {
      mockProfileRepo.find.mockResolvedValue([mockProfile]);
      const result = await service.getAll();
      expect(result).toHaveLength(1);
    });

    it('should return empty array if no profiles', async () => {
      mockProfileRepo.find.mockResolvedValue([]);
      const result = await service.getAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('getProfileById', () => {
    it('should return a profile if found', async () => {
      mockProfileRepo.findOne.mockResolvedValue(mockProfile);
      const result = await service.getProfileById('user-id');
      expect(result).toEqual(mockProfile);
    });

    it('should throw NotFoundException if profile not found', async () => {
      mockProfileRepo.findOne.mockResolvedValue(null);
      await expect(service.getProfileById('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateProfile', () => {
    it('should update and return the profile', async () => {
      mockProfileRepo.findOne.mockResolvedValue({ ...mockProfile });
      mockProfileRepo.save.mockResolvedValue({
        ...mockProfile,
        nickname: 'Updated',
      });

      const result = await service.updateProfile('user-id', {
        nickname: 'Updated',
      });
      expect(result.nickname).toBe('Updated');
    });

    it('should only update provided fields', async () => {
      mockProfileRepo.findOne.mockResolvedValue({ ...mockProfile });
      mockProfileRepo.save.mockResolvedValue({
        ...mockProfile,
        city: 'Manchester',
      });

      const result = await service.updateProfile('user-id', {
        city: 'Manchester',
      });
      expect(result.city).toBe('Manchester');
      expect(result.nickname).toBe('Alice');
    });

    it('should throw NotFoundException if profile does not exist', async () => {
      mockProfileRepo.findOne.mockResolvedValue(null);
      await expect(
        service.updateProfile('bad-id', { nickname: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
