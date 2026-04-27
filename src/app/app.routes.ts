import { Routes } from '@angular/router';
import { LeaderboardComponent } from './components/leaderboard/leaderboard.component';
import { SignupComponent } from './components/signup/signup.component';

export const routes: Routes = [
  { path: '', component: LeaderboardComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', redirectTo: '' }
];
