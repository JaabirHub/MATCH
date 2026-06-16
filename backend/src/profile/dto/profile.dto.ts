import { IsArray, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { Interest } from '../profile-interest.enum';

export class ProfileDTO {
  @IsOptional()
  @IsString()
  @MinLength(1)
  nickname: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  description: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Interest, { each: true })
  interests: Interest[];

  @IsOptional()
  @IsString()
  city: string;
}
