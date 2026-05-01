import { Component, ChangeDetectionStrategy, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RankingService } from '../../services/ranking.service';
import { AuthService } from '../../services/auth.service';
import { Friend, Application, FriendType } from '../../models/friend';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, FontAwesomeModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  faBack = faChevronLeft;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  public rankingService = inject(RankingService);
  private authService = inject(AuthService);

  applications = this.rankingService.applications;
  friends = this.rankingService.sortedFriends;

  selectedApplication = signal<Application | null>(null);
  selectedFriend = signal<Friend | null>(null);

  canExile = computed(() => {
    const friend = this.selectedFriend();
    if (!friend) return false;
    // Only Plebeians can be exiled. Mehrab and Underlings are protected.
    return friend.friendType === FriendType.Plebeians;
  });

  judgeForm = this.fb.group({
    points: [500, [Validators.required, Validators.min(0), Validators.max(100000)]],
    reasoning: ['', Validators.required]
  });

  editForm = this.fb.group({
    points: [0, [Validators.required, Validators.min(0), Validators.max(100000)]],
    reasoning: ['', Validators.required]
  });

  /** Live Meh preview for the judge form */
  judgeMehPreview = computed(() => {
    const pts = this.judgeForm.get('points')?.value ?? 0;
    return this.rankingService.toMeh(pts);
  });

  /** Live Meh preview for the edit form */
  editMehPreview = computed(() => {
    const pts = this.editForm.get('points')?.value ?? 0;
    return this.rankingService.toMeh(pts);
  });

  selectApplication(app: Application) {
    this.selectedApplication.set(app);
    this.selectedFriend.set(null);
    this.judgeForm.patchValue({
      points: 500,
      reasoning: app.reasoning
    });
  }

  selectFriend(friend: Friend) {
    this.selectedFriend.set(friend);
    this.selectedApplication.set(null);

    const isFixed = friend.name.toLowerCase() === 'mehrab' || friend.name.toLowerCase() === 'ishmam';

    this.editForm.patchValue({
      points: friend.points,
      reasoning: friend.reasoning
    });

    if (isFixed) {
      this.editForm.get('points')?.disable();
    } else {
      this.editForm.get('points')?.enable();
    }
  }

  async onJudge() {
    const app = this.selectedApplication();
    if (app && this.judgeForm.valid) {
      const { points, reasoning } = this.judgeForm.getRawValue();
      try {
        await this.rankingService.judgeApplication(app.id, points!, reasoning!);
        this.selectedApplication.set(null);
        this.judgeForm.reset({ points: 500, reasoning: '' });
      } catch (error) {
        console.error('Judgment failed:', error);
      }
    }
  }

  async onUpdateFriend() {
    const friend = this.selectedFriend();
    if (friend && this.editForm.valid) {
      const { points, reasoning } = this.editForm.getRawValue();
      try {
        await this.rankingService.updateFriend(friend.id, {
          points: points!,
          reasoning: reasoning!
        });
        this.selectedFriend.set(null);
        this.editForm.reset();
      } catch (error) {
        console.error('Update failed:', error);
      }
    }
  }

  async onDeleteFriend(friend: Friend) {
    if (friend.friendType !== FriendType.Plebeians) {
      alert('This subject is protected and cannot be exiled.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${friend.name} from the metric?`)) {
      try {
        await this.rankingService.deleteFriend(friend.id);
        if (this.selectedFriend()?.id === friend.id) {
          this.selectedFriend.set(null);
        }
      } catch (error) {
        console.error('Exile failed:', error);
      }
    }
  }
}
