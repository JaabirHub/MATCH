import { Injectable } from '@nestjs/common';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepo: Repository<User>,
  ) {}

  findAll() {
    return this.usersRepo.find();
  }

  // /**
  //  * This allows users to add an interest to their profile.
  //  *
  //  * @param interest The interest they are adding.
  //  */
  // public addInterest(interest: string): void {
  //   const trimmed = interest.trim();

  //   if (!trimmed) {
  //     throw new Error('Interest cannot be empty');
  //   }

  //   if (this.interests.includes(trimmed)) {
  //     throw new Error('Interest already exists');
  //   }

  //   this.interests.push(trimmed);
  // }

  // /**
  //  * This allows users to remove an interest from their profile.
  //  *
  //  * @param interest The interest you want to remove.
  //  */
  // public removeInterest(interest: string): void {
  //   const index = this.interests.indexOf(interest);

  //   if (index === -1) {
  //     throw new Error('Interest does not exist');
  //   }

  //   this.interests.splice(index, 1);
  // }

  // /**
  //  * This allows users to add an availability time to their profile.
  //  *
  //  * @param availability The availability they want to add.
  //  */
  // public addAvailability(availability: Availability) {
  //   if (this.availability.includes(availability)) {
  //     throw new Error('Availability already exists');
  //   }

  //   this.availability.push(availability);
  // }

  // /**
  //  * This allows users to remove an availability time from their profile.
  //  *
  //  * @param availability The availability they want to remove.
  //  */
  // public removeAvailability(availability: Availability) {
  //   const index = this.availability.indexOf(availability);

  //   if (index === -1) {
  //     throw new Error('Availability does not exist');
  //   }

  //   this.availability.splice(index, 1);
  // }
}
