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
import { Auth, user } from '@angular/fire/auth';
import { toSignal } from '@angular/core/rxjs-interop';
import { Observable, switchMap, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private firestore = inject(Firestore);
  private auth = inject(Auth);

  private friendsSignal: Signal<Friend[]>;
  private applicationsSignal: Signal<Application[]>;

  constructor() {
    // Wait for auth state before subscribing to Firestore.
    // Firestore rules require authentication, so listeners started
    // before auth is ready get permission-denied errors and never recover.
    const authUser$ = user(this.auth);

    const friends$ = authUser$.pipe(
      switchMap(u => {
        if (!u) return of([] as Friend[]);
        return new Observable<Friend[]>(subscriber => {
          const q = query(collection(this.firestore, 'friends'));
          return onSnapshot(q, (snapshot) => {
            const friends = snapshot.docs.map(doc => {
              const data = doc.data() as any;
              return {
                ...data,
                id: doc.id,
                // Migrate: read `points` with fallback to legacy `score`
                points: data.points ?? data.score ?? 0,
                friendType: typeof data.friendType === 'string'
                  ? friendTypeFromString(data.friendType)
                  : data.friendType
              } as Friend;
            });
            subscriber.next(friends);
          }, (error: any) => subscriber.error(error));
        });
      })
    );
    this.friendsSignal = toSignal(friends$, { initialValue: [] });

    const apps$ = authUser$.pipe(
      switchMap(u => {
        if (!u) return of([] as Application[]);
        return new Observable<Application[]>(subscriber => {
          const q = query(collection(this.firestore, 'applications'));
          return onSnapshot(q, (snapshot) => {
            const apps = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Application));
            subscriber.next(apps);
          }, (error: any) => subscriber.error(error));
        });
      })
    );
    this.applicationsSignal = toSignal(apps$, { initialValue: [] });
  }

  /** Mehrab's raw points — the reference unit for 1 Meh */
  public mehrabPoints = computed(() => {
    const mehrab = this.friendsSignal().find(
      f => f.friendType === FriendType.Mehrab && f.name === "Mehrab"
    );
    return mehrab?.points ?? 1; // fallback to 1 to avoid division by zero
  });

  /** Convert raw points to Meh score (relative to Mehrab) */
  public toMeh(points: number): number {
    const base = this.mehrabPoints();
    if (base === 0) return 0;
    return Math.round((points / base) * 100) / 100;
  }

  public sortedFriends = computed(() => {
    return [...this.friendsSignal()].sort((a, b) => b.points - a.points);
  });

  public applications = computed(() => this.applicationsSignal());

  private async snapshotRanks() {
    const sorted = this.sortedFriends();
    const updates = sorted.map((f, index) => {
      const currentRank = index + 1;
      const friendDoc = doc(this.firestore, `friends/${f.id}`);
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

  public async judgeApplication(appId: string, points: number, reasoning: string) {
    await this.snapshotRanks();
    const app = this.applicationsSignal().find(a => a.id === appId);
    if (app) {
      const newFriend = {
        name: app.name,
        email: app.email,
        points: points,
        reasoning: reasoning,
        friendType: friendTypeToString(FriendType.Plebeians),
        avatarUrl: app.avatarUrl,
        merits: app.merits,
        joinedAt: Timestamp.now()
      };

      // Use email as ID for friends
      const friendDoc = doc(this.firestore, `friends/${app.email}`);
      await setDoc(friendDoc, newFriend);

      // Remove from applications
      await deleteDoc(doc(this.firestore, `applications/${appId}`));
    }
  }

  public async updateFriend(id: string, updates: Partial<Friend>) {
    await this.snapshotRanks();
    const friendDoc = doc(this.firestore, `friends/${id}`);

    const finalUpdates = { ...updates } as any;
    if (updates.friendType !== undefined) {
      finalUpdates.friendType = friendTypeToString(updates.friendType);
    }

    await updateDoc(friendDoc, finalUpdates);
  }

  public async deleteFriend(id: string) {
    await this.snapshotRanks();
    const friendDoc = doc(this.firestore, `friends/${id}`);
    await deleteDoc(friendDoc);
  }
}
