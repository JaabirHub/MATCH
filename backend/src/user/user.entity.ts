import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Availability } from './user.availability';
import { UserStatus } from './user.status';

/**
 * This class represents the attributes of a user.
 */
@Entity()
export class User {
  /**
   * This generates the id for us automatically.
   */
  @PrimaryGeneratedColumn('uuid')
  public id: string;

  @Column({ unique: true })
  public email: string;

  @Column()
  public passwordHash: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  public userStatus: UserStatus;

  @CreateDateColumn()
  public createdAt: Date;

  @UpdateDateColumn()
  public updatedAt: Date;

  @Column()
  public name: string;

  @Column({ type: 'text', nullable: true })
  public description: string | null;

  @Column('text', { array: true })
  public interests: string[];

  @Column({ type: 'text', nullable: true })
  public city: string | null;

  @Column({ type: 'enum', enum: Availability, array: true })
  public availability: Availability[];

  /**
   * No args constructor.
   */
  constructor() {
    this.name = '';
    this.description = null;
    this.interests = [];
    this.city = null;
    this.availability = [];
  }
}
