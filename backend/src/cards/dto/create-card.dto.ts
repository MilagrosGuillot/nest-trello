import { IsNotEmpty, IsString, IsInt, IsMongoId, IsOptional, IsBoolean } from 'class-validator';

export class CreateCardDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsMongoId()
  @IsNotEmpty()
  listId: string;

  @IsInt()
  @IsNotEmpty()
  order: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
