import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RankingService } from '../../services/ranking.service';
import { FriendCardComponent } from '../friend-card/friend-card.component';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [FriendCardComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="leaderboard-container">
      <div class="friends-list">
        @for (friend of rankingService.sortedFriends(); track friend.id) {
          <app-friend-card 
            [friend]="friend" 
            [rank]="$index + 1"
          />
        }
      </div>
    </div>
  `,
  styles: `
    .leaderboard-container {
      width: 100%;
      max-width: 800px;
      margin: 0 auto;
      padding: 0 16px;
    }

    .friends-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      /* Add some padding at the bottom so the last item isn't flush with the screen edge */
      padding-bottom: 48px; 
    }
  `
})
export class LeaderboardComponent {
  rankingService = inject(RankingService);
}
