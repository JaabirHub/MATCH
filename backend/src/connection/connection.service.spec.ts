import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionService } from './connection.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Connection } from './connection.entity';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ConnectionStatus } from './connection.status';
import { User } from 'src/user/user.entity';

const mockConnectionRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockUserRepo = {
  findOne: jest.fn(),
};

const mockSender: User = { id: 'sender-id', email: 'sender@test.com' } as User;
const mockReceiver: User = {
  id: 'receiver-id',
  email: 'receiver@test.com',
} as User;
const mockConnection: Connection = {
  id: 'connection-id',
  sender: mockSender,
  receiver: mockReceiver,
  connectionStatus: ConnectionStatus.PENDING,
} as Connection;

describe('ConnectionService', () => {
  let service: ConnectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConnectionService,
        {
          provide: getRepositoryToken(Connection),
          useValue: mockConnectionRepo,
        },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<ConnectionService>(ConnectionService);
  });

  afterEach(() => jest.clearAllMocks());

  // ─── getValidUser ───────────────────────────────────────────────────────────

  describe('getValidUser', () => {
    it('should return a user if found', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockSender);
      const result = await service.getValidUser('sender-id');
      expect(result).toEqual(mockSender);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.getValidUser('bad-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─── sendRequest ────────────────────────────────────────────────────────────

  describe('sendRequest', () => {
    it('should throw BadRequestException if sender and receiver are the same', async () => {
      await expect(service.sendRequest('abc', 'abc')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException if receiver does not exist', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(
        service.sendRequest('sender-id', 'receiver-id'),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if connection already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockReceiver);
      mockConnectionRepo.findOne.mockResolvedValue(mockConnection);
      await expect(
        service.sendRequest('sender-id', 'receiver-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create and return a new connection', async () => {
      mockUserRepo.findOne.mockResolvedValue(mockReceiver);
      mockConnectionRepo.findOne.mockResolvedValue(null);
      mockConnectionRepo.create.mockReturnValue(mockConnection);
      mockConnectionRepo.save.mockResolvedValue(mockConnection);

      const result = await service.sendRequest('sender-id', 'receiver-id');
      expect(result).toEqual(mockConnection);
      expect(mockConnectionRepo.save).toHaveBeenCalled();
    });
  });

  // ─── acceptRequest ──────────────────────────────────────────────────────────

  describe('acceptRequest', () => {
    it('should throw ForbiddenException if user is not the receiver', async () => {
      mockConnectionRepo.findOne.mockResolvedValue(mockConnection);
      await expect(
        service.acceptRequest('wrong-id', 'connection-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if connection is not pending', async () => {
      const acceptedConnection = {
        ...mockConnection,
        connectionStatus: ConnectionStatus.ACCEPTED,
      };
      mockConnectionRepo.findOne.mockResolvedValue(acceptedConnection);
      await expect(
        service.acceptRequest('receiver-id', 'connection-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should accept a pending connection', async () => {
      mockConnectionRepo.findOne.mockResolvedValue({ ...mockConnection });
      mockConnectionRepo.save.mockResolvedValue({
        ...mockConnection,
        connectionStatus: ConnectionStatus.ACCEPTED,
      });

      const result = await service.acceptRequest(
        'receiver-id',
        'connection-id',
      );
      expect(result.connectionStatus).toBe(ConnectionStatus.ACCEPTED);
    });
  });

  // ─── declineRequest ─────────────────────────────────────────────────────────

  describe('declineRequest', () => {
    it('should throw ForbiddenException if user is not the receiver', async () => {
      mockConnectionRepo.findOne.mockResolvedValue(mockConnection);
      await expect(
        service.declineRequest('wrong-id', 'connection-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException if connection is not pending', async () => {
      const declinedConnection = {
        ...mockConnection,
        connectionStatus: ConnectionStatus.DECLINED,
      };
      mockConnectionRepo.findOne.mockResolvedValue(declinedConnection);
      await expect(
        service.declineRequest('receiver-id', 'connection-id'),
      ).rejects.toThrow(BadRequestException);
    });

    it('should decline a pending connection', async () => {
      mockConnectionRepo.findOne.mockResolvedValue({ ...mockConnection });
      mockConnectionRepo.save.mockResolvedValue({
        ...mockConnection,
        connectionStatus: ConnectionStatus.DECLINED,
      });

      const result = await service.declineRequest(
        'receiver-id',
        'connection-id',
      );
      expect(result.connectionStatus).toBe(ConnectionStatus.DECLINED);
    });
  });

  // ─── blockUser ──────────────────────────────────────────────────────────────

  describe('blockUser', () => {
    it('should throw ForbiddenException if user is not part of the connection', async () => {
      mockConnectionRepo.findOne.mockResolvedValue(mockConnection);
      await expect(
        service.blockUser('wrong-id', 'connection-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should block the connection as sender', async () => {
      mockConnectionRepo.findOne.mockResolvedValue({ ...mockConnection });
      mockConnectionRepo.save.mockResolvedValue({
        ...mockConnection,
        connectionStatus: ConnectionStatus.BLOCKED,
      });

      const result = await service.blockUser('sender-id', 'connection-id');
      expect(result.connectionStatus).toBe(ConnectionStatus.BLOCKED);
    });

    it('should block the connection as receiver', async () => {
      mockConnectionRepo.findOne.mockResolvedValue({ ...mockConnection });
      mockConnectionRepo.save.mockResolvedValue({
        ...mockConnection,
        connectionStatus: ConnectionStatus.BLOCKED,
      });

      const result = await service.blockUser('receiver-id', 'connection-id');
      expect(result.connectionStatus).toBe(ConnectionStatus.BLOCKED);
    });
  });

  // ─── getAcceptedConnections ──────────────────────────────────────────────────

  describe('getAcceptedConnections', () => {
    it('should return accepted connections for a user', async () => {
      const acceptedConnection = {
        ...mockConnection,
        connectionStatus: ConnectionStatus.ACCEPTED,
      };
      mockConnectionRepo.find.mockResolvedValue([acceptedConnection]);

      const result = await service.getAcceptedConnections('sender-id');
      expect(result).toHaveLength(1);
      expect(result[0].connectionStatus).toBe(ConnectionStatus.ACCEPTED);
    });

    it('should return empty array if no accepted connections', async () => {
      mockConnectionRepo.find.mockResolvedValue([]);
      const result = await service.getAcceptedConnections('sender-id');
      expect(result).toHaveLength(0);
    });
  });

  // ─── getPendingRequests ──────────────────────────────────────────────────────

  describe('getPendingRequests', () => {
    it('should return pending requests for a user', async () => {
      mockConnectionRepo.find.mockResolvedValue([mockConnection]);
      const result = await service.getPendingRequests('receiver-id');
      expect(result).toHaveLength(1);
      expect(result[0].connectionStatus).toBe(ConnectionStatus.PENDING);
    });

    it('should return empty array if no pending requests', async () => {
      mockConnectionRepo.find.mockResolvedValue([]);
      const result = await service.getPendingRequests('receiver-id');
      expect(result).toHaveLength(0);
    });
  });
});
