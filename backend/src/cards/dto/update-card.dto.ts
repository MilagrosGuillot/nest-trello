import { IsString, IsInt, IsMongoId, IsOptional, IsBoolean } from 'class-validator';

export class UpdateCardDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;
  
  @IsMongoId()
  @IsOptional()
  listId?: string;

  @IsInt()
  @IsOptional()
  order?: number;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
} 