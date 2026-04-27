import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="app-header">
      <div class="header-content glass-panel">
        <h1 class="title" routerLink="/">
          The <span class="text-gradient">Mehrab</span> Metric
        </h1>
        <p class="subtitle">Official Friend Rankings. Decided by Mehrab.</p>
        
        <nav class="header-nav">
          <a routerLink="/signup" class="nav-button join-button">Join the Metric</a>
        </nav>
      </div>
    </header>
  `,
  styles: `
    .app-header {
      padding: 48px 16px 32px;
      display: flex;
      justify-content: center;
    }

    .header-content {
      padding: 32px 48px;
      text-align: center;
      border-radius: 24px;
      max-width: 600px;
      width: 100%;
    }

    .title {
      font-family: var(--font-display);
      font-size: 3rem;
      font-weight: 900;
      letter-spacing: -0.04em;
      margin-bottom: 8px;
      color: var(--text-primary);
      cursor: pointer;
    }

    .subtitle {
      font-size: 1.125rem;
      color: var(--text-secondary);
      font-weight: 500;
      letter-spacing: 0.02em;
      margin-bottom: 24px;
    }

    .header-nav {
      display: flex;
      justify-content: center;
      gap: 16px;
    }

    .nav-button {
      padding: 10px 24px;
      border-radius: 12px;
      font-family: var(--font-display);
      font-weight: 700;
      text-decoration: none;
      transition: transform 0.2s, opacity 0.2s;
      cursor: pointer;
    }

    .join-button {
      background: var(--gradient-primary);
      color: white;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    .join-button:hover {
      transform: translateY(-2px);
      opacity: 0.9;
    }

    @media (max-width: 600px) {
      .app-header {
        padding: 32px 16px 24px;
      }

      .header-content {
        padding: 24px 20px;
      }

      .title {
        font-size: 2rem;
      }

      .subtitle {
        font-size: 1rem;
      }
    }
  `
})
export class HeaderComponent {}
