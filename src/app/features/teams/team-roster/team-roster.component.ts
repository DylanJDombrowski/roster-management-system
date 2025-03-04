// src/app/features/teams/team-roster/team-roster.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Team } from '../../../core/models/team.model';
import { Player } from '../../../core/models/player.model';
import { AuthService } from '../../../core/services/auth.service';
import { TeamsService } from '../../../core/services/teams.service';
import { PlayersService } from '../../../core/services/players.service';
import { PlayerCardComponent } from '../../../shared/components/player-card/player-card.component';
import { Subscription, forkJoin, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-team-roster',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
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

      <div class="error-message" *ngIf="errorMessage">
        <p>{{ errorMessage }}</p>
      </div>

      <!-- Roster List -->
      <div class="roster-content">
        <div class="filters" *ngIf="players.length > 0">
          <div class="search">
            <input
              type="text"
              [(ngModel)]="searchTerm"
              (ngModelChange)="applyFilters()"
              placeholder="Search players..."
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
              <option value="injured">Injured</option>
            </select>
          </div>
        </div>

        <div class="loading-indicator" *ngIf="isLoading">
          <p>Loading roster...</p>
        </div>

        <div
          class="players-grid"
          *ngIf="!isLoading && filteredPlayers.length > 0"
        >
          <div class="player-card" *ngFor="let player of filteredPlayers">
            <div class="player-card-header">
              <h3>{{ player.first_name }} {{ player.last_name }}</h3>
              <span class="status-badge" [class]="player.status">
                {{ player.status }}
              </span>
            </div>
            <div class="player-card-body">
              <div class="player-info">
                <div class="info-item" *ngIf="player.jersey_number">
                  <span class="label">Jersey</span>
                  <span class="value">#{{ player.jersey_number }}</span>
                </div>
                <div class="info-item" *ngIf="player.primary_position">
                  <span class="label">Position</span>
                  <span class="value">{{ player.primary_position }}</span>
                </div>
              </div>
            </div>
            <div class="player-card-actions">
              <a [routerLink]="['/players', player.id]" class="btn btn-view"
                >View</a
              >
              <button
                class="btn btn-remove"
                (click)="confirmRemovePlayer(player)"
                *ngIf="authService.isAuthenticated()"
              >
                Remove
              </button>
            </div>
          </div>
        </div>

        <div
          class="empty-state"
          *ngIf="
            !isLoading && filteredPlayers.length === 0 && players.length > 0
          "
        >
          <p>No players match your filter criteria.</p>
        </div>

        <div class="empty-state" *ngIf="!isLoading && players.length === 0">
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

    <!-- Add Players Modal -->
    <div class="modal" *ngIf="showAddPlayersModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Add Players to {{ team?.display_name }}</h2>
          <button class="btn-close" (click)="closeAddPlayersModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="modal-search">
            <input
              type="text"
              [(ngModel)]="modalSearchTerm"
              placeholder="Search players..."
              class="search-input"
            />
          </div>

          <div class="loading-indicator" *ngIf="isLoadingAvailablePlayers">
            <p>Loading available players...</p>
          </div>

          <div
            class="available-players-list"
            *ngIf="!isLoadingAvailablePlayers"
          >
            <div *ngIf="availablePlayers.length === 0">
              <p>No available players found.</p>
            </div>

            <div
              class="player-select-item"
              *ngFor="let player of availablePlayers"
            >
              <label class="checkbox-container">
                <input
                  type="checkbox"
                  [checked]="isPlayerSelected(player.id)"
                  (change)="togglePlayerSelection(player.id)"
                />
                <span class="checkmark"></span>
              </label>
              <div class="player-details">
                <span class="player-name"
                  >{{ player.first_name }} {{ player.last_name }}</span
                >
                <span class="player-info" *ngIf="player.jersey_number"
                  >#{{ player.jersey_number }}</span
                >
                <span class="player-info" *ngIf="player.primary_position">{{
                  player.primary_position
                }}</span>
              </div>
              <span class="status-badge small" [class]="player.status">
                {{ player.status }}
              </span>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" (click)="closeAddPlayersModal()">
            Cancel
          </button>
          <button
            class="btn btn-save"
            [disabled]="selectedPlayerIds.length === 0 || isAddingPlayers"
            (click)="addSelectedPlayers()"
          >
            {{ isAddingPlayers ? 'Adding...' : 'Add Selected Players' }}
          </button>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="!team && !errorMessage && isLoading">
      <p>Loading team roster...</p>
    </div>

    <div class="error-state" *ngIf="!team && errorMessage">
      <h2>Error Loading Team Roster</h2>
      <p>{{ errorMessage }}</p>
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
        text-decoration: none;
        display: inline-block;
      }

      .btn-back {
        background-color: #f5f5f5;
        color: #333;
      }

      .btn-add {
        background-color: #1976d2;
        color: white;
      }

      .error-message {
        padding: 1rem;
        background-color: #ffebee;
        border-radius: 4px;
        color: #c62828;
        margin-bottom: 1.5rem;
      }

      .roster-content {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
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

      .loading-indicator {
        text-align: center;
        padding: 2rem;
      }

      .players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
      }

      .player-card {
        background-color: #f9f9f9;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      }

      .player-card-header {
        padding: 1rem;
        background-color: #f5f5f5;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .player-card-header h3 {
        margin: 0;
        font-size: 1.125rem;
      }

      .player-card-body {
        padding: 1rem;
      }

      .player-info {
        display: flex;
        gap: 1.5rem;
      }

      .info-item {
        display: flex;
        flex-direction: column;
      }

      .info-item .label {
        font-size: 0.75rem;
        color: #666;
      }

      .info-item .value {
        font-weight: 500;
      }

      .player-card-actions {
        padding: 1rem;
        border-top: 1px solid #eeeeee;
        display: flex;
        gap: 0.5rem;
      }

      .btn-view {
        flex: 1;
        background-color: #e3f2fd;
        color: #1976d2;
        text-align: center;
      }

      .btn-remove {
        flex: 1;
        background-color: #ffebee;
        color: #c62828;
        text-align: center;
      }

      .status-badge {
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        white-space: nowrap;
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

      .status-badge.small {
        font-size: 0.7rem;
        padding: 0.2rem 0.4rem;
      }

      .empty-state {
        padding: 3rem;
        text-align: center;
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

      .modal-search {
        margin-bottom: 1rem;
      }

      .available-players-list {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        max-height: 400px;
        overflow-y: auto;
      }

      .player-select-item {
        display: flex;
        align-items: center;
        padding: 0.75rem;
        background-color: #f5f5f5;
        border-radius: 4px;
        gap: 1rem;
      }

      .checkbox-container {
        display: block;
        position: relative;
        padding-left: 25px;
        cursor: pointer;
        user-select: none;
      }

      .checkbox-container input {
        position: absolute;
        opacity: 0;
        cursor: pointer;
        height: 0;
        width: 0;
      }

      .checkmark {
        position: absolute;
        top: 0;
        left: 0;
        height: 18px;
        width: 18px;
        background-color: #fff;
        border: 1px solid #ccc;
        border-radius: 3px;
      }

      .checkbox-container:hover input ~ .checkmark {
        background-color: #f5f5f5;
      }

      .checkbox-container input:checked ~ .checkmark {
        background-color: #1976d2;
        border-color: #1976d2;
      }

      .checkmark:after {
        content: '';
        position: absolute;
        display: none;
      }

      .checkbox-container input:checked ~ .checkmark:after {
        display: block;
      }

      .checkbox-container .checkmark:after {
        left: 6px;
        top: 2px;
        width: 4px;
        height: 8px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }

      .player-details {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      .player-name {
        font-weight: 500;
      }

      .player-info {
        font-size: 0.75rem;
        color: #666;
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

      .btn-save:disabled {
        background-color: #bbdefb;
        cursor: not-allowed;
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

        .filters {
          flex-direction: column;
        }

        .players-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TeamRosterComponent implements OnInit, OnDestroy {
  team: Team | null = null;
  players: Player[] = [];
  filteredPlayers: Player[] = [];
  availablePlayers: Player[] = [];
  selectedPlayerIds: string[] = [];
  errorMessage = '';
  isLoading = false;
  isLoadingAvailablePlayers = false;
  isAddingPlayers = false;
  showAddPlayersModal = false;
  searchTerm = '';
  modalSearchTerm = '';
  statusFilter = 'all';
  private teamId: string | null = null;
  private subscription = new Subscription();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private teamsService: TeamsService,
    private playersService: PlayersService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.teamId = this.route.snapshot.paramMap.get('id');
    if (this.teamId) {
      this.loadTeam(this.teamId);
    } else {
      this.errorMessage = 'No team ID provided';
    }
  }

  loadTeam(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    const sub = this.teamsService
      .getTeam(id)
      .pipe(
        catchError((err) => {
          console.error('Error loading team', err);
          this.errorMessage =
            'Failed to load team information. Please try again.';
          this.isLoading = false;
          return of(null);
        }),
        switchMap((team) => {
          if (!team) return of(null);

          this.team = team;
          return this.loadTeamPlayers(id);
        })
      )
      .subscribe((players) => {
        this.isLoading = false;
        if (players) {
          this.players = players.map((tp) => tp.players);
          this.applyFilters();
        }
      });

    this.subscription.add(sub);
  }

  loadTeamPlayers(teamId: string) {
    return this.teamsService.getTeamPlayers(teamId).pipe(
      catchError((err) => {
        console.error('Error loading team players', err);
        this.errorMessage = 'Failed to load team players. Please try again.';
        return of([]);
      })
    );
  }

  applyFilters(): void {
    let result = this.players;

    // Apply status filter
    if (this.statusFilter !== 'all') {
      result = result.filter((p) => p.status === this.statusFilter);
    }

    // Apply search filter
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.first_name.toLowerCase().includes(term) ||
          p.last_name.toLowerCase().includes(term)
      );
    }

    this.filteredPlayers = result;
  }

  goBack(): void {
    if (this.team) {
      this.router.navigate(['/teams', this.team.id]);
    } else {
      this.router.navigate(['/teams']);
    }
  }

  openAddPlayersModal(): void {
    this.showAddPlayersModal = true;
    this.loadAvailablePlayers();
  }

  closeAddPlayersModal(): void {
    this.showAddPlayersModal = false;
    this.selectedPlayerIds = [];
    this.availablePlayers = [];
    this.modalSearchTerm = '';
  }

  loadAvailablePlayers(): void {
    if (!this.teamId) return;

    this.isLoadingAvailablePlayers = true;

    // First, get all players
    const sub = this.playersService
      .fetchPlayers()
      .pipe(
        catchError((err) => {
          console.error('Error loading available players', err);
          this.isLoadingAvailablePlayers = false;
          return of([]);
        }),
        switchMap((allPlayers) => {
          // Then get current team players to filter them out
          return this.teamsService.getTeamPlayers(this.teamId!).pipe(
            catchError(() => of([])),
            map((teamPlayers) => {
              const teamPlayerIds = teamPlayers.map((tp) => tp.player_id);

              // Filter out players already on the team
              const availablePlayers = allPlayers.filter(
                (player) => !teamPlayerIds.includes(player.id)
              );

              // Filter by search term if provided
              if (this.modalSearchTerm) {
                const term = this.modalSearchTerm.toLowerCase();
                return availablePlayers.filter(
                  (p) =>
                    p.first_name.toLowerCase().includes(term) ||
                    p.last_name.toLowerCase().includes(term)
                );
              }

              return availablePlayers;
            })
          );
        })
      )
      .subscribe((players) => {
        this.availablePlayers = players;
        this.isLoadingAvailablePlayers = false;
      });

    this.subscription.add(sub);
  }

  isPlayerSelected(playerId: string): boolean {
    return this.selectedPlayerIds.includes(playerId);
  }

  togglePlayerSelection(playerId: string): void {
    const index = this.selectedPlayerIds.indexOf(playerId);
    if (index === -1) {
      this.selectedPlayerIds.push(playerId);
    } else {
      this.selectedPlayerIds.splice(index, 1);
    }
  }

  addSelectedPlayers(): void {
    if (!this.teamId || this.selectedPlayerIds.length === 0) return;

    this.isAddingPlayers = true;

    // Create an array of observables for adding each player
    const addPlayerObservables = this.selectedPlayerIds.map((playerId) =>
      this.teamsService.addPlayerToTeam(this.teamId!, playerId)
    );

    // Execute all add operations in parallel
    const sub = forkJoin(addPlayerObservables).subscribe({
      next: () => {
        // Reload the team players
        if (this.teamId) {
          this.loadTeamPlayers(this.teamId).subscribe((players) => {
            this.players = players.map((tp) => tp.players);
            this.applyFilters();
            this.isAddingPlayers = false;
            this.closeAddPlayersModal();
          });
        }
      },
      error: (err) => {
        console.error('Error adding players to team', err);
        this.errorMessage = 'Failed to add players to team. Please try again.';
        this.isAddingPlayers = false;
      },
    });

    this.subscription.add(sub);
  }

  confirmRemovePlayer(player: Player): void {
    if (!this.teamId) return;

    if (
      confirm(
        `Are you sure you want to remove ${player.first_name} ${player.last_name} from this team?`
      )
    ) {
      const sub = this.teamsService
        .removePlayerFromTeam(this.teamId, player.id)
        .subscribe({
          next: () => {
            // Remove player from local arrays
            this.players = this.players.filter((p) => p.id !== player.id);
            this.applyFilters();
          },
          error: (err) => {
            console.error('Error removing player from team', err);
            this.errorMessage =
              'Failed to remove player from team. Please try again.';
          },
        });

      this.subscription.add(sub);
    }
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }
}
