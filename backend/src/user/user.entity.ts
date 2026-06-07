import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Availability } from './user.availability';

/**
 * This class represents the attributes of a user.
 */
@Entity()
export class User {
  /**
   * This generates the id for us automatically.
   */
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column()
  public description: string;

  @Column('text', { array: true })
  public interests: string[];

  @Column()
  public city: string;

  @Column({ type: 'enum', enum: Availability, array: true})
  public availability: Availability[];

  /**
   * No args constructor.
   */
  constructor() {
    this.name = '';
    this.description = '';
    this.interests = [];
    this.city = '';
    this.availability = [];
  }
  
  /**
   * This allows users to add an interest to their profile.
   *
   * @param interest The interest they are adding.
   */
  public addInterest(interest: string): void {
    const trimmed = interest.trim();

    if (!trimmed) {
      throw new Error('Interest cannot be empty');
    }

    if (this.interests.includes(trimmed)) {
      throw new Error('Interest already exists');
    }

    this.interests.push(trimmed);
  }

  /**
   * This allows users to remove an interest from their profile.
   *
   * @param interest The interest you want to remove.
   */
  public removeInterest(interest: string): void {
    const index = this.interests.indexOf(interest);

    if (index === -1) {
      throw new Error('Interest does not exist');
    }

    this.interests.splice(index, 1);
  }

  /**
   * This allows users to add an availability time to their profile.
   *
   * @param availability The availability they want to add.
   */
  public addAvailability(availability: Availability) {
    if (this.availability.includes(availability)) {
      throw new Error('Availability already exists');
    }

    this.availability.push(availability);
  }

  /**
   * This allows users to remove an availability time from their profile.
   *
   * @param availability The availability they want to remove.
   */
  public removeAvailability(availability: Availability) {
    const index = this.availability.indexOf(availability);

    if (index === -1) {
      throw new Error('Availability does not exist');
    }

    this.availability.splice(index, 1);
  }

  //Getters and Setters for class attributes.
  public getId(): number {
    return this.id;
  }

  public getName(): string {
    return this.name;
  }

  public setName(name: string): void {
    const trimmed = name.trim();

    if (!trimmed) {
      throw new Error('Name cannot be empty');
    }

    this.name = trimmed;
  }

  public getInterests(): string[] {
    return [...this.interests];
  }


  public getCity(): string {
    return this.city;
  }

  public setCity(city: string): void {
    const trimmed = city.trim();

    if (!trimmed) {
      throw new Error('City cannot be empty');
    }

    this.city = trimmed;
  }

  public getDescription(): string {
    return this.description;
  } 

  public setDescription(description: string): void {
    const trimmed = description.trim();

    if (!trimmed) {
      throw new Error('Description cannot be empty');
    }

    this.description = trimmed;
  }

  public getAvailability(): Availability[] {
    return [...this.availability];
  }
  
}
