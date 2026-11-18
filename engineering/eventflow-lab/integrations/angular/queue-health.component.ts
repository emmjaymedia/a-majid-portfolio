import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { catchError, map, of, switchMap, timer } from 'rxjs';

interface EventRecord {
  id: string;
  kind: 'payment' | 'onboarding';
  status: string;
}

interface Dashboard {
  ready: boolean;
  events: EventRecord[];
}

@Component({
  selector: 'lab-queue-health',
  imports: [AsyncPipe],
  template: `
    <section aria-labelledby="queue-health-title">
      <h2 id="queue-health-title">Messaging health</h2>
      @if (dashboard$ | async; as dashboard) {
        <p role="status">{{ dashboard.status }}</p>
        <p>Tracked events {{ dashboard.events.length }}</p>
        <ul>
          @for (event of dashboard.events.slice(0, 5); track event.id) {
            <li>{{ event.kind }} · {{ event.status }} · {{ event.id }}</li>
          }
        </ul>
      }
    </section>
  `
})
export class QueueHealthComponent {
  private readonly http = inject(HttpClient);
  readonly dashboard$ = timer(0, 3000).pipe(
    switchMap(() => this.http.get<Dashboard>('/api/events').pipe(
      map(({ ready, events }) => ({ status: ready ? 'Solace ready' : 'Waiting for broker', events })),
      catchError(() => of({ status: 'API unavailable', events: [] }))
    ))
  );
}
