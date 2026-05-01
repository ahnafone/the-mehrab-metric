import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  isLoading = signal(false);
  errorMessage = signal('');

  constructor() {
    effect(() => {
      if (this.authService.currentUser()) {
        this.router.navigate(['/']);
      }
    });
  }

  async loginWithGoogle() {
    this.isLoading.set(true);
    this.errorMessage.set('');

    const result = await this.authService.loginWithGoogle();

    if (result.status === 'success') {
      // The effect handles the redirect automatically when currentUser signal updates
    } else if (result.status === 'access_denied') {
      this.errorMessage.set('Access Denied. You have no standing in the Mehrab Metric.');
    } else {
      this.errorMessage.set('Identity verification failed. Are you truly who you say you are?');
    }

    this.isLoading.set(false);
  }
}
