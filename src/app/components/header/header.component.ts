import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { faChartBar, faGavel, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent {
  faMetrics = faChartBar;
  faJudge = faGavel;
  faInvite = faUserPlus;

  copied = signal(false);

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
