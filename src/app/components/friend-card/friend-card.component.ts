import { Component, ChangeDetectionStrategy, input, computed } from '@angular/core';
import { DecimalPipe } from '@angular/common';
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
      [class.is-mehrab]="isMehrab()"
      [class.is-ishmam]="isIshmam()"
      [class.is-golden-child]="isGoldenChild()"
    >
      <div class="rank-badge">
        <div class="rank-badge-content">
          <span class="rank-number">#{{ rank() }}</span>
          @if (rankChange() !== 'none') {
            <span class="rank-indicator" [class]="rankChange()">
              @if (rankChange() === 'new') {
                NEW
              } @else {
                {{ rankChange() === 'up' ? '▲' : '▼' }}
              }
            </span>
          }
        </div>
      </div>
      
      <div class="avatar-container">
        <img [src]="friend().avatarUrl" [alt]="friend().name + ' avatar'" class="avatar" loading="lazy">
        @if (isMehrab()) {
          <div class="judge-icon">⚖️</div>
        } @else if (isGoldenChild()) {
          <div class="halo">✨</div>
        }
      </div>

      <div class="card-content">
        <div class="header-row">
          <div class="name-container">
            <h2 class="name">{{ friend().name }}</h2>
            @if (isMehrab()) {
              <span class="special-tag supreme">SUPREME RANKER</span>
            } @else if (isIshmam()) {
              <span class="special-tag wanted">MOST WANTED</span>
            } @else if (isGoldenChild()) {
              <span class="special-tag favorite">GOLDEN CHILD</span>
            }
          </div>
          <div class="score-container">
            <div class="score-badge">
              <span class="score-value">{{ mehScore() }}</span>
              <span class="score-label">Meh</span>
            </div>
          </div>
        </div>
        
        <div class="reasoning-container">
          <span class="mehrab-says">
            @if (isMehrab()) {
              The Supreme Verdict:
            } @else if (isIshmam()) {
              Hooligan Report:
            } @else if (isGoldenChild()) {
              Mehrab's Beloved:
            } @else {
              Mehrab says:
            }
          </span>
          <p class="reasoning">"{{ friend().reasoning }}"</p>
        </div>
      </div>
      
      @if (isMehrab()) {
        <div class="shimmer"></div>
      }
      @if (isIshmam()) {
        <div class="graffiti">UR A HOOLIGAN</div>
      }
      @if (isGoldenChild()) {
        <div class="sparkles-overlay"></div>
      }
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
      cursor: pointer;
    }

    .friend-card.active {
      background: rgba(99, 102, 241, 0.1);
      border-color: var(--gradient-primary);
      box-shadow: 0 0 20px rgba(99, 102, 241, 0.2);
    }

    .friend-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
      background: var(--surface-hover);
    }

    /* Mehrab Special Styling: Supreme Ranker (Judge Theme) */
    .friend-card.is-mehrab {
      background: linear-gradient(135deg, rgba(139, 0, 0, 0.15) 0%, rgba(0, 0, 0, 0.4) 100%);
      border: 1px solid #d4af37; /* Metallic Gold */
      box-shadow: 0 0 30px rgba(212, 175, 55, 0.1);
    }

    .friend-card.is-mehrab .name {
      color: #d4af37;
      text-shadow: 0 0 15px rgba(212, 175, 55, 0.3);
    }

    .friend-card.is-mehrab .score-badge {
      background: rgba(212, 175, 55, 0.15);
      border-color: #d4af37;
    }

    .friend-card.is-mehrab .score-value {
      color: #d4af37;
    }

    .shimmer {
      position: absolute;
      top: -100%;
      left: -100%;
      width: 300%;
      height: 300%;
      background: linear-gradient(
        45deg,
        transparent 45%,
        rgba(212, 175, 55, 0.05) 50%,
        transparent 55%
      );
      animation: shimmer 4s infinite linear;
      pointer-events: none;
    }

    @keyframes shimmer {
      0% { transform: translate(-10%, -10%); }
      100% { transform: translate(10%, 10%); }
    }

    .judge-icon {
      position: absolute;
      top: -6px;
      right: -6px;
      font-size: 1.5rem;
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.5));
      z-index: 2;
    }

    /* Golden Child Styling */
    .friend-card.is-golden-child {
      background: linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 215, 0, 0.05) 100%);
      border: 2px solid rgba(255, 215, 0, 0.3);
      box-shadow: 0 0 25px rgba(255, 215, 0, 0.1);
    }

    .friend-card.is-golden-child .name {
      color: #fff;
      text-shadow: 0 0 10px rgba(255, 215, 0, 0.4);
    }

    .friend-card.is-golden-child .avatar-container {
      border-color: #ffd700;
      box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
    }

    .halo {
      position: absolute;
      top: -12px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 1.5rem;
      animation: float 3s ease-in-out infinite;
      z-index: 2;
    }

    @keyframes float {
      0%, 100% { transform: translate(-50%, 0); }
      50% { transform: translate(-50%, -5px); }
    }

    .sparkles-overlay {
      position: absolute;
      inset: 0;
      background-image: 
        radial-gradient(circle, #ffd700 1px, transparent 1px),
        radial-gradient(circle, #ffffff 1px, transparent 1px);
      background-size: 40px 40px, 30px 30px;
      background-position: 0 0, 15px 15px;
      opacity: 0.1;
      animation: drift 20s linear infinite;
      pointer-events: none;
    }

    @keyframes drift {
      from { background-position: 0 0, 15px 15px; }
      to { background-position: 40px 40px, 45px 45px; }
    }

    .favorite {
      background: #ffd700;
      color: #000;
      font-weight: 900;
      box-shadow: 0 0 12px rgba(255, 215, 0, 0.5);
    }

    /* Ishmam Special Styling: Hooligan Theme */
    .friend-card.is-ishmam {
      background: repeating-linear-gradient(
        45deg,
        rgba(0, 0, 0, 0.3),
        rgba(0, 0, 0, 0.3) 10px,
        rgba(20, 20, 20, 0.3) 10px,
        rgba(20, 20, 20, 0.3) 20px
      );
      border: 2px dashed #ef4444;
      transform: rotate(-1deg);
    }

    .friend-card.is-ishmam:hover {
      transform: rotate(0deg) scale(1.02);
    }

    .friend-card.is-ishmam .avatar-container {
      border: 2px solid #ef4444;
      filter: grayscale(0.5) sepia(0.2);
    }

    .friend-card.is-ishmam .name {
      color: #ef4444;
      font-family: 'Courier New', Courier, monospace;
      text-transform: uppercase;
    }

    .friend-card.is-ishmam .score-badge {
      background: #ef4444;
      color: white;
      transform: rotate(5deg);
    }

    .friend-card.is-ishmam .score-value {
      color: white;
    }

    .graffiti {
      position: absolute;
      bottom: 5px;
      right: 10px;
      font-family: 'Permanent Marker', cursive, sans-serif;
      color: rgba(239, 68, 68, 0.3);
      font-size: 1.5rem;
      transform: rotate(-15deg);
      pointer-events: none;
      user-select: none;
    }

    .name-container {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }

    .special-tag {
      font-size: 0.625rem;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 4px;
      width: fit-content;
      letter-spacing: 0.05em;
    }

    .supreme {
      background: #d4af37;
      color: #000;
      box-shadow: 0 2px 10px rgba(212, 175, 55, 0.6);
    }

    .wanted {
      background: #ef4444;
      color: white;
      font-weight: 900;
      text-transform: uppercase;
      box-shadow: 0 0 10px rgba(239, 68, 68, 0.5);
    }

    /* Rank Specific Styling */
    .friend-card.rank-1:not(.is-mehrab) {
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
      flex-shrink: 0;
      box-shadow: inset 0 2px 4px rgba(255,255,255,0.1);
    }

    .rank-badge-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      line-height: 1;
    }

    .rank-number {
      font-size: 1.25rem;
    }

    .rank-indicator {
      font-size: 0.625rem;
      font-weight: 900;
      margin-top: 2px;
    }

    .rank-indicator.up {
      color: #22c55e;
    }

    .rank-indicator.down {
      color: #ef4444;
    }

    .rank-indicator.new {
      color: var(--gradient-rank-1);
      font-size: 0.5rem;
    }

    .avatar-container {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      overflow: visible;
      flex-shrink: 0;
      border: 2px solid var(--surface-hover);
      background: var(--bg-color);
      position: relative;
    }

    .avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
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

    .score-container {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 2px;
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

    .points-label {
      font-size: 0.6875rem;
      color: var(--text-secondary);
      opacity: 0.7;
      text-align: right;
      margin-top: 2px;
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
  mehScore = input.required<number>();

  isMehrab = computed(() => this.friend().name.toLowerCase() === 'mehrab');
  isIshmam = computed(() => this.friend().name.toLowerCase() === 'ishmam');
  isGoldenChild = computed(() => this.rank() === 1 && !this.isMehrab());
  rankChange = computed(() => {
    const prev = this.friend().previousRank;
    const curr = this.rank();
    if (prev === undefined) return 'new';
    if (curr < prev) return 'up';
    if (curr > prev) return 'down';
    return 'none';
  });
}
