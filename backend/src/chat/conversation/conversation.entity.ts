import { Connection } from 'src/connection/connection.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'connection_id',
    type: 'uuid',
    unique: true,
  })
  connectionId: string;

  @OneToOne(() => Connection, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'connection_id',
  })
  connection: Connection;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
