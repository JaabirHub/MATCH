import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/user.entity';
import { DataSource, Repository } from 'typeorm';
import { RegisterDTO } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { Profile } from 'src/profile/profile.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepo: Repository<Profile>,
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDTO) {
    return this.dataSource.transaction(async (manager) => {
      const existing = await manager.findOne(User, {
        where: { email: dto.email },
      });
      if (existing) throw new ConflictException('Email Already In Use');

      const passwordHash = await bcrypt.hash(dto.password, 12);
      const user = this.userRepo.create({
        email: dto.email,
        name: dto.name,
        passwordHash,
      });
      await manager.save(user);

      const profile = manager.create(Profile);
      profile.user = user;
      profile.nickname = dto.name;
      await manager.save(profile);
      return this.signTokens(user);
    });
  }

  async validateUser(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException();

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match) throw new UnauthorizedException();

    return user;
  }

  login(user: User) {
    return this.signTokens(user);
  }

  private signTokens(user: User) {
    const payload = { sub: user.id, email: user.email };
    return {
      accessToken: this.jwtService.sign(payload, { expiresIn: '15m' }),
      refreshToken: this.jwtService.sign(payload, { expiresIn: '7d' }),
    };
  }
}
