import { Component, ChangeDetectionStrategy, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators, FormGroup, FormControl } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FriendsService } from '../../services/friends.service';
import { ApplicationsService } from '../../services/applications.service';
import { AuthService } from '../../services/auth.service';
import { Friend, Application, FriendType } from '../../models/friend';
import { SUCCESS_SCORE_QUESTIONS, Question } from '../../models/question';
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
  public friendsService = inject(FriendsService);
  public applicationsService = inject(ApplicationsService);
  private authService = inject(AuthService);

  questions = SUCCESS_SCORE_QUESTIONS;

  applications = this.applicationsService.applications;
  friends = this.friendsService.sortedFriends;

  selectedApplication = signal<Application | null>(null);
  selectedFriend = signal<Friend | null>(null);
  expandedQuestions = signal<Record<string, boolean>>({});

  canExile = computed(() => {
    const friend = this.selectedFriend();
    if (!friend) return false;
    // Only Plebeians can be exiled. Mehrab and Underlings are protected.
    return friend.friendType === FriendType.Plebeians;
  });

  judgeForm = this.fb.group({
    points: [{ value: 500, disabled: true }, [Validators.required, Validators.min(0), Validators.max(100000)]],
    reasoning: ['', Validators.required],
    answers: this.fb.group({})
  });

  editForm = this.fb.group({
    points: [{ value: 0, disabled: true }, [Validators.required, Validators.min(0), Validators.max(100000)]],
    reasoning: ['', Validators.required],
    answers: this.fb.group({})
  });

  /** Live Meh preview for the judge form */
  judgeMehPreview = computed(() => {
    const pts = this.judgeForm.get('points')?.value ?? 0;
    return this.friendsService.toMeh(pts);
  });

  /** Live Meh preview for the edit form */
  editMehPreview = computed(() => {
    const pts = this.editForm.get('points')?.value ?? 0;
    return this.friendsService.toMeh(pts);
  });

  private buildAnswersForm(initialAnswers: any = null): FormGroup {
    const group: any = {};
    for (const q of this.questions) {
      if (q.type === 'single') {
        group[q.id] = new FormControl(initialAnswers?.[q.id] || q.options[0].label);
      } else {
        const optionControls: any = {};
        q.options.forEach(opt => {
          optionControls[opt.label] = new FormControl(initialAnswers?.[q.id]?.[opt.label] || false);
        });
        group[q.id] = new FormGroup(optionControls);
      }
    }
    return new FormGroup(group);
  }

  private calculateScore(answers: any, targetForm: FormGroup) {
    if (!answers) return;
    let score = 0;
    for (const q of this.questions) {
      const answer = answers[q.id];
      if (!answer) continue;

      if (q.type === 'single') {
        const option = q.options.find(o => o.label === answer);
        if (option) {
          score += option.points;
        }
      } else if (q.type === 'multiple') {
        for (const opt of q.options) {
          if (answer[opt.label] === true) {
            score += opt.points;
          }
        }
      }
    }
    targetForm.get('points')?.setValue(score, { emitEvent: false });
  }

  selectApplication(app: Application) {
    this.selectedApplication.set(app);
    this.selectedFriend.set(null);

    const answersGroup = this.buildAnswersForm(app.answers);
    this.judgeForm.setControl('answers', answersGroup);

    answersGroup.valueChanges.subscribe(values => {
      this.calculateScore(values, this.judgeForm);
    });

    this.judgeForm.patchValue({
      points: app.score ?? 500,
      reasoning: app.reasoning
    });

    // Reset expanded states when selecting a new application
    this.expandedQuestions.set({});
  }

  toggleQuestion(id: string) {
    this.expandedQuestions.update(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }

  getSelectedAnswer(question: Question): string {
    const activeForm = this.selectedApplication() ? this.judgeForm : this.editForm;
    const control = activeForm.get(['answers', question.id]);
    if (!control) return 'None';

    if (question.type === 'single') {
      return control.value || 'None';
    } else {
      const val = control.value;
      if (!val) return 'None';
      const selected = Object.keys(val).filter(k => val[k]);
      return selected.length > 0 ? selected.join(', ') : 'None';
    }
  }

  selectFriend(friend: Friend) {
    this.selectedFriend.set(friend);
    this.selectedApplication.set(null);

    const answersGroup = this.buildAnswersForm(friend.answers);
    this.editForm.setControl('answers', answersGroup);

    answersGroup.valueChanges.subscribe(values => {
      this.calculateScore(values, this.editForm);
    });

    this.editForm.patchValue({
      points: friend.points,
      reasoning: friend.reasoning
    });

    // Reset expanded states
    this.expandedQuestions.set({});
  }

  async onJudge() {
    const app = this.selectedApplication();
    if (app && this.judgeForm.valid) {
      const { points, reasoning, answers } = this.judgeForm.getRawValue();
      try {
        await this.applicationsService.judgeApplication(app.id, points!, reasoning!, answers);
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
      const { points, reasoning, answers } = this.editForm.getRawValue();
      try {
        await this.friendsService.updateFriend(friend.id, {
          points: points!,
          reasoning: reasoning!,
          answers: answers
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
        await this.friendsService.deleteFriend(friend.id);
        if (this.selectedFriend()?.id === friend.id) {
          this.selectedFriend.set(null);
        }
      } catch (error) {
        console.error('Exile failed:', error);
      }
    }
  }
}
