import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RankingService } from '../../services/ranking.service';
import { Friend, Application, FriendType } from '../../models/friend';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.css'
})
export class AdminComponent {
  private rankingService = inject(RankingService);
  private fb = inject(FormBuilder);

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
    score: [0.5, [Validators.required, Validators.min(0), Validators.max(10)]],
    reasoning: ['', Validators.required]
  });

  editForm = this.fb.group({
    score: [0, [Validators.required, Validators.min(0), Validators.max(10)]],
    reasoning: ['', Validators.required]
  });

  selectApplication(app: Application) {
    this.selectedApplication.set(app);
    this.selectedFriend.set(null);
    this.judgeForm.patchValue({
      score: 0.5,
      reasoning: app.reasoning
    });
  }

  selectFriend(friend: Friend) {
    this.selectedFriend.set(friend);
    this.selectedApplication.set(null);

    const isFixed = friend.name.toLowerCase() === 'mehrab' || friend.name.toLowerCase() === 'ishmam';

    this.editForm.patchValue({
      score: friend.score,
      reasoning: friend.reasoning
    });

    if (isFixed) {
      this.editForm.get('score')?.disable();
    } else {
      this.editForm.get('score')?.enable();
    }
  }

  onJudge() {
    const app = this.selectedApplication();
    if (app && this.judgeForm.valid) {
      const { score, reasoning } = this.judgeForm.getRawValue();
      this.rankingService.judgeApplication(app.id, score!, reasoning!);
      this.selectedApplication.set(null);
      this.judgeForm.reset({ score: 0.5, reasoning: '' });
    }
  }

  onUpdateFriend() {
    const friend = this.selectedFriend();
    if (friend && this.editForm.valid) {
      const { score, reasoning } = this.editForm.getRawValue();
      this.rankingService.updateFriend(friend.id, {
        score: score!,
        reasoning: reasoning!
      });
      this.selectedFriend.set(null);
      this.editForm.reset();
    }
  }

  onDeleteFriend(friend: Friend) {
    if (friend.friendType !== FriendType.Plebeians) {
      alert('This subject is protected and cannot be exiled.');
      return;
    }

    if (confirm(`Are you sure you want to delete ${friend.name} from the metric?`)) {
      this.rankingService.deleteFriend(friend.id);
      if (this.selectedFriend()?.id === friend.id) {
        this.selectedFriend.set(null);
      }
    }
  }
}
