import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router } from '@angular/router';
import { RankingService } from '../../services/ranking.service';
import { Merit } from '../../models/friend';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private rankingService = inject(RankingService);
  private authService = inject(AuthService);

  isSubmitting = signal(false);
  successMessage = signal('');

  signupForm = this.fb.group({
    name: ['', Validators.required],
    reasoning: ['', Validators.required],
    avatarUrl: [''],
    merits: this.fb.array([])
  });

  get merits() {
    return this.signupForm.get('merits') as FormArray;
  }

  addMerit() {
    const meritForm = this.fb.group({
      title: ['', Validators.required],
      link: ['', Validators.required]
    });
    this.merits.push(meritForm);
  }

  removeMerit(index: number) {
    this.merits.removeAt(index);
  }


  async onSubmit() {
    if (this.signupForm.valid) {
      this.isSubmitting.set(true);

      const formData = this.signupForm.value;
      const avatarUrl = formData.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`;

      const user = this.authService.currentUser();
      const email = user?.email || 'unknown@pleb.com';

      const application = {
        name: formData.name as string,
        email: email,
        reasoning: formData.reasoning as string,
        avatarUrl: avatarUrl,
        merits: (formData.merits || []) as Merit[]
      };

      try {
        await this.rankingService.submitApplication(application);
        this.successMessage.set('Application submitted! Mehrab will judge you shortly.');
        this.isSubmitting.set(false);

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      } catch (error) {
        console.error('Submission failed:', error);
        this.isSubmitting.set(false);
      }
    }
  }
}
