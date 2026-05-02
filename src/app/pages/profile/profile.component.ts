import { Component, ChangeDetectionStrategy, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { FriendsService } from '../../services/friends.service';
import { ApplicationsService } from '../../services/applications.service';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faStar,
  faTrophy,
  faAward,
  faCalendarAlt,
  faShieldAlt,
  faEnvelope,
  faInfoCircle,
  faChevronRight,
  faCheckCircle,
  faClock
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProfileComponent {
  public authService = inject(AuthService);
  public friendsService = inject(FriendsService);
  public applicationsService = inject(ApplicationsService);

  // Icons
  faStar = faStar;
  faTrophy = faTrophy;
  faAward = faAward;
  faCalendar = faCalendarAlt;
  faShield = faShieldAlt;
  faEnvelope = faEnvelope;
  faInfo = faInfoCircle;
  faChevron = faChevronRight;
  faCheck = faCheckCircle;
  faClock = faClock;

  // Derived state
  user = this.authService.currentUser;

  profile = computed(() => {
    const email = this.user()?.email;
    if (!email) return null;
    return this.friendsService.sortedFriends().find(f => f.email === email);
  });

  pendingApplication = computed(() => {
    const email = this.user()?.email;
    if (!email) return null;
    return this.applicationsService.applications().find(a => a.email === email);
  });

  rank = computed(() => {
    const email = this.user()?.email;
    if (!email) return -1;
    const index = this.friendsService.sortedFriends().findIndex(f => f.email === email);
    return index !== -1 ? index + 1 : -1;
  });

  totalRanked = computed(() => this.friendsService.sortedFriends().length);

  mehScore = computed(() => {
    const p = this.profile();
    if (!p) return 0;
    return this.friendsService.toMeh(p.points);
  });

  status = computed(() => {
    if (this.profile()) return 'RANKED';
    if (this.pendingApplication()) return 'PENDING';
    return 'UNRANKED';
  });

  toDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    return new Date(timestamp);
  }
}
