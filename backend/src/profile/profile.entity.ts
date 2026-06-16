import { User } from 'src/user/user.entity';
import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { Interest } from './profile-interest.enum';

@Entity()
export class Profile {
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  nickname: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'simple-array'})
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
