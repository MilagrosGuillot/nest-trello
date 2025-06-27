export class BoardResponseDto {
    id: string;
    title: string;
    ownerId: string;
    members: {
      id: string;
      email: string;
    }[];
  }