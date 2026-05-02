import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray, FormGroup, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { RankingService } from '../../services/ranking.service';
import { Merit, Application } from '../../models/friend';
import { AuthService } from '../../services/auth.service';

export interface QuestionOption {
  label: string;
  points: number;
}

export interface Question {
  id: string;
  title: string;
  type: 'single' | 'multiple';
  options: QuestionOption[];
}

export const SUCCESS_SCORE_QUESTIONS: Question[] = [
  {
    id: 'education',
    title: '1. Education',
    type: 'multiple',
    options: [
      { label: 'None of the below', points: 0 },
      { label: 'High school / GED', points: 25 },
      { label: 'Some college', points: 50 },
      { label: 'Associate degree', points: 75 },
      { label: 'Bachelor\'s degree', points: 100 },
      { label: 'Master\'s degree', points: 200 },
      { label: 'Professional degree: MD/JD/PharmD/etc.', points: 300 },
      { label: 'PhD student', points: 250 },
      { label: 'PhD candidate', points: 300 },
      { label: 'PhD graduate', points: 400 },
      { label: 'Multiple graduate degrees', points: 450 }, // 400 + 50 bonus approx
      { label: 'Elite/top-ranked university bonus (Add to above)', points: 100 },
      { label: 'Graduated with honors (Add to above)', points: 50 }
    ]
  },
  {
    id: 'career',
    title: '2. Career / Profession (Highest relevant status)',
    type: 'single',
    options: [
      { label: 'Unemployed / not working', points: 0 },
      { label: 'Part-time job', points: 25 },
      { label: 'Full-time job', points: 75 },
      { label: 'Full-time professional job', points: 100 },
      { label: 'Skilled trade / licensed profession', points: 150 },
      { label: 'Entry-level white-collar/professional role', points: 150 },
      { label: 'Mid-level professional', points: 250 },
      { label: 'Senior professional', points: 350 },
      { label: 'Manager / team lead', points: 400 },
      { label: 'Senior manager / director', points: 600 },
      { label: 'VP / executive', points: 900 },
      { label: 'C-suite / major executive', points: 1500 },
      { label: 'Founder of active company', points: 300 },
      { label: 'Founder of profitable company', points: 700 },
      { label: 'Founder with major exit/acquisition', points: 2000 },
      { label: 'Tenured professor / senior researcher', points: 700 },
      { label: 'Doctor / lawyer / engineer / professor / scientist', points: 400 }
    ]
  },
  {
    id: 'income',
    title: '3. Income (Annual personal income)',
    type: 'single',
    options: [
      { label: 'Under $25k', points: 0 },
      { label: '$25k to $50k', points: 50 },
      { label: '$50k to $75k', points: 100 },
      { label: '$75k to $100k', points: 150 },
      { label: '$100k to $150k', points: 250 },
      { label: '$150k to $250k', points: 400 },
      { label: '$250k to $500k', points: 700 },
      { label: '$500k to $1M', points: 1000 },
      { label: '$1M to $5M', points: 2000 },
      { label: '$5M+', points: 4000 }
    ]
  },
  {
    id: 'netWorth',
    title: '4. Net Worth',
    type: 'single',
    options: [
      { label: 'Negative net worth', points: -50 },
      { label: '$0 to $20k', points: 0 },
      { label: '$20k to $50k', points: 50 },
      { label: '$50k to $100k', points: 100 },
      { label: '$100k to $250k', points: 200 },
      { label: '$250k to $500k', points: 350 },
      { label: '$500k to $1M', points: 500 },
      { label: '$1M to $2M', points: 800 },
      { label: '$2M to $5M', points: 1200 },
      { label: '$5M to $10M', points: 1800 },
      { label: '$10M to $50M', points: 3000 },
      { label: '$50M to $100M', points: 5000 },
      { label: '$100M to $1B', points: 8000 },
      { label: '$1B+', points: 15000 }
    ]
  },
  {
    id: 'relationship',
    title: '5. Relationship / Family Status',
    type: 'single',
    options: [
      { label: 'Single', points: 0 },
      { label: 'In relationship', points: 100 },
      { label: 'Long-term relationship', points: 200 },
      { label: 'Engaged', points: 250 },
      { label: 'Married with one wife (or partner)', points: 300 },
      { label: 'Married with 2-3 wives', points: 400 },
      { label: 'Married with 4+ wives', points: 500 },
      { label: 'Married 5+ years', points: 400 },
      { label: 'Married 10+ years', points: 500 },
      { label: 'Has children (not married)', points: -150 },
      { label: 'Married with children from one partner', points: 400 },
      { label: 'Married with children from multiple partners', points: -500 }
    ]
  },
  {
    id: 'awards',
    title: '6. Awards / Honors (Select all that apply)',
    type: 'multiple',
    options: [
      { label: 'School/local award', points: 25 },
      { label: 'University/department award', points: 50 },
      { label: 'City/regional award', points: 100 },
      { label: 'State/province-level award', points: 200 },
      { label: 'National award', points: 500 },
      { label: 'International award', points: 1000 },
      { label: 'Prestigious scholarship/fellowship', points: 300 },
      { label: 'Major professional/industry award', points: 1000 },
      { label: 'Elite global award (Nobel/Oscar/Olympic gold/etc.)', points: 5000 }
    ]
  },
  {
    id: 'fame',
    title: '7. Fame / Public Recognition (Highest level)',
    type: 'single',
    options: [
      { label: 'Unknown / private person', points: 0 },
      { label: 'Known in school/company/local circle', points: 50 },
      { label: 'Known in local community', points: 100 },
      { label: 'Known within professional field', points: 300 },
      { label: 'Regional recognition', points: 500 },
      { label: 'National recognition / 1M+ followers', points: 1500 },
      { label: 'International recognition / 10M+ followers', points: 4000 },
      { label: 'Household name / 100M+ followers', points: 8000 },
      { label: 'Global celebrity/icon', points: 15000 },
      { label: '1k+ followers/subscribers', points: 25 },
      { label: '10k+ followers/subscribers', points: 100 },
      { label: '100k+ followers/subscribers', points: 500 }
    ]
  },
  {
    id: 'languages',
    title: '8. Languages',
    type: 'single',
    options: [
      { label: 'Fluent in 1 language', points: 0 },
      { label: 'Fluent in 2 languages', points: 150 },
      { label: 'Fluent in 3 languages', points: 350 },
      { label: 'Fluent in 4 languages', points: 600 },
      { label: 'Fluent in 5+ languages', points: 1000 }
    ]
  },
  {
    id: 'creative',
    title: '9. Creative / Entertainment Output (Select all that apply)',
    type: 'multiple',
    options: [
      { label: 'Completed creative project', points: 50 },
      { label: 'Publicly released project', points: 150 },
      { label: 'Professionally released project', points: 400 },
      { label: 'Published book / released album / acted / shipped game', points: 500 },
      { label: 'Successful independent project', points: 700 },
      { label: 'Main role / lead creator in recognized work', points: 1000 },
      { label: 'Critically acclaimed work', points: 1500 },
      { label: 'Commercial hit', points: 2500 },
      { label: 'Major franchise / mainstream hit', points: 5000 },
      { label: 'Era-defining or globally iconic work', points: 10000 }
    ]
  },
  {
    id: 'academic',
    title: '10. Academic / Research Output (Select all that apply)',
    type: 'multiple',
    options: [
      { label: 'Research assistant experience', points: 100 },
      { label: 'Conference poster/presentation', points: 150 },
      { label: 'Published paper', points: 300 },
      { label: 'First-author paper', points: 500 },
      { label: 'Top-tier conference/journal paper', points: 1000 },
      { label: 'Patent', points: 500 },
      { label: '100+ citations', points: 500 },
      { label: '1,000+ citations', points: 2000 },
      { label: '10,000+ citations', points: 8000 },
      { label: 'Widely used research tool/dataset/software', points: 2500 }
    ]
  },
  {
    id: 'business',
    title: '11. Business / Entrepreneurship (Select all that apply)',
    type: 'multiple',
    options: [
      { label: 'Started a business/project', points: 100 },
      { label: 'First revenue', points: 200 },
      { label: 'Profitable side business', points: 400 },
      { label: 'Full-time profitable business', points: 700 },
      { label: 'Employs 1 to 10 people', points: 1000 },
      { label: 'Employs 10 to 100 people', points: 2500 },
      { label: 'Employs 100+ people', points: 5000 },
      { label: 'Raised funding', points: 1000 },
      { label: '$1M+ annual revenue', points: 2000 },
      { label: '$10M+ annual revenue', points: 5000 },
      { label: '$100M+ annual revenue', points: 10000 },
      { label: 'Sold company / major exit', points: 10000 }
    ]
  },
  {
    id: 'property',
    title: '12. Property / Assets (Select all that apply)',
    type: 'multiple',
    options: [
      { label: 'Owns car / reliable vehicle', points: 50 },
      { label: 'Owns home/condo/apartment', points: 300 },
      { label: 'Owns multiple properties', points: 700 },
      { label: 'Owns rental/investment property', points: 1000 },
      { label: 'Owns luxury property', points: 1500 },
      { label: 'Owns major collectible/asset portfolio', points: 1000 }
    ]
  },
  {
    id: 'travel',
    title: '13. Travel / World Experience (Highest level)',
    type: 'single',
    options: [
      { label: 'None of the below', points: 0 },
      { label: 'Traveled outside home state/province', points: 25 },
      { label: 'Traveled internationally', points: 100 },
      { label: 'Visited 5+ countries', points: 200 },
      { label: 'Visited 10+ countries', points: 400 },
      { label: 'Visited 25+ countries', points: 800 },
      { label: 'Visited 50+ countries', points: 1500 },
      { label: 'Lived in another country', points: 300 },
      { label: 'Lived in 3+ countries', points: 700 }
    ]
  },
  {
    id: 'dickSize',
    title: '14. Physical Attributes (Dick Size)',
    type: 'single',
    options: [
      { label: 'I am female (have no dick)', points: 0 },
      { label: 'Under 1" (Micropenis)', points: -1000 },
      { label: '1" to 3" (Extremely Small)', points: -500 },
      { label: '3" to 4" (Very Small)', points: -200 },
      { label: '4" to 5" (Below Average)', points: 0 },
      { label: '5" to 6" (Average)', points: 100 },
      { label: '6" to 7" (Damn)', points: 300 },
      { label: '7" to 8" (Gaddayyum)', points: 800 },
      { label: '8" to 9" (Horry SHEIT)', points: 1500 },
      { label: '9"+ (MashAllah)', points: 3000 }
    ]
  }
];

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
  questions = SUCCESS_SCORE_QUESTIONS;
  totalScore = signal(0);
  answersValue = signal<any>({});

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
    } else {
      this.signupForm.markAllAsTouched();
    }
  }
}
