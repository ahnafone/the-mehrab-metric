import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RankingService } from '../../services/ranking.service';
import { Friend } from '../../models/friend';
import { CommonModule } from '@angular/common';
import { FriendCardComponent } from '../../components/friend-card/friend-card.component';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [FriendCardComponent, CommonModule],
  templateUrl: './leaderboard.component.html',
  styleUrl: './leaderboard.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeaderboardComponent {
  rankingService = inject(RankingService);
  selectedFriend = signal<Friend | null>(null);

  selectFriend(friend: Friend) {
    this.selectedFriend.set(friend);
  }

  closeDetails() {
    this.selectedFriend.set(null);
  }
}
