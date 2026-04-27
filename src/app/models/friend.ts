export interface Merit {
  title: string;
  link: string;
}

export enum FriendType { "Mehrab", "Underlings", "Plebeians" }

export interface Friend {
  id: string;
  name: string;
  score: number; // in Meh
  reasoning: string;
  avatarUrl: string;
  merits?: Merit[];
  previousRank?: number;
  friendType: FriendType;
  joinedAt: Date;
}

export interface Application {
  id: string;
  name: string;
  reasoning: string;
  avatarUrl: string;
  merits: Merit[];
  submittedAt: Date;
}
