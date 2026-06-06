import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id: number;

  @Column()
  public name: string;

  @Column('text', { array: true })
  public interests: string[];

  @Column()
  public city: string;

  constructor() {
    this.name = '';
    this.interests = [];
    this.city = '';
  }

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
}
