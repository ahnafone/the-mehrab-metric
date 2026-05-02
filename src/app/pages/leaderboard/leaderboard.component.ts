import { FriendsService } from '../../services/friends.service';
import { AuthService } from './../../services/auth.service';
import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { Friend } from '../../models/friend';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FriendCardComponent } from '../../components/friend-card/friend-card.component';

@Component({
  selector: 'app-leaderboard',
  imports: [FriendCardComponent, CommonModule, RouterLink],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent {
  friendsService = inject(FriendsService);
  authService = inject(AuthService);
  selectedFriend = signal<Friend | null>(null);
  isAuthenticated = computed(() => !!this.authService.currentUser());

  selectFriend(friend: Friend) {
    this.selectedFriend.set(friend);
  }

  closeDetails() {
    this.selectedFriend.set(null);
  }
}
