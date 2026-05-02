import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { ApplicationsService } from '../../services/applications.service';
import { Merit, Application } from '../../models/friend';
import { AuthService } from '../../services/auth.service';
import { Question, QuestionOption, SUCCESS_SCORE_QUESTIONS } from '../../models/question';



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
  private applicationsService = inject(ApplicationsService);
  private authService = inject(AuthService);

  isSubmitting = signal(false);
  isSigningIn = signal(false);
  successMessage = signal('');
  authMessage = signal('');
  questions = SUCCESS_SCORE_QUESTIONS;
  totalScore = signal(0);
  answersValue = signal<any>({});
  currentUser = this.authService.currentUser;

  steps = ['Profile', 'Education & Career', 'Wealth & Assets', 'Life & Experience', 'Achievements', 'Merits'];
  currentStep = signal(0);

  questionGroups: Record<string, string[]> = {
    'Education & Career': ['education', 'career'],
    'Wealth & Assets': ['income', 'netWorth', 'property'],
    'Life & Experience': ['relationship', 'travel', 'languages'],
    'Achievements': ['awards', 'fame', 'creative', 'academic', 'business']
  };

  signupForm = this.fb.group({
    name: ['', Validators.required],
    reasoning: ['', Validators.required],
    avatarUrl: [''],
    merits: this.fb.array([]),
    answers: this.buildAnswersForm()
  });

  constructor() {
    this.signupForm.get('answers')?.valueChanges.subscribe(values => {
      this.answersValue.set(values);
      this.calculateScore(values);
    });

    // Initialize signals with default values
    setTimeout(() => {
      const initialValues = this.signupForm.get('answers')?.value;
      this.answersValue.set(initialValues);
      this.calculateScore(initialValues);
    });
  }

  nextStep() {
    if (this.currentStep() < this.steps.length - 1) {
      // Validate current step if needed (Profile step)
      if (this.currentStep() === 0) {
        if (this.signupForm.get('name')?.invalid || this.signupForm.get('reasoning')?.invalid) {
          this.signupForm.get('name')?.markAsTouched();
          this.signupForm.get('reasoning')?.markAsTouched();
          return;
        }
      }
      this.currentStep.update(v => v + 1);
    }
  }

  prevStep() {
    if (this.currentStep() > 0) {
      this.currentStep.update(v => v - 1);
    }
  }

  getQuestionsForCurrentStep(): Question[] {
    const stepName = this.steps[this.currentStep()];
    const ids = this.questionGroups[stepName] || [];
    return this.questions.filter(q => ids.includes(q.id));
  }

  getOptionsForQuestion(id: string): QuestionOption[] {
    return this.questions.find(q => q.id === id)?.options || [];
  }

  private buildAnswersForm(): FormGroup {
    const group: any = {};

    for (const q of this.questions) {
      if (q.type === 'single') {
        // default to first option
        group[q.id] = new FormControl(q.options[0].label);
      } else {
        const optionControls: any = {};
        q.options.forEach(opt => {
          optionControls[opt.label] = new FormControl(false);
        });
        group[q.id] = new FormGroup(optionControls);
      }
    }

    return new FormGroup(group);
  }

  private calculateScore(answers: any) {
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

    this.totalScore.set(score);
  }

  get merits() {
    return this.signupForm.get('merits') as FormArray;
  }

  get answers() {
    return this.signupForm.get('answers') as FormGroup;
  }

  getQuestionFormGroup(questionId: string): FormGroup {
    return this.answers.get(questionId) as FormGroup;
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

      // Ensure recalculation with latest values
      this.calculateScore(formData.answers);

      const application: Omit<Application, 'id' | 'submittedAt'> = {
        name: formData.name as string,
        email: email,
        reasoning: formData.reasoning as string,
        avatarUrl: avatarUrl,
        merits: (formData.merits || []) as Merit[],
        score: this.totalScore(),
        answers: formData.answers
      };

      try {
        await this.applicationsService.submitApplication(application);
        this.successMessage.set('Application submitted! Mehrab will judge you shortly.');
        this.isSubmitting.set(false);

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      } catch (error) {
        console.error('Submission failed:', error);
        this.isSubmitting.set(false);
      }
    } else {
      this.signupForm.markAllAsTouched();
    }
  }

  async onSignInClick() {
    this.isSigningIn.set(true);
    this.authMessage.set('');

    try {
      const result = await this.authService.loginWithGoogle();

      if (result.status === 'success' || result.status === 'already_signed_in') {
        this.authMessage.set('');
      } else if (result.status === 'access_denied') {
        this.authMessage.set('Access denied. Only ranked friends can sign in.');
      } else {
        this.authMessage.set('Sign in failed. Please try again.');
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      this.authMessage.set('Sign in failed. Please try again.');
    } finally {
      this.isSigningIn.set(false);
    }
  }
}
