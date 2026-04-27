import { Injectable, inject, computed } from '@angular/core';
import { Auth, user, signOut, GoogleAuthProvider, signInWithPopup } from '@angular/fire/auth';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { toSignal } from '@angular/core/rxjs-interop';
import { RankingService } from './ranking.service';
import { FriendType } from '../models/friend';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private firestore = inject(Firestore);
  private rankingService = inject(RankingService);

  // Expose the current user as a signal
  currentUser = toSignal(user(this.auth));

  // Link the authenticated user to their profile in the metric
  currentProfile = computed(() => {
    const fbUser = this.currentUser();
    if (!fbUser) return null;

    // Find the friend entry that matches the logged-in email
    return this.rankingService.sortedFriends().find(f => f.email === fbUser.email);
  });

  isMehrab = computed(() => this.currentProfile()?.friendType === FriendType.Mehrab);
  isUnderling = computed(() => this.currentProfile()?.friendType === FriendType.Underlings);
  isPrivileged = computed(() => {
    const profile = this.currentProfile();
    return profile?.friendType === FriendType.Mehrab || profile?.friendType === FriendType.Underlings;
  });

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(this.auth, provider);
    const email = result.user.email;

    // Verify if this person is already recognized in the metric
    const q = query(collection(this.firestore, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      // If not found in friends, check if they are the Supreme Ranker (override)
      // For now, we strictly require a friend record for any login.
      await signOut(this.auth);
      throw new Error('Access Denied. You have no standing in the Mehrab Metric.');
    }

    return result;
  }

  async logout() {
    return signOut(this.auth);
  }
}
