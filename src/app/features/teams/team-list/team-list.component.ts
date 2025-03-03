// src/app/features/teams/team-list/team-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Team } from '../../../core/models/team.model';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="team-list-container">
      <div class="header">
        <h1>Teams</h1>
        <div class="actions" *ngIf="authService.isAdmin()">
          <a routerLink="/teams/new" class="btn btn-add">+ Add Team</a>
        </div>
      </div>

      <div class="teams-grid" *ngIf="teams.length > 0">
        <div class="team-card" *ngFor="let team of teams">
          <div class="team-info">
            <h2>{{ team.display_name }}</h2>
            <p class="team-description" *ngIf="team.description">
              {{ team.description }}
            </p>
            <div class="team-meta">
              <span
                class="team-status"
                [class.active]="team.is_active"
                [class.inactive]="!team.is_active"
              >
                {{ team.is_active ? 'Active' : 'Inactive' }}
              </span>
              <span class="team-age" *ngIf="team.age_group">{{
                team.age_group
              }}</span>
              <span class="team-season" *ngIf="team.season_year">{{
                team.season_year
              }}</span>
            </div>
          </div>
          <div class="team-actions">
            <a [routerLink]="['/teams', team.id]" class="btn btn-view">View</a>
            <a
              [routerLink]="['/teams', team.id, 'roster']"
              class="btn btn-roster"
              >Roster</a
            >
            <a
              [routerLink]="['/teams', team.id, 'edit']"
              class="btn btn-edit"
              *ngIf="authService.isAdmin()"
              >Edit</a
            >
          </div>
        </div>
      </div>

      <div class="empty-state" *ngIf="teams.length === 0">
        <p>
          No teams found.
          {{
            authService.isAdmin()
              ? 'Add your first team to get started.'
              : 'Please check back later.'
          }}
        </p>
        <a
          routerLink="/teams/new"
          class="btn btn-add"
          *ngIf="authService.isAdmin()"
          >+ Add Team</a
        >
      </div>
    </div>
  `,
  styles: [
    `
      .team-list-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .btn-add {
        background-color: #1976d2;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
      }

      .teams-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
        gap: 1.5rem;
      }

      .team-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
      }

      .team-info {
        margin-bottom: 1.5rem;
      }

      .team-info h2 {
        margin: 0 0 0.5rem 0;
        color: #1976d2;
      }

      .team-description {
        margin: 0 0 1rem 0;
        color: #666;
      }

      .team-meta {
        display: flex;
        gap: 1rem;
        flex-wrap: wrap;
      }

      .team-status,
      .team-age,
      .team-season {
        font-size: 0.875rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        background-color: #f5f5f5;
      }

      .team-status.active {
        background-color: #c8e6c9;
        color: #2e7d32;
      }

      .team-status.inactive {
        background-color: #ffcdd2;
        color: #c62828;
      }

      .team-actions {
        display: flex;
        gap: 0.5rem;
      }

      .btn {
        flex: 1;
        padding: 0.5rem;
        border-radius: 4px;
        text-align: center;
        text-decoration: none;
        font-weight: 500;
        font-size: 0.875rem;
      }

      .btn-view {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      .btn-roster {
        background-color: #e8f5e9;
        color: #388e3c;
      }

      .btn-edit {
        background-color: #1976d2;
        color: white;
      }

      .empty-state {
        text-align: center;
        padding: 3rem;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      @media (max-width: 768px) {
        .teams-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TeamListComponent implements OnInit {
  teams: Team[] = [];

  constructor(public authService: AuthService) {}

  ngOnInit(): void {
    // For now, we'll use mock data until we implement the TeamsService
    this.teams = [
      {
        id: '1',
        name: '16U',
        display_name: 'Lightning 16U',
        description: 'Our 16 and under competitive team',
        is_active: true,
        season_year: 2025,
        age_group: '16U',
      },
      {
        id: '2',
        name: '18U',
        display_name: 'Lightning 18U',
        description: 'Our 18 and under competitive team',
        is_active: true,
        season_year: 2025,
        age_group: '18U',
      },
    ];
  }
}
