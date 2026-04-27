import { Injectable, signal, computed } from '@angular/core';
import { Friend, Application, FriendType } from '../models/friend';

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private friendsSignal = signal<Friend[]>([
    {
      id: '1',
      name: 'Mehrab',
      score: 1.0,
      friendType: FriendType.Mehrab,
      reasoning: 'Ekta thabbor marmu',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehrab&backgroundColor=b6e3f4',
      joinedAt: new Date('2024-01-01')
    },
    {
      id: '2',
      name: 'Shafkat',
      friendType: FriendType.Underlings,
      score: 1.32,
      reasoning: 'Always brings snacks to the LAN party. Solid performance.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede',
      joinedAt: new Date('2024-01-05')
    },
    {
      id: '3',
      name: 'Aaida',
      friendType: FriendType.Plebeians,
      score: 1.72,
      reasoning: 'Decent memes, but sometimes replies with "K".',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=ffdfbf',
      joinedAt: new Date('2024-02-10')
    },
    {
      id: '4',
      name: 'Ahnaf',
      friendType: FriendType.Underlings,
      score: 0.4,
      reasoning: 'Still owes me $5 from 2021. Points deducted.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=ffd5dc',
      joinedAt: new Date('2024-02-15')
    },
    {
      id: '5',
      name: 'Ishmam',
      friendType: FriendType.Underlings,
      score: 0.0,
      reasoning: 'Has yellow teeth.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor&backgroundColor=d1d4f9',
      joinedAt: new Date('2024-03-01')
    }
  ]);

  private applicationsSignal = signal<Application[]>([
    {
      id: 'app-1',
      name: 'Orchit',
      reasoning: 'I have a collection of rare mechanical keyboards.',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Orchit&backgroundColor=b6e3f4',
      merits: [
        { title: 'Keyboard Collection', link: 'https://example.com/keyboards' }
      ],
      submittedAt: new Date()
    }
  ]);

  public sortedFriends = computed(() => {
    return [...this.friendsSignal()].sort((a, b) => b.score - a.score);
  });

  public applications = computed(() => this.applicationsSignal());

  private snapshotRanks() {
    const sorted = this.sortedFriends();
    this.friendsSignal.update(friends =>
      friends.map(f => {
        const currentRank = sorted.findIndex(s => s.id === f.id) + 1;
        return { ...f, previousRank: currentRank > 0 ? currentRank : f.previousRank };
      })
    );
  }

  public submitApplication(app: Omit<Application, 'id' | 'submittedAt'>) {
    const newApp: Application = {
      ...app,
      id: `app-${Date.now()}`,
      submittedAt: new Date()
    };
    this.applicationsSignal.update(apps => [...apps, newApp]);
  }

  public judgeApplication(appId: string, score: number, reasoning: string) {
    this.snapshotRanks();
    const app = this.applicationsSignal().find(a => a.id === appId);
    if (app) {
      const newFriend: Friend = {
        id: `friend-${Date.now()}`,
        name: app.name,
        score: score,
        reasoning: reasoning,
        friendType: FriendType.Plebeians,
        avatarUrl: app.avatarUrl,
        merits: app.merits,
        joinedAt: new Date()
      };
      this.friendsSignal.update(friends => [...friends, newFriend]);
      this.applicationsSignal.update(apps => apps.filter(a => a.id !== appId));
    }
  }

  public updateFriend(id: string, updates: Partial<Friend>) {
    this.snapshotRanks();
    this.friendsSignal.update(friends =>
      friends.map(f => f.id === id ? { ...f, ...updates } : f)
    );
  }

  public deleteFriend(id: string) {
    this.snapshotRanks();
    this.friendsSignal.update(friends => friends.filter(f => f.id !== id));
  }
}
