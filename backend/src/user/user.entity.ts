import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserStatus } from './user.status';
import { Profile } from 'src/profile/profile.entity';

/**
 * This class represents the attributes of a user.
 */
@Entity()
export class User {
  /**
   * This generates the id for us automatically.
   */
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ type: 'enum', enum: UserStatus, default: UserStatus.ACTIVE })
  userStatus: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column()
  name: string;

  @OneToOne(() => Profile)
  profile: Profile;

  /**
   * No args constructor.
   */
  constructor() {
    this.name = '';
  }
}
