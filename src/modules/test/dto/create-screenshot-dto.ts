import { IsString, IsOptional, IsUUID } from 'class-validator';

export class CreateScreenshotDto {
  @IsString()
  imageUrl: string;

  @IsOptional()
  @IsString()
  description?: string;
}
