import { Injectable, signal, computed, inject, Signal } from '@angular/core';
import { Friend, Application, FriendType, friendTypeFromString, friendTypeToString } from '../models/friend';
import {
  Firestore,
  collection,
  onSnapshot,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  addDoc,
  Timestamp,
  query,
  orderBy
} from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, map } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private firestore = inject(Firestore);

  private friendsSignal: Signal<Friend[]>;
  private applicationsSignal: Signal<Application[]>;

  constructor() {
    const friends$ = new Observable<Friend[]>(subscriber => {
      const q = query(collection(this.firestore, 'users'));
      return onSnapshot(q, (snapshot) => {
        const friends = snapshot.docs.map(doc => {
          const data = doc.data() as any;
          return {
            ...data,
            id: doc.id,
            friendType: typeof data.friendType === 'string'
              ? friendTypeFromString(data.friendType)
              : data.friendType
          } as Friend;
        });
        subscriber.next(friends);
      }, (error: any) => subscriber.error(error));
    });
    this.friendsSignal = toSignal(friends$, { initialValue: [] });

    const apps$ = new Observable<Application[]>(subscriber => {
      const q = query(collection(this.firestore, 'applications'));
      return onSnapshot(q, (snapshot) => {
        const apps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Application));
        subscriber.next(apps);
      }, (error: any) => subscriber.error(error));
    });
    this.applicationsSignal = toSignal(apps$, { initialValue: [] });
  }

  public sortedFriends = computed(() => {
    return [...this.friendsSignal()].sort((a, b) => b.score - a.score);
  });

  public applications = computed(() => this.applicationsSignal());

  private async snapshotRanks() {
    const sorted = this.sortedFriends();
    const updates = sorted.map((f, index) => {
      const currentRank = index + 1;
      const friendDoc = doc(this.firestore, `users/${f.id}`);
      return updateDoc(friendDoc, { previousRank: currentRank });
    });
    await Promise.all(updates);
  }

  public async submitApplication(appData: Omit<Application, 'id' | 'submittedAt'>) {
    const newApp = {
      ...appData,
      submittedAt: Timestamp.now()
    };
    // Use email as ID for applications
    const appDoc = doc(this.firestore, `applications/${appData.email}`);
    await setDoc(appDoc, newApp);
  }

  public async judgeApplication(appId: string, score: number, reasoning: string) {
    await this.snapshotRanks();
    const app = this.applicationsSignal().find(a => a.id === appId);
    if (app) {
      const newFriend = {
        name: app.name,
        email: app.email,
        score: score,
        reasoning: reasoning,
        friendType: friendTypeToString(FriendType.Plebeians),
        avatarUrl: app.avatarUrl,
        merits: app.merits,
        joinedAt: Timestamp.now()
      };

      // Use email as ID for friends
      const friendDoc = doc(this.firestore, `users/${app.email}`);
      await setDoc(friendDoc, newFriend);

      // Remove from applications
      await deleteDoc(doc(this.firestore, `applications/${appId}`));
    }
  }

  public async updateFriend(id: string, updates: Partial<Friend>) {
    await this.snapshotRanks();
    const friendDoc = doc(this.firestore, `users/${id}`);
    
    const finalUpdates = { ...updates } as any;
    if (updates.friendType !== undefined) {
      finalUpdates.friendType = friendTypeToString(updates.friendType);
    }
    
    await updateDoc(friendDoc, finalUpdates);
  }

  public async deleteFriend(id: string) {
    await this.snapshotRanks();
    const friendDoc = doc(this.firestore, `users/${id}`);
    await deleteDoc(friendDoc);
  }
}
