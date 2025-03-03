// src/app/features/dashboard/dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PlayersService } from '../../core/services/players.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <h1>Dashboard</h1>

      <div class="stats-cards">
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

      h1 {
        margin-bottom: 1.5rem;
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

      .btn {
        display: inline-block;
        background-color: #1976d2;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        text-align: center;
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  playerCount = 0;
  teamCount = 0;

  constructor(
    private playersService: PlayersService,
    public authService: AuthService // We'll need to add TeamsService later
  ) {}

  ngOnInit(): void {
    // Get player count
    this.playersService.fetchPlayers().subscribe((players) => {
      this.playerCount = players.length;
    });

    // Note: We'll need to implement TeamsService and fetch team count
    // For now, we're just showing a placeholder
    this.teamCount = 0;
  }
}
