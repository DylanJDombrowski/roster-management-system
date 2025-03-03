// src/app/features/players/player-list/player-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlayersService } from '../../../core/services/players.service';
import { Player } from '../../../core/models/player.model';
import { PlayerCardComponent } from '../../../shared/components/player-card/player-card.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-player-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PlayerCardComponent],
  template: `
    <div class="player-list-container">
      <div class="header">
        <h1>Players</h1>
        <div class="actions">
          <a
            routerLink="/players/new"
            class="btn btn-add"
            *ngIf="authService.isAuthenticated()"
            >+ Add Player</a
          >
        </div>
      </div>

      <div class="filters">
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

      <div class="players-grid" *ngIf="filteredPlayers.length > 0">
        <app-player-card
          *ngFor="let player of filteredPlayers"
          [player]="player"
        ></app-player-card>
      </div>

      <div class="empty-state" *ngIf="filteredPlayers.length === 0">
        <p *ngIf="players.length === 0">
          No players found. Add your first player to get started.
        </p>
        <p *ngIf="players.length > 0">No players match your filters.</p>
      </div>
    </div>
  `,
  styles: [
    `
      .player-list-container {
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

      .players-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
        gap: 1rem;
      }

      .empty-state {
        padding: 3rem;
        text-align: center;
        background-color: white;
        border-radius: 8px;
        color: #666;
      }

      @media (max-width: 768px) {
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
export class PlayerListComponent implements OnInit {
  players: Player[] = [];
  filteredPlayers: Player[] = [];
  searchTerm = '';
  statusFilter = 'all';

  constructor(
    private playersService: PlayersService,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadPlayers();
  }

  loadPlayers(): void {
    this.playersService.fetchPlayers().subscribe((players) => {
      this.players = players;
      this.applyFilters();
    });
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
}
