// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayersService } from '../../core/services/players.service';
import { TeamsService } from '../../core/services/teams.service';
import { AuthService } from '../../core/services/auth.service';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <div class="dashboard-header">
        <h1>Dashboard</h1>
        <p *ngIf="authService.currentUser$ | async as user">
          Welcome, {{ user.first_name }} {{ user.last_name }}
        </p>
      </div>

      <div class="error-message" *ngIf="errorMessage">
        <p>{{ errorMessage }}</p>
        <button (click)="loadData()" class="btn">Retry</button>
      </div>

      <div class="loading-indicator" *ngIf="isLoading">
        <p>Loading dashboard data...</p>
      </div>

      <div class="stats-cards" *ngIf="!isLoading">
        <div class="card">
          <h2>Players</h2>
          <p class="stat">{{ playerCount }}</p>
          <a routerLink="/players" class="btn">Manage Players</a>
        </div>

        <div class="card">
          <h2>Teams</h2>
          <p class="stat">{{ teamCount }}</p>
          <a routerLink="/teams" class="btn">Manage Teams</a>
        </div>
      </div>

      <!-- Admin-only section -->
      <div *ngIf="authService.isAdmin()" class="admin-section">
        <h2>Admin Actions</h2>
        <div class="card">
          <h3>User Management</h3>
          <p>Invite and manage coaches</p>
          <a routerLink="/admin/users" class="btn">Manage Users</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .dashboard-header {
        margin-bottom: 2rem;
      }

      .dashboard-header h1 {
        margin-bottom: 0.5rem;
      }

      .dashboard-header p {
        color: #666;
        font-size: 1.1rem;
      }

      .error-message {
        padding: 1rem;
        background-color: #ffebee;
        border-radius: 4px;
        color: #c62828;
        margin-bottom: 1.5rem;
      }

      .loading-indicator {
        text-align: center;
        padding: 2rem;
      }

      .stats-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 2rem;
      }

      .card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
      }

      .stat {
        font-size: 2.5rem;
        font-weight: bold;
        color: #1976d2;
        margin: 1rem 0;
      }

      .admin-section {
        margin-top: 2rem;
      }

      .admin-section h2 {
        margin-bottom: 1rem;
      }

      .btn {
        display: inline-block;
        background-color: #1976d2;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        text-align: center;
        border: none;
        cursor: pointer;
        font-size: 0.875rem;
      }

      @media (max-width: 768px) {
        .stats-cards {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  playerCount = 0;
  teamCount = 0;
  isLoading = false;
  errorMessage = '';
  private subscription = new Subscription();

  constructor(
    private playersService: PlayersService,
    private teamsService: TeamsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    // Load both player and team data in parallel
    const sub = forkJoin({
      players: this.playersService.fetchPlayers().pipe(
        catchError((err) => {
          console.error('Error loading players', err);
          return of([]);
        })
      ),
      teams: this.teamsService.fetchTeams().pipe(
        catchError((err) => {
          console.error('Error loading teams', err);
          return of([]);
        })
      ),
    }).subscribe({
      next: ({ players, teams }) => {
        this.playerCount = players.length;
        this.teamCount = teams.length;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data', err);
        this.errorMessage = 'Failed to load dashboard data. Please try again.';
        this.isLoading = false;
      },
    });

    this.subscription.add(sub);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
