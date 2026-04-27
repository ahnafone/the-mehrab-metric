import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { RankingService } from '../../services/ranking.service';
import { FriendCardComponent } from '../friend-card/friend-card.component';
import { Friend } from '../../models/friend';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-leaderboard',
  standalone: true,
  imports: [FriendCardComponent, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="leaderboard-wrapper" [class.has-selection]="selectedFriend()">
      <div class="leaderboard-container">
        <div class="friends-list">
          @for (friend of rankingService.sortedFriends(); track friend.id) {
            <app-friend-card 
              [friend]="friend" 
              [rank]="$index + 1"
              (click)="selectFriend(friend)"
              [class.active]="selectedFriend()?.id === friend.id"
            />
          }
        </div>
      </div>

      @if (selectedFriend(); as friend) {
        <aside class="details-panel glass-panel">
          <button class="close-button" (click)="closeDetails()">×</button>
          
          <div class="details-header">
            <img [src]="friend.avatarUrl" [alt]="friend.name" class="details-avatar">
            <div class="details-title-row">
              <h2 class="details-name">{{ friend.name }}</h2>
              <div class="details-score">
                <span class="value">{{ friend.score }}</span>
                <span class="unit">Meh</span>
              </div>
            </div>
          </div>

          <div class="details-content">
            <section class="details-section">
              <h3>The Verdict</h3>
              <p class="details-reasoning">"{{ friend.reasoning }}"</p>
            </section>

            @if (friend.merits?.length) {
              <section class="details-section">
                <h3>Merits & Credentials</h3>
                <div class="merits-grid">
                  @for (merit of friend.merits; track $index) {
                    <a [href]="merit.link" target="_blank" class="merit-item">
                      <span class="merit-icon">✦</span>
                      <span class="merit-text">{{ merit.title }}</span>
                      <span class="external-link">↗</span>
                    </a>
                  }
                </div>
              </section>
            }

            <section class="details-section">
              <h3>Status History</h3>
              <div class="history-timeline">
                <div class="timeline-item">
                  <span class="timeline-dot"></span>
                  <div class="timeline-info">
                    <span class="timeline-status">Officially Ranked</span>
                    <span class="timeline-date">Admitted to the Metric on {{ friend.joinedAt | date:'longDate' }}</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </aside>
      }
    </div>
  `,
  styles: `
    .leaderboard-wrapper {
      display: grid;
      grid-template-columns: 1fr;
      gap: 32px;
      max-width: 1200px;
      margin: 0 auto;
      transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .leaderboard-wrapper.has-selection {
      grid-template-columns: 1fr 400px;
    }

    .leaderboard-container {
      width: 100%;
      padding: 0 16px;
    }

    .friends-list {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-bottom: 48px; 
    }

    /* Details Panel Styles */
    .details-panel {
      position: sticky;
      top: 32px;
      height: calc(100vh - 64px);
      min-height: 600px;
      padding: 40px;
      display: flex;
      flex-direction: column;
      gap: 32px;
      animation: slideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      overflow-y: auto;
    }

    @keyframes slideIn {
      from { transform: translateX(50px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    .close-button {
      position: absolute;
      top: 16px;
      right: 16px;
      background: none;
      border: none;
      color: var(--text-tertiary);
      font-size: 2rem;
      cursor: pointer;
      line-height: 1;
      padding: 8px;
      transition: color 0.2s;
    }

    .close-button:hover {
      color: var(--text-primary);
    }

    .details-header {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      gap: 20px;
    }

    .details-avatar {
      width: 120px;
      height: 120px;
      border-radius: 32px;
      border: 4px solid var(--surface-hover);
      object-fit: cover;
      box-shadow: 0 20px 40px rgba(0,0,0,0.3);
    }

    .details-name {
      font-family: var(--font-display);
      font-size: 2.5rem;
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .details-score {
      display: flex;
      align-items: baseline;
      gap: 8px;
      justify-content: center;
      margin-top: 8px;
    }

    .details-score .value {
      font-size: 2rem;
      font-weight: 900;
      color: var(--gradient-primary);
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .details-score .unit {
      font-size: 1rem;
      font-weight: 700;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }

    .details-content {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .details-section h3 {
      font-family: var(--font-display);
      font-size: 0.875rem;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: var(--text-tertiary);
      margin-bottom: 16px;
    }

    .details-reasoning {
      font-size: 1.125rem;
      line-height: 1.6;
      color: var(--text-secondary);
      font-style: italic;
      background: rgba(255,255,255,0.03);
      padding: 20px;
      border-radius: 16px;
      border-left: 4px solid var(--gradient-primary);
    }

    .merits-grid {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .merit-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 14px 20px;
      background: rgba(255,255,255,0.05);
      border: 1px solid var(--border-color);
      border-radius: 16px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .merit-item:hover {
      background: rgba(255,255,255,0.08);
      transform: scale(1.02);
      border-color: rgba(99, 102, 241, 0.5);
    }

    .merit-icon { color: #818cf8; }
    .merit-text { flex: 1; color: var(--text-primary); font-weight: 600; }
    .external-link { font-size: 0.875rem; color: var(--text-tertiary); }

    .history-timeline {
      padding-left: 8px;
    }

    .timeline-item {
      display: flex;
      gap: 16px;
      position: relative;
    }

    .timeline-dot {
      width: 12px;
      height: 12px;
      background: var(--gradient-primary);
      border-radius: 50%;
      margin-top: 4px;
      z-index: 1;
    }

    .timeline-info {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .timeline-status {
      font-weight: 700;
      color: var(--text-primary);
    }

    .timeline-date {
      font-size: 0.875rem;
      color: var(--text-tertiary);
    }

    @media (max-width: 1000px) {
      .leaderboard-wrapper.has-selection {
        grid-template-columns: 1fr;
      }
      
      .details-panel {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 100;
        border-radius: 0;
      }
    }
  `
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
