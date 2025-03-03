// src/app/features/teams/team-detail/team-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Team } from '../../../core/models/team.model';
import { AuthService } from '../../../core/services/auth.service';

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

          <!-- This will be replaced with actual roster data -->
          <div class="roster-preview">
            <p class="empty-message">No players assigned to this team yet.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="!team && !error">
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

      .roster-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .roster-preview {
        padding: 2rem;
        background-color: #f9f9f9;
        border-radius: 4px;
        text-align: center;
      }

      .empty-message {
        color: #666;
        font-style: italic;
        margin: 0;
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
export class TeamDetailComponent implements OnInit {
  team: Team | null = null;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
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
    // For now, we'll use mock data until we implement the TeamsService
    if (id === '1') {
      this.team = {
        id: '1',
        name: '16U',
        display_name: 'Lightning 16U',
        description: 'Our 16 and under competitive team',
        is_active: true,
        season_year: 2025,
        age_group: '16U',
      };
    } else if (id === '2') {
      this.team = {
        id: '2',
        name: '18U',
        display_name: 'Lightning 18U',
        description: 'Our 18 and under competitive team',
        is_active: true,
        season_year: 2025,
        age_group: '18U',
      };
    } else {
      this.error = 'Team not found';
    }
  }

  confirmDelete(): void {
    if (confirm('Are you sure you want to delete this team?')) {
      // In a real implementation, we would call a delete method on the service
      // For now, just navigate back to the team list
      alert('Delete functionality will be implemented in the future.');
    }
  }
}
