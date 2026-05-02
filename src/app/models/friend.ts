import { Timestamp } from '@angular/fire/firestore';

export interface Merit {
  title: string;
  link: string;
}

export enum FriendType { Mehrab, Underlings, Plebeians, Ishmam }

export function friendTypeFromString(s: string): FriendType {
  switch (s) {
    case 'Mehrab': return FriendType.Mehrab;
    case 'Underlings': return FriendType.Underlings;
    case 'Plebeians': return FriendType.Plebeians;
    case 'Ishmam': return FriendType.Ishmam;
    default:
      throw new Error(`Invalid friend type: ${s}`);
  }
}
export function friendTypeToString(t: FriendType): string {
  switch (t) {
    case FriendType.Mehrab: return 'Mehrab';
    case FriendType.Underlings: return 'Underlings';
    case FriendType.Plebeians: return 'Plebeians';
    case FriendType.Ishmam: return 'Ishmam';
    default:
      throw new Error(`Invalid friend type: ${t}`);
  }
}

export interface Friend {
  id: string;
  name: string;
  email: string;
  points: number; // raw score from the rubric
  reasoning: string;
  avatarUrl: string;
  merits?: Merit[];
  answers?: any;
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
  score: number;
  answers: any;
  submittedAt: Date | Timestamp | any;
}
