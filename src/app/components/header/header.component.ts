import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { faChartBar, faGavel, faUserPlus, faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FontAwesomeModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  public authService = inject(AuthService);
  faMetrics = faChartBar;
  faJudge = faGavel;
  faInvite = faUserPlus;
  faLogout = faSignOutAlt;

  copied = signal(false);

  logout() {
    this.authService.logout();
  }

  copyInviteLink() {
    const link = window.location.origin + '/signup';
    navigator.clipboard.writeText(link).then(() => {
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 2000);
    });
  }

  private titles = [
    { prefix: '', name: 'Mehrab’s', suffix: ' Mandate' },
    { prefix: 'The ', name: 'Mehrab', suffix: ' Metric' },
    { prefix: 'Trial by ', name: 'Mehrab', suffix: '' },
    { prefix: 'The ', name: 'Mehrab', suffix: ' Scale' }
  ];

  currentTitle = signal(this.titles[Math.floor(Math.random() * this.titles.length)]);
}
