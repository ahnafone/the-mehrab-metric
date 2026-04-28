import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="app-footer">
      <div class="footer-content glass-panel">
        <p class="footer-text">
          This Website is certified by <span class="highlight">Mehrab</span> and his underlings.
        </p>
        <p class="copyright">&copy; 2026 The Mehrab Metric. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: `
    .app-footer {
      padding: 16px;
      margin-top: auto;
      display: flex;
      justify-content: center;
    }

    .footer-content {
      padding: 24px 4rem;
      text-align: center;
    }

    .footer-text {
      font-family: var(--font-display);
      font-size: 1.125rem;
      font-weight: 500;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .footer-text .highlight {
      color: var(--text-primary);
      font-weight: 700;
      position: relative;
    }

    .footer-text .highlight::after {
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background: var(--gradient-primary);
      border-radius: 2px;
    }

    .copyright {
      font-size: 0.75rem;
      color: var(--text-tertiary);
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
  `
})
export class FooterComponent { }
