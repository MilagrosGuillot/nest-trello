import { IsNotEmpty, IsString, IsInt, IsMongoId } from 'class-validator';

export class CreateListDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsMongoId()
  @IsNotEmpty()
  boardId: string;

  @IsInt()
  @IsNotEmpty()
  order: number;
}
