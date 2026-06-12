import { IsArray, IsOptional, IsString, MinLength } from 'class-validator';

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
  @IsString({ each: true })
  interests: string[];

  @IsOptional()
  @IsString()
  city: string;
}
