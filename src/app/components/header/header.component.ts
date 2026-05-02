import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { faChartBar, faGavel, faSignOutAlt, faUser, faShareNodes, faRankingStar, faRightToBracket } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FontAwesomeModule, CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  host: {
    '(document:click)': 'onDocumentClick($event)'
  }
})
export class HeaderComponent {
  private router = inject(Router);
  public authService = inject(AuthService);
  faMetrics = faChartBar;
  faJudge = faGavel;
  faInvite = faShareNodes;
  faLogout = faSignOutAlt;
  faUser = faUser;
  faLeaderboard = faRankingStar;
  faLogin = faRightToBracket;

  copied = signal(false);
  isDropdownOpen = signal(false);

  toggleDropdown(event: Event) {
    event.stopPropagation();
    this.isDropdownOpen.update(v => !v);
  }

  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-avatar-container')) {
      this.isDropdownOpen.set(false);
    }
  }

  async logout() {
    await this.authService.logout();
    this.isDropdownOpen.set(false);
    this.router.navigate(['/login']);
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
