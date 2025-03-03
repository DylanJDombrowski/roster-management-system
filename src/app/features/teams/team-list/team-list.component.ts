// src/app/features/teams/team-list/team-list.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TeamsService } from '../../../core/services/teams.service';
import { Team } from '../../../core/models/team.model';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="team-list-container">
      <div class="header">
        <h1>Teams</h1>
        <div class="actions" *ngIf="authService.isAdmin()">
          <a routerLink="/teams/new" class="btn btn-add">+ Add Team</a>
        </div>
      </div>

      <div class="filters">
        <div class="search">
          <input
            type="text"
            [(ngModel)]="searchTerm"
            (ngModelChange)="applyFilters()"
            placeholder="Search teams..."
            class="search-input"
          />
        </div>

        <div class="status-filter">
          <label for="status">Status:</label>
          <select
            id="status"
            [(ngModel)]="statusFilter"
            (ngModelChange)="applyFilters()"
          >
            <option value="all">All</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div class="loading-indicator" *ngIf="isLoading">
        <p>Loading teams...</p>
      </div>

      <div class="error-message" *ngIf="errorMessage">
        <p>{{ errorMessage }}</p>
        <button (click)="loadTeams()" class="btn">Retry</button>
      </div>

      <div
        class="teams-grid"
        *ngIf="!isLoading && !errorMessage && filteredTeams.length > 0"
      >
        <div class="team-card" *ngFor="let team of filteredTeams">
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

      <div
        class="empty-state"
        *ngIf="!isLoading && !errorMessage && filteredTeams.length === 0"
      >
        <p>
          {{
            teams.length === 0
              ? authService.isAdmin()
                ? 'No teams found. Add your first team to get started.'
                : 'No teams found. Please check back later.'
              : 'No teams match your search criteria.'
          }}
        </p>
        <a
          routerLink="/teams/new"
          class="btn btn-add"
          *ngIf="authService.isAdmin() && teams.length === 0"
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

      .filters {
        display: flex;
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .search {
        flex: 1;
      }

      .search-input {
        width: 100%;
        padding: 0.625rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      .status-filter {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .status-filter select {
        padding: 0.625rem;
        border: 1px solid #ccc;
        border-radius: 4px;
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

      .loading-indicator {
        padding: 2rem;
        text-align: center;
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .error-message {
        padding: 2rem;
        text-align: center;
        background-color: #ffebee;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        color: #c62828;
        margin-bottom: 1.5rem;
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

        .filters {
          flex-direction: column;
        }
      }
    `,
  ],
})
export class TeamListComponent implements OnInit, OnDestroy {
  teams: Team[] = [];
  filteredTeams: Team[] = [];
  searchTerm = '';
  statusFilter = 'all';
  isLoading = false;
  errorMessage = '';
  private subscription = new Subscription();

  constructor(
    private teamsService: TeamsService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadTeams();
  }

  loadTeams(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const sub = this.teamsService.fetchTeams().subscribe({
      next: (teams) => {
        this.teams = teams;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading teams', err);
        this.errorMessage = 'Failed to load teams. Please try again.';
        this.isLoading = false;
      },
    });

    this.subscription.add(sub);
  }

  applyFilters(): void {
    let result = this.teams;

    // Apply status filter
    if (this.statusFilter === 'active') {
      result = result.filter((t) => t.is_active);
    } else if (this.statusFilter === 'inactive') {
      result = result.filter((t) => !t.is_active);
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(term) ||
          t.display_name.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term))
      );
    }

    this.filteredTeams = result;
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
