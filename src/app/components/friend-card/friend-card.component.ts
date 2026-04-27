import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { Friend } from '../../models/friend';

@Component({
  selector: 'app-friend-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div 
      class="friend-card glass-panel"
      [class.rank-1]="rank() === 1"
      [class.rank-2]="rank() === 2"
      [class.rank-3]="rank() === 3"
    >
      <div class="rank-badge">
        <span class="rank-number">#{{ rank() }}</span>
      </div>
      
      <div class="avatar-container">
        <img [src]="friend().avatarUrl" [alt]="friend().name + ' avatar'" class="avatar" loading="lazy">
      </div>

      <div class="card-content">
        <div class="header-row">
          <h2 class="name">{{ friend().name }}</h2>
          <div class="score-badge">
            <span class="score-value">{{ friend().score }}</span>
            <span class="score-label">Meh</span>
          </div>
        </div>
        
        <div class="reasoning-container">
          <span class="mehrab-says">Mehrab says:</span>
          <p class="reasoning">"{{ friend().reasoning }}"</p>
        </div>
      </div>
    </div>
  `,
  styles: `
    .friend-card {
      display: flex;
      align-items: center;
      padding: 20px;
      gap: 24px;
      position: relative;
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease, border-color 0.3s ease;
      cursor: default;
    }

    .friend-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
      background: var(--surface-hover);
    }

    /* Rank Specific Styling */
    .friend-card.rank-1 {
      border-color: var(--rank-1);
    }
    .friend-card.rank-1 .rank-badge {
      background: var(--gradient-rank-1);
      color: #000;
    }
    .friend-card.rank-1:hover {
      box-shadow: 0 12px 32px rgba(251, 191, 36, 0.15);
    }

    .friend-card.rank-2 {
      border-color: var(--rank-2);
    }
    .friend-card.rank-2 .rank-badge {
      background: var(--gradient-rank-2);
      color: #000;
    }

    .friend-card.rank-3 {
      border-color: var(--rank-3);
    }
    .friend-card.rank-3 .rank-badge {
      background: var(--gradient-rank-3);
      color: #fff;
    }

    .rank-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: 12px;
      background: var(--surface-color);
      color: var(--text-secondary);
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 1.25rem;
      flex-shrink: 0;
      box-shadow: inset 0 2px 4px rgba(255,255,255,0.1);
    }

    .avatar-container {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid var(--surface-hover);
      background: var(--bg-color);
    }

    .avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .card-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .header-row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .name {
      font-family: var(--font-display);
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0;
      letter-spacing: -0.02em;
    }

    .score-badge {
      display: flex;
      align-items: baseline;
      gap: 4px;
      background: rgba(0,0,0,0.2);
      padding: 4px 12px;
      border-radius: 20px;
      border: 1px solid var(--surface-hover);
    }

    .score-value {
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 1.125rem;
      color: var(--text-primary);
    }

    .score-label {
      font-size: 0.75rem;
      color: var(--text-secondary);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .reasoning-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .mehrab-says {
      font-size: 0.75rem;
      font-weight: 600;
      color: var(--gradient-primary); /* Fallback */
      background: var(--gradient-primary);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    .reasoning {
      font-size: 0.9375rem;
      color: var(--text-secondary);
      line-height: 1.5;
      font-style: italic;
      margin: 0;
    }

    @media (max-width: 600px) {
      .friend-card {
        padding: 16px;
        gap: 16px;
      }
      
      .rank-badge {
        width: 40px;
        height: 40px;
        font-size: 1.125rem;
      }

      .avatar-container {
        width: 48px;
        height: 48px;
      }

      .name {
        font-size: 1.25rem;
      }
    }
  `
})
export class FriendCardComponent {
  friend = input.required<Friend>();
  rank = input.required<number>();
}
