import { IsString, IsOptional, MinLength, MaxLength } from 'class-validator';

export class UpdateBoardDto {
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'El título no puede estar vacío' })
  @MaxLength(10, { message: 'El título no puede tener más de 100 caracteres' })
  title?: string;
} 