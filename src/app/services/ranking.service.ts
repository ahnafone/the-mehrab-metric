import { Injectable, signal, computed } from '@angular/core';
import { Friend } from '../models/friend';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private friendsSignal = signal<Friend[]>([
    {
      id: '1',
      name: 'Mehrab',
      score: 1.0,
      reasoning: 'Ekta thabbor marmu',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehrab&backgroundColor=b6e3f4'
    },
    {
      id: '2',
      name: 'Shafkat',
      score: 1.32,
      reasoning: 'Always brings snacks to the LAN party. Solid performance.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede'
    },
    {
      id: '3',
      name: 'Aaida',
      score: 1.72,
      reasoning: 'Decent memes, but sometimes replies with "K".',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=ffdfbf'
    },
    {
      id: '4',
      name: 'Ahnaf',
      score: 0.4,
      reasoning: 'Still owes me $5 from 2021. Points deducted.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=ffd5dc'
    },
    {
      id: '5',
      name: 'Ishmam',
      score: 0.0,
      reasoning: 'Ate my leftover pizza. Unforgivable. Bottom tier.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor&backgroundColor=d1d4f9'
    }
  ]);

  public sortedFriends = computed(() => {
    // Return a sorted copy based on score descending
    return [...this.friendsSignal()].sort((a, b) => b.score - a.score);
  });

  // Future feature: Mehrab can update scores
  public updateScore(id: string, newScore: number, newReasoning?: string) {
    this.friendsSignal.update(friends =>
      friends.map(f => {
        if (f.id === id) {
          return { ...f, score: newScore, ...(newReasoning ? { reasoning: newReasoning } : {}) };
        }
        return f;
      })
    );
  }
}
