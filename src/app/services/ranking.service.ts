import { Injectable, signal, computed, inject } from '@angular/core';
import { Friend, Application, FriendType } from '../models/friend';
import {
  Firestore,
  collection,
  collectionData,
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

  private friendsCollection = collection(this.firestore, 'users');
  private applicationsCollection = collection(this.firestore, 'applications');

  // Friends signal synced with Firestore
  private friends$ = collectionData(this.friendsCollection, { idField: 'id' }) as Observable<Friend[]>;
  private friendsSignal = toSignal(this.friends$, { initialValue: [] });

  // Applications signal synced with Firestore
  private applications$ = collectionData(this.applicationsCollection, { idField: 'id' }) as Observable<Application[]>;
  private applicationsSignal = toSignal(this.applications$, { initialValue: [] });

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
      const newFriend: Omit<Friend, 'id'> = {
        name: app.name,
        email: app.email,
        score: score,
        reasoning: reasoning,
        friendType: FriendType.Plebeians,
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
    await updateDoc(friendDoc, updates);
  }

  public async deleteFriend(id: string) {
    await this.snapshotRanks();
    const friendDoc = doc(this.firestore, `users/${id}`);
    await deleteDoc(friendDoc);
  }
}
