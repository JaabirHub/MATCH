import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { Profile } from 'src/profile/profile.entity';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

const mockUserRepo = { findOne: jest.fn(), create: jest.fn(), save: jest.fn() };
const mockProfileRepo = { create: jest.fn(), save: jest.fn() };
const mockJwtService = { sign: jest.fn().mockReturnValue('mock-token') };
const mockManager = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};
const mockDataSource = {
  transaction: jest.fn((cb: (manager: typeof mockManager) => Promise<unknown>) => cb(mockManager)),
};

const mockUser: User = {
  id: 'user-id',
  email: 'test@test.com',
  passwordHash: 'hashed',
  name: 'Test',
} as User;

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Profile), useValue: mockProfileRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('register', () => {
    it('should throw ConflictException if email already exists', async () => {
      mockManager.findOne.mockResolvedValue(mockUser);
      await expect(
        service.register({
          email: 'test@test.com',
          name: 'Test',
          password: 'pass',
        }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create user and profile and return tokens', async () => {
      mockManager.findOne.mockResolvedValue(null);
      mockUserRepo.create.mockReturnValue(mockUser);
      mockManager.save.mockResolvedValue(mockUser);
      mockManager.create.mockReturnValue({});

      const result = await service.register({
        email: 'test@test.com',
        name: 'Test',
        password: 'password123',
      });

      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });

  describe('validateUser', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(
        service.validateUser('test@test.com', 'pass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password does not match', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      await expect(
        service.validateUser('test@test.com', 'wrongpass'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should return user if credentials are valid', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      const result = await service.validateUser('test@test.com', 'correctpass');
      expect(result).toEqual(mockUser);
    });
  });

  describe('login', () => {
    it('should return tokens', () => {
      const result = service.login(mockUser);
      expect(result).toHaveProperty('accessToken');
      expect(result).toHaveProperty('refreshToken');
    });
  });
});
