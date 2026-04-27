import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RankingService } from '../../services/ranking.service';
import { Merit } from '../../models/friend';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private rankingService = inject(RankingService);

  isSubmitting = signal(false);
  successMessage = signal('');
  fileName = signal('');
  imagePreview = signal('');

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

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.fileName.set(file.name);
      const reader = new FileReader();
      reader.onload = () => {
        this.imagePreview.set(reader.result as string);
        this.signupForm.patchValue({ avatarUrl: '' }); // Clear URL if file uploaded
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit() {
    if (this.signupForm.valid) {
      this.isSubmitting.set(true);
      
      const formData = this.signupForm.value;
      const avatarUrl = formData.avatarUrl || this.imagePreview() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${formData.name}`;

      const application = {
        name: formData.name as string,
        reasoning: formData.reasoning as string,
        avatarUrl: avatarUrl,
        merits: (formData.merits || []) as Merit[]
      };

      // Simulate network delay
      setTimeout(() => {
        this.rankingService.submitApplication(application);
        
        this.successMessage.set('Application submitted! Mehrab will judge you shortly.');
        this.isSubmitting.set(false);

        setTimeout(() => {
          this.router.navigate(['/']);
        }, 2000);
      }, 1500);
    }
  }
}
