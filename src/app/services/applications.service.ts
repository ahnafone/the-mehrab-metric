import { Injectable, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Auth, user } from '@angular/fire/auth';
import {
  Firestore,
  Timestamp,
  collection,
  collectionData,
  deleteDoc,
  doc,
  query,
  setDoc,
} from '@angular/fire/firestore';
import { map, Observable, of, switchMap } from 'rxjs';
import { Application, FriendType, friendTypeToString } from '../models/friend';
import { FriendsService } from './friends.service';

@Injectable({
  providedIn: 'root',
})
export class ApplicationsService {
  private readonly firestore = inject(Firestore);
  private readonly auth = inject(Auth);
  private readonly friendsService = inject(FriendsService);

  private readonly applicationsSignal = toSignal(
    user(this.auth).pipe(
      switchMap(currentUser => {
        if (!currentUser) return of([] as Application[]);
        return (collectionData(query(collection(this.firestore, 'applications')), {
          idField: 'id',
        }) as Observable<any[]>).pipe(
          map(applications =>
            applications.map(
              data =>
                ({
                  ...data,
                  submittedAt: data.submittedAt instanceof Timestamp ? data.submittedAt.toDate() : data.submittedAt,
                }) as Application
            )
          )
        );
      })
    ),
    { initialValue: [] }
  );

  readonly applications = computed(() => this.applicationsSignal());

  async submitApplication(appData: Omit<Application, 'id' | 'submittedAt'>): Promise<void> {
    const appDoc = doc(this.firestore, `applications/${appData.email}`);
    await setDoc(appDoc, {
      ...appData,
      submittedAt: Timestamp.now(),
    });
  }

  async judgeApplication(appId: string, points: number, reasoning: string, answers: unknown): Promise<void> {
    await this.friendsService.snapshotRanks();

    const application = this.applicationsSignal().find(candidate => candidate.id === appId);
    if (!application) return;

    await setDoc(doc(this.firestore, `friends/${application.email}`), {
      name: application.name,
      email: application.email,
      points,
      reasoning,
      friendType: friendTypeToString(FriendType.Plebeians),
      avatarUrl: application.avatarUrl,
      merits: application.merits,
      answers,
      joinedAt: Timestamp.now(),
    });

    await deleteDoc(doc(this.firestore, `applications/${appId}`));
  }
}
