// src/app/features/teams/team-detail/team-detail.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Team, TeamCoach } from '../../../core/models/team.model';
import { Player } from '../../../core/models/player.model';
import { AuthService } from '../../../core/services/auth.service';
import { TeamsService } from '../../../core/services/teams.service';
import { PlayersService } from '../../../core/services/players.service';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-team-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="team-detail-container" *ngIf="team">
      <div class="header">
        <div>
          <h1>{{ team.display_name }}</h1>
          <div
            class="team-status"
            [class.active]="team.is_active"
            [class.inactive]="!team.is_active"
          >
            {{ team.is_active ? 'Active' : 'Inactive' }}
          </div>
        </div>
        <div class="actions" *ngIf="authService.isAdmin()">
          <button
            class="btn btn-edit"
            [routerLink]="['/teams', team.id, 'edit']"
          >
            Edit Team
          </button>
          <button class="btn btn-delete" (click)="confirmDelete()">
            Delete
          </button>
        </div>
      </div>

      <div class="team-content">
        <div class="team-info-card">
          <div class="info-section">
            <div class="team-meta">
              <div class="meta-item" *ngIf="team.age_group">
                <span class="label">Age Group</span>
                <span class="value">{{ team.age_group }}</span>
              </div>
              <div class="meta-item" *ngIf="team.season_year">
                <span class="label">Season</span>
                <span class="value">{{ team.season_year }}</span>
              </div>
            </div>

            <div class="description" *ngIf="team.description">
              <h2>About</h2>
              <p>{{ team.description }}</p>
            </div>

            <div class="coaches-section" *ngIf="coaches.length > 0">
              <h2>Coaching Staff</h2>
              <div class="coaches-list">
                <div class="coach-item" *ngFor="let coach of coaches">
                  <div class="coach-name">
                    {{ coach.profile?.first_name }}
                    {{ coach.profile?.last_name }}
                    <span class="coach-badge" *ngIf="coach.is_head_coach"
                      >Head Coach</span
                    >
                  </div>
                  <div class="coach-email" *ngIf="coach.profile?.email">
                    {{ coach.profile?.email }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="roster-card">
          <div class="roster-header">
            <h2>Team Roster</h2>
            <a
              [routerLink]="['/teams', team.id, 'roster']"
              class="btn btn-roster"
              >Manage Roster</a
            >
          </div>

          <div class="roster-preview" *ngIf="isLoadingPlayers">
            <p>Loading roster...</p>
          </div>

          <div
            class="roster-preview"
            *ngIf="!isLoadingPlayers && players.length > 0"
          >
            <div class="roster-stats">
              <div class="stat-item">
                <span class="stat-value">{{ players.length }}</span>
                <span class="stat-label">Players</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ getActivePlayerCount() }}</span>
                <span class="stat-label">Active</span>
              </div>
            </div>

            <table class="roster-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>#</th>
                  <th>Position</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  *ngFor="let player of players.slice(0, 5)"
                  [routerLink]="['/players', player.id]"
                  class="clickable-row"
                >
                  <td>{{ player.first_name }} {{ player.last_name }}</td>
                  <td>{{ player.jersey_number || '-' }}</td>
                  <td>{{ player.primary_position || '-' }}</td>
                  <td>
                    <span class="status-badge" [class]="player.status">
                      {{ player.status }}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="more-players" *ngIf="players.length > 5">
              <a [routerLink]="['/teams', team.id, 'roster']">
                View all {{ players.length }} players
              </a>
            </div>
          </div>

          <div
            class="roster-preview empty-roster"
            *ngIf="!isLoadingPlayers && players.length === 0"
          >
            <p class="empty-message">No players assigned to this team yet.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="isLoading && !error">
      <p>Loading team information...</p>
    </div>

    <div class="error-state" *ngIf="error">
      <h2>Error Loading Team</h2>
      <p>{{ error }}</p>
      <button class="btn" routerLink="/teams">Return to Teams</button>
    </div>
  `,
  styles: [
    `
      .team-detail-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      h1 {
        margin: 0 0 0.5rem 0;
      }

      .team-status {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .team-status.active {
        background-color: #c8e6c9;
        color: #2e7d32;
      }

      .team-status.inactive {
        background-color: #ffcdd2;
        color: #c62828;
      }

      .actions {
        display: flex;
        gap: 0.75rem;
      }

      .btn {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        font-size: 0.875rem;
        text-decoration: none;
        display: inline-block;
      }

      .btn-edit {
        background-color: #1976d2;
        color: white;
      }

      .btn-delete {
        background-color: #f5f5f5;
        color: #d32f2f;
      }

      .btn-roster {
        background-color: #e8f5e9;
        color: #388e3c;
      }

      .team-content {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
      }

      .team-info-card,
      .roster-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
      }

      .info-section {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .team-meta {
        display: flex;
        gap: 2rem;
      }

      .meta-item {
        display: flex;
        flex-direction: column;
      }

      .meta-item .label {
        font-size: 0.875rem;
        color: #666;
      }

      .meta-item .value {
        font-size: 1.25rem;
        font-weight: 500;
      }

      h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #1976d2;
      }

      .description p {
        margin: 0;
        line-height: 1.5;
        color: #444;
      }

      .coaches-section {
        margin-top: 1.5rem;
      }

      .coaches-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .coach-item {
        padding: 0.75rem;
        background-color: #f5f5f5;
        border-radius: 4px;
      }

      .coach-name {
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .coach-badge {
        font-size: 0.75rem;
        padding: 0.2rem 0.5rem;
        background-color: #bbdefb;
        color: #1976d2;
        border-radius: 4px;
      }

      .coach-email {
        font-size: 0.875rem;
        color: #666;
        margin-top: 0.25rem;
      }

      .roster-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .roster-preview {
        padding: 1rem;
        background-color: #f9f9f9;
        border-radius: 4px;
      }

      .empty-message {
        color: #666;
        font-style: italic;
        margin: 0;
        text-align: center;
        padding: 2rem 0;
      }

      .roster-stats {
        display: flex;
        gap: 2rem;
        margin-bottom: 1rem;
      }

      .stat-item {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #1976d2;
      }

      .stat-label {
        font-size: 0.875rem;
        color: #666;
      }

      .roster-table {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
      }

      .roster-table th,
      .roster-table td {
        padding: 0.75rem;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      .roster-table th {
        font-weight: 500;
        color: #666;
      }

      .clickable-row {
        cursor: pointer;
      }

      .clickable-row:hover {
        background-color: #f5f5f5;
      }

      .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
      }

      .status-badge.active {
        background-color: #c8e6c9;
        color: #2e7d32;
      }

      .status-badge.inactive {
        background-color: #ffcdd2;
        color: #c62828;
      }

      .status-badge.injured {
        background-color: #fff9c4;
        color: #f57f17;
      }

      .more-players {
        text-align: center;
        margin-top: 1rem;
      }

      .more-players a {
        color: #1976d2;
        text-decoration: none;
      }

      .loading-state,
      .error-state {
        text-align: center;
        padding: 3rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        margin: 2rem auto;
        max-width: 800px;
      }

      .error-state {
        color: #d32f2f;
      }

      @media (max-width: 768px) {
        .team-content {
          grid-template-columns: 1fr;
        }

        .team-meta {
          flex-direction: column;
          gap: 1rem;
        }
      }
    `,
  ],
})
export class TeamDetailComponent implements OnInit, OnDestroy {
  team: Team | null = null;
  coaches: TeamCoach[] = [];
  players: Player[] = [];
  error: string | null = null;
  isLoading = false;
  isLoadingPlayers = false;
  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamsService: TeamsService,
    private playersService: PlayersService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const teamId = this.route.snapshot.paramMap.get('id');
    if (teamId) {
      this.loadTeam(teamId);
    } else {
      this.error = 'No team ID provided';
    }
  }

  loadTeam(id: string): void {
    this.isLoading = true;
    this.error = null;

    const sub = this.teamsService
      .getTeam(id)
      .pipe(
        catchError((err) => {
          console.error('Error loading team', err);
          this.error = 'Failed to load team information. Please try again.';
          this.isLoading = false;
          return of(null);
        })
      )
      .subscribe((team) => {
        if (team) {
          this.team = team;
          this.isLoading = false;

          // Now load coaches and players
          this.loadCoaches(id);
          this.loadPlayers(id);
        }
      });

    this.subscription.add(sub);
  }

  loadCoaches(teamId: string): void {
    const sub = this.teamsService
      .getTeamCoaches(teamId)
      .pipe(
        catchError((err) => {
          console.error('Error loading coaches', err);
          return of([]);
        })
      )
      .subscribe((coaches) => {
        this.coaches = coaches;
      });

    this.subscription.add(sub);
  }

  loadPlayers(teamId: string): void {
    this.isLoadingPlayers = true;

    const sub = this.teamsService
      .getTeamPlayers(teamId)
      .pipe(
        catchError((err) => {
          console.error('Error loading team players', err);
          return of([]);
        })
      )
      .subscribe((teamPlayers) => {
        // Extract player data from the response
        this.players = teamPlayers.map((tp) => tp.players);
        this.isLoadingPlayers = false;
      });

    this.subscription.add(sub);
  }

  getActivePlayerCount(): number {
    return this.players.filter((p) => p.status === 'active').length;
  }

  confirmDelete(): void {
    if (!this.team) return;

    if (
      confirm(
        `Are you sure you want to delete the team "${this.team.display_name}"?`
      )
    ) {
      this.isLoading = true;

      const sub = this.teamsService.deleteTeam(this.team.id).subscribe({
        next: () => {
          this.router.navigate(['/teams']);
        },
        error: (err) => {
          console.error('Error deleting team', err);
          this.error = 'Failed to delete team. Please try again.';
          this.isLoading = false;
        },
      });

      this.subscription.add(sub);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
