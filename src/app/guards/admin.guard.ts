import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // We need to wait for the profile to be loaded if it's async
  // But since it's a signal derived from Firestore collectionData, 
  // it might be null initially.
  
  if (authService.isMehrab()) {
    return true;
  }
  
  return router.parseUrl('/');
};
