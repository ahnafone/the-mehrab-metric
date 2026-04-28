import { Application, Friend, FriendType } from "./friend";
import { signal } from "@angular/core";

export const friendsSignal = signal<Friend[]>([
    {
        id: '1',
        name: 'Mehrab',
        score: 1.0,
        friendType: FriendType.Mehrab,
        reasoning: 'Ekta thabbor marmu',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mehrab&backgroundColor=b6e3f4',
        joinedAt: new Date('2024-01-01'),
        email: '[EMAIL_ADDRESS]'
    },
    {
        id: '2',
        name: 'Shafkat',
        friendType: FriendType.Underlings,
        score: 1.32,
        reasoning: 'Always brings snacks to the LAN party. Solid performance.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=c0aede',
        joinedAt: new Date('2024-01-05'),
        email: '[EMAIL_ADDRESS]'
    },
    {
        id: '3',
        name: 'Aaida',
        friendType: FriendType.Plebeians,
        score: 1.72,
        reasoning: 'Decent memes, but sometimes replies with "K".',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam&backgroundColor=ffdfbf',
        joinedAt: new Date('2024-02-10'),
        email: '[EMAIL_ADDRESS]'
    },
    {
        id: '4',
        name: 'Ahnaf',
        friendType: FriendType.Underlings,
        score: 0.4,
        reasoning: 'Still owes me $5 from 2021. Points deducted.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan&backgroundColor=ffd5dc',
        joinedAt: new Date('2024-02-15'),
        email: '[EMAIL_ADDRESS]'
    },
    {
        id: '5',
        name: 'Ishmam',
        friendType: FriendType.Ishmam,
        score: 0.0,
        reasoning: 'Has yellow teeth.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor&backgroundColor=d1d4f9',
        joinedAt: new Date('2024-03-01'),
        email: '[EMAIL_ADDRESS]'
    }
]);

export const applicationsSignal = signal<Application[]>([
    {
        id: 'app-1',
        name: 'Orchit',
        reasoning: 'I have a collection of rare mechanical keyboards.',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Orchit&backgroundColor=b6e3f4',
        merits: [
            { title: 'Keyboard Collection', link: 'https://example.com/keyboards' }
        ],
        submittedAt: new Date(),
        email: 'orchit@example.com'
    }
]);