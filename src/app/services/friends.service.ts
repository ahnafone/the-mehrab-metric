import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import {
  Firestore,
  Timestamp,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  updateDoc,
} from '@angular/fire/firestore';
import { map, Observable } from 'rxjs';
import { Friend, FriendType, friendTypeFromString, friendTypeToString } from '../models/friend';

@Injectable({
  providedIn: 'root',
})
export class FriendsService {
  private readonly firestore = inject(Firestore);

  private readonly friendsSignal = toSignal(
    (collectionData(query(collection(this.firestore, 'friends')), { idField: 'id' }) as Observable<any[]>).pipe(
      map(friends =>
        friends.map(
          data =>
            ({
              ...data,
              // Migrate: read `points` with fallback to legacy `score`.
              points: data.points ?? data.score ?? 0,
              friendType: typeof data.friendType === 'string' ? friendTypeFromString(data.friendType) : data.friendType,
              joinedAt: data.joinedAt instanceof Timestamp ? data.joinedAt.toDate() : data.joinedAt,
            }) as Friend
        )
      )
    ),
    { initialValue: [] }
  );

  /** Mehrab's raw points — the reference unit for 1 Meh. */
  readonly mehrabPoints = computed(() => {
    const mehrab = this.friendsSignal().find(f => f.friendType === FriendType.Mehrab && f.name === 'Mehrab');
    return mehrab?.points ?? 1; // Fallback to 1 to avoid division by zero.
  });

  readonly sortedFriends = computed(() => [...this.friendsSignal()].sort((a, b) => b.points - a.points));

  /** Convert raw points to Meh score (relative to Mehrab). */
  toMeh(points: number): number {
    const base = this.mehrabPoints();
    if (base === 0) return 0;
    return Math.round((points / base) * 100) / 100;
  }

  async snapshotRanks(): Promise<void> {
    const updates = this.sortedFriends().map((friend, index) => {
      const currentRank = index + 1;
      return updateDoc(doc(this.firestore, `friends/${friend.id}`), { previousRank: currentRank });
    });
    await Promise.all(updates);
  }

  async updateFriend(id: string, updates: Partial<Friend>): Promise<void> {
    await this.snapshotRanks();
    const friendDoc = doc(this.firestore, `friends/${id}`);

    const finalUpdates: Record<string, unknown> = { ...updates };
    if (updates.friendType !== undefined) {
      finalUpdates['friendType'] = friendTypeToString(updates.friendType);
    }

    await updateDoc(friendDoc, finalUpdates);
  }

  async deleteFriend(id: string): Promise<void> {
    await this.snapshotRanks();
    await deleteDoc(doc(this.firestore, `friends/${id}`));
  }
}
