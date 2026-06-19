import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './user.entity';

const mockUserRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
};

const mockUser: User = {
  id: 'user-id',
  email: 'test@test.com',
  name: 'Test User',
} as User;

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('findAll', () => {
    it('should return all users', async () => {
      mockUserRepo.find.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toHaveLength(1);
    });

    it('should return empty array if no users', async () => {
      mockUserRepo.find.mockResolvedValue([]);
      const result = await service.findAll();
      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return a user if found', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      const result = await service.findById('user-id');
      expect(result).toEqual(mockUser);
    });

    it('should return null if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      const result = await service.findById('bad-id');
      expect(result).toBeNull();
    });
  });
});
