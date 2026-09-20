import { User } from 'src/user/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Interest } from './profile-interest.enum';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  nickname: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ 
    type: 'simple-array',
    default: '',
  })
  interests: Interest[];

  @Column({ type: 'text' })
  city: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id' })
  user: User;

  constructor() {
    this.nickname = '';
    this.description = '';
    this.interests = [];
    this.city = '';
  }
}
