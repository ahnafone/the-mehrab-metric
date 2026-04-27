import { Timestamp } from '@angular/fire/firestore';

export interface Merit {
  title: string;
  link: string;
}

export enum FriendType { "Mehrab", "Underlings", "Plebeians" }

export interface Friend {
  id: string;
  name: string;
  email?: string;
  score: number; // in Meh
  reasoning: string;
  avatarUrl: string;
  merits?: Merit[];
  previousRank?: number;
  friendType: FriendType;
  joinedAt: Date | Timestamp | any;
}

export interface Application {
  id: string;
  name: string;
  email: string;
  reasoning: string;
  avatarUrl: string;
  merits: Merit[];
  submittedAt: Date | Timestamp | any;
}
