import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Connection } from './connection.entity';
import { ConnectionStatus } from './connection.status';
import { User } from 'src/user/user.entity';

export interface NormalizedUser {
  id: string;
  name?: string;
  nickname?: string;
  city?: string;
}

export interface NormalizedConnection {
  id: string;
  connectionStatus: ConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
  otherUser: NormalizedUser;
}

@Injectable()
export class ConnectionService {
  constructor(
    @InjectRepository(Connection)
    private readonly connectionRepo: Repository<Connection>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async getValidUser(userId: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async sendRequest(senderId: string, receiverId: string): Promise<Connection> {
    if (senderId === receiverId) {
      throw new BadRequestException('Cannot send request to yourself');
    }

    const sender = await this.getValidUser(senderId);
    const receiver = await this.getValidUser(receiverId);

    const existing = await this.connectionRepo.findOne({
      where: [
        { sender: { id: senderId }, receiver: { id: receiverId } },
        { sender: { id: receiverId }, receiver: { id: senderId } },
      ],
      relations: { sender: true, receiver: true },
    });

    if (!existing) {
      const connection = this.connectionRepo.create({
        sender,
        receiver,
        connectionStatus: ConnectionStatus.PENDING,
      });
      return this.connectionRepo.save(connection);
    }

    if (existing.connectionStatus === ConnectionStatus.PENDING) {
      if (existing.sender.id === receiverId) {
        existing.connectionStatus = ConnectionStatus.ACCEPTED;
        return this.connectionRepo.save(existing);
      }
      throw new BadRequestException('Connection request is already pending');
    }

    if (existing.connectionStatus === ConnectionStatus.ACCEPTED) {
      throw new BadRequestException('You are already connected');
    }

    if (existing.connectionStatus === ConnectionStatus.BLOCKED) {
      throw new BadRequestException('This connection is blocked');
    }

    if (existing.connectionStatus === ConnectionStatus.DECLINED) {
      existing.sender = sender;
      existing.receiver = receiver;
      existing.connectionStatus = ConnectionStatus.PENDING;
      return this.connectionRepo.save(existing);
    }

    throw new BadRequestException('Connection already exists');
  }

  async acceptRequest(
    userId: string,
    connectionId: string,
  ): Promise<Connection> {
    const connection = await this.getConnectionOrFail(connectionId);
    if (connection.receiver.id !== userId) {
      throw new ForbiddenException('Only the receiver can accept a request');
    }
    if (connection.connectionStatus !== ConnectionStatus.PENDING) {
      throw new BadRequestException('Connection is not pending');
    }
    connection.connectionStatus = ConnectionStatus.ACCEPTED;
    return this.connectionRepo.save(connection);
  }

  async declineRequest(
    userId: string,
    connectionId: string,
  ): Promise<Connection> {
    const connection = await this.getConnectionOrFail(connectionId);
    if (connection.receiver.id !== userId) {
      throw new ForbiddenException('Only the receiver can decline a request');
    }
    if (connection.connectionStatus !== ConnectionStatus.PENDING) {
      throw new BadRequestException('Connection is not pending');
    }
    connection.connectionStatus = ConnectionStatus.DECLINED;
    return this.connectionRepo.save(connection);
  }

  async blockUser(userId: string, connectionId: string): Promise<Connection> {
    const connection = await this.getConnectionOrFail(connectionId);
    this.assertParticipant(connection, userId);
    connection.connectionStatus = ConnectionStatus.BLOCKED;
    return this.connectionRepo.save(connection);
  }

  async removeConnection(userId: string, connectionId: string): Promise<void> {
    const connection = await this.getConnectionOrFail(connectionId);
    this.assertParticipant(connection, userId);
    if (connection.connectionStatus !== ConnectionStatus.ACCEPTED) {
      throw new BadRequestException('Only accepted connections can be removed');
    }
    await this.connectionRepo.remove(connection);
  }

  async unblockUser(
    userId: string,
    connectionId: string,
  ): Promise<{ message: string }> {
    const connection = await this.getConnectionOrFail(connectionId);
    this.assertParticipant(connection, userId);
    if (connection.connectionStatus !== ConnectionStatus.BLOCKED) {
      throw new BadRequestException('This connection is not blocked');
    }
    await this.connectionRepo.remove(connection);
    return { message: 'User unblocked successfully' };
  }

  async getAcceptedConnections(
    userId: string,
  ): Promise<NormalizedConnection[]> {
    const connections = await this.connectionRepo.find({
      where: [
        { sender: { id: userId }, connectionStatus: ConnectionStatus.ACCEPTED },
        {
          receiver: { id: userId },
          connectionStatus: ConnectionStatus.ACCEPTED,
        },
      ],
      relations: { sender: true, receiver: true },
    });
    return connections.map((connection) =>
      this.normalizeConnection(connection, userId),
    );
  }

  async getPendingRequests(userId: string): Promise<NormalizedConnection[]> {
    const connections = await this.connectionRepo.find({
      where: {
        receiver: { id: userId },
        connectionStatus: ConnectionStatus.PENDING,
      },
      relations: { sender: true, receiver: true },
    });
    return connections.map((connection) =>
      this.normalizeConnection(connection, userId),
    );
  }

  async getBlockedConnections(userId: string): Promise<NormalizedConnection[]> {
    const connections = await this.connectionRepo.find({
      where: [
        { sender: { id: userId }, connectionStatus: ConnectionStatus.BLOCKED },
        {
          receiver: { id: userId },
          connectionStatus: ConnectionStatus.BLOCKED,
        },
      ],
      relations: { sender: true, receiver: true },
    });
    return connections.map((connection) =>
      this.normalizeConnection(connection, userId),
    );
  }

  async getConnectionOrFail(connectionId: string): Promise<Connection> {
    const connection = await this.connectionRepo.findOne({
      where: { id: connectionId },
      relations: { sender: true, receiver: true },
    });
    if (!connection) throw new NotFoundException('Connection not found');
    return connection;
  }

  private assertParticipant(connection: Connection, userId: string): void {
    if (connection.sender.id !== userId && connection.receiver.id !== userId) {
      throw new ForbiddenException('You are not a part of this connection');
    }
  }

  private normalizeConnection(
    connection: Connection,
    userId: string,
  ): NormalizedConnection {
    const otherUser =
      connection.sender.id === userId ? connection.receiver : connection.sender;

    return {
      id: connection.id,
      connectionStatus: connection.connectionStatus,
      createdAt: connection.createdAt,
      updatedAt: connection.updatedAt,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name,
      },
    };
  }
}
