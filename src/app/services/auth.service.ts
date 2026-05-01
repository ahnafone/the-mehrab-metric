import { Injectable, inject, computed } from '@angular/core';
import { Auth, user, signOut, GoogleAuthProvider, signInWithPopup, UserCredential } from '@angular/fire/auth';
import { doc, Firestore, getDoc } from '@angular/fire/firestore';
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

  async loginWithGoogle(): Promise<{ authResult?: UserCredential, status: "success" | "access_denied" | "error" | "already_signed_in" }> {
    if (this.auth.currentUser) {
      return { status: "already_signed_in" };
    }

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(this.auth, provider);

      // Verify if this person is already recognized in the metric
      const docReference = doc(this.firestore, 'friends/' + result.user.uid);
      const docSnapshot = await getDoc(docReference);

      if (!docSnapshot.exists()) {
        // If not found in friends, check if they are the Supreme Ranker (override)
        // For now, we strictly require a friend record for any login.
        await signOut(this.auth);
        return { status: "access_denied" };
      }

      return { authResult: result, status: 'success' };
    } catch (error) {
      console.error('Login error:', error);
      return { status: 'error' };
    }
  }

  async logout() {
    return signOut(this.auth);
  }
}
