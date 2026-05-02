import { Component, ChangeDetectionStrategy, inject, computed, signal } from '@angular/core';
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
  faClock,
  faPenToSquare
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
  faEdit = faPenToSquare;
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

  isAvatarMenuOpen = signal(false);
  avatarUpdateMessage = signal<string | null>(null);
  isUpdatingAvatar = signal(false);
  isCustomUrlModalOpen = signal(false);
  customUrlInput = signal('');

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

  avatarUrl = computed(() => {
    const fbUser = this.user();
    if (!fbUser) return '';
    return this.profile()?.avatarUrl || fbUser.photoURL || '';
  });

  toggleAvatarMenu(force?: boolean): void {
    this.isAvatarMenuOpen.set(force ?? !this.isAvatarMenuOpen());
  }

  async useDicebearAvatar(): Promise<void> {
    const user = this.user();
    if (!user) return;
    const seed = user.displayName?.split(' ')[0];
    await this.updateAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=ffd5dc`);
  }

  async useGoogleAvatar(): Promise<void> {
    const user = this.user();
    if (!user?.photoURL) {
      this.avatarUpdateMessage.set('No Google profile photo found for your account.');
      return;
    }
    await this.updateAvatar(user.photoURL);
  }

  async useCustomAvatarLink(): Promise<void> {
    this.customUrlInput.set(this.avatarUrl());
    this.isCustomUrlModalOpen.set(true);
    this.isAvatarMenuOpen.set(false);
  }

  closeCustomUrlModal(): void {
    this.isCustomUrlModalOpen.set(false);
    this.customUrlInput.set('');
  }

  async submitCustomUrl(): Promise<void> {
    const url = this.customUrlInput().trim();
    if (!url) return;
    this.isCustomUrlModalOpen.set(false);
    await this.updateAvatar(url);
  }

  updateCustomUrlInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.customUrlInput.set(input.value);
  }

  private async updateAvatar(url: string): Promise<void> {
    if (!this.isValidHttpUrl(url)) {
      this.avatarUpdateMessage.set('Please provide a valid image URL.');
      return;
    }

    const profile = this.profile();
    if (!profile?.id) {
      this.avatarUpdateMessage.set('Avatar updates are available for ranked profiles only.');
      return;
    }

    this.isUpdatingAvatar.set(true);
    this.avatarUpdateMessage.set(null);
    try {
      await this.friendsService.updateFriend(profile.id, { avatarUrl: url });
      this.avatarUpdateMessage.set('Avatar updated successfully.');
      this.isAvatarMenuOpen.set(false);
    } catch (error) {
      console.error('Avatar update failed:', error);
      this.avatarUpdateMessage.set('Could not update avatar. Please try again.');
    } finally {
      this.isUpdatingAvatar.set(false);
    }
  }

  private isValidHttpUrl(value: string): boolean {
    try {
      const parsedUrl = new URL(value);
      return parsedUrl.protocol === 'https:' || parsedUrl.protocol === 'http:';
    } catch {
      return false;
    }
  }

  toDate(timestamp: any): Date | null {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (typeof timestamp.toDate === 'function') return timestamp.toDate();
    return new Date(timestamp);
  }
}
