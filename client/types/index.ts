export interface Board {
  id: string;
  title: string;
  ownerId: string;
  members: {
    id: string;
    email: string;
  }[];
}

export interface List {
  id: string;
  title: string;
  order: number;
  boardId: string;
}

export interface Card {
  id: string;
  title: string;
  description: string;
  order: number;
  listId: string;
  completed: boolean;
}

export interface User {
  sub: string;
  email: string;
} 