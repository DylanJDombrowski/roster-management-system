// src/app/features/teams/team-roster/team-roster.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Team } from '../../../core/models/team.model';
import { Player } from '../../../core/models/player.model';
import { AuthService } from '../../../core/services/auth.service';
import { PlayerCardComponent } from '../../../shared/components/player-card/player-card.component';

@Component({
  selector: 'app-team-roster',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PlayerCardComponent],
  template: `
    <div class="team-roster-container" *ngIf="team">
      <div class="header">
        <div>
          <h1>{{ team.display_name }} Roster</h1>
          <div
            class="team-status"
            [class.active]="team.is_active"
            [class.inactive]="!team.is_active"
          >
            {{ team.is_active ? 'Active' : 'Inactive' }}
          </div>
        </div>
        <div class="actions">
          <button class="btn btn-back" (click)="goBack()">Back to Team</button>
          <button
            class="btn btn-add"
            (click)="openAddPlayersModal()"
            *ngIf="authService.isAuthenticated()"
          >
            + Add Players
          </button>
        </div>
      </div>

      <!-- Roster List -->
      <div class="roster-content">
        <div class="players-grid" *ngIf="players.length > 0">
          <app-player-card
            *ngFor="let player of players"
            [player]="player"
          ></app-player-card>
        </div>

        <div class="empty-state" *ngIf="players.length === 0">
          <p>No players assigned to this team yet.</p>
          <button
            class="btn btn-add"
            (click)="openAddPlayersModal()"
            *ngIf="authService.isAuthenticated()"
          >
            + Add Players
          </button>
        </div>
      </div>
    </div>

    <!-- This would be replaced with a proper modal component -->
    <div class="modal" *ngIf="showAddPlayersModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add Players to {{ team?.display_name }}</h2>
          <button class="btn-close" (click)="closeAddPlayersModal()">×</button>
        </div>
        <div class="modal-body">
          <p>
            Player selection functionality will be implemented in the future.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" (click)="closeAddPlayersModal()">
            Cancel
          </button>
          <button class="btn btn-save">Add Selected Players</button>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="!team && !error">
      <p>Loading team roster...</p>
    </div>

    <div class="error-state" *ngIf="error">
      <h2>Error Loading Team Roster</h2>
      <p>{{ error }}</p>
      <button class="btn" routerLink="/teams">Return to Teams</button>
    </div>
  `,
  styles: [
    `
      .team-roster-container {
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
      }

      .btn-back {
        background-color: #f5f5f5;
        color: #333;
      }

      .btn-add {
        background-color: #1976d2;
        color: white;
      }

      .roster-content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
      }

      .players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
        gap: 1rem;
      }

      .empty-state {
        padding: 3rem;
        text-align: center;
        background-color: #f9f9f9;
        border-radius: 4px;
      }

      .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
      }

      .modal-content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 600px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
      }

      .modal-header {
        padding: 1rem 1.5rem;
        border-bottom: 1px solid #e0e0e0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .modal-header h2 {
        margin: 0;
        font-size: 1.25rem;
      }

      .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #666;
      }

      .modal-body {
        padding: 1.5rem;
        overflow-y: auto;
        flex-grow: 1;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      .btn-cancel {
        background-color: #f5f5f5;
        color: #333;
      }

      .btn-save {
        background-color: #1976d2;
        color: white;
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
        .header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .actions {
          width: 100%;
          justify-content: flex-end;
        }

        .players-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TeamRosterComponent implements OnInit {
  team: Team | null = null;
  players: Player[] = [];
  error: string | null = null;
  showAddPlayersModal = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const teamId = this.route.snapshot.paramMap.get('id');
    if (teamId) {
      this.loadTeam(teamId);
      this.loadTeamPlayers(teamId);
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

  loadTeamPlayers(teamId: string): void {
    // For now, we'll use mock data
    // In a real implementation, we would call PlayersService.fetchPlayersByTeam(teamId)
    if (teamId === '1') {
      this.players = [
        {
          id: '1',
          first_name: 'Sarah',
          last_name: 'Johnson',
          jersey_number: 23,
          primary_position: 'Pitcher',
          status: 'active',
        },
        {
          id: '2',
          first_name: 'Jessica',
          last_name: 'Miller',
          jersey_number: 14,
          primary_position: 'Outfield',
          status: 'active',
        },
      ];
    }
  }

  goBack(): void {
    this.router.navigate(['/teams', this.team?.id]);
  }

  openAddPlayersModal(): void {
    this.showAddPlayersModal = true;
  }

  closeAddPlayersModal(): void {
    this.showAddPlayersModal = false;
  }
}
