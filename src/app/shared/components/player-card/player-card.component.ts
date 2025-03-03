// src/app/shared/components/player-card/player-card.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Player } from '../../../core/models/player.model';

@Component({
  selector: 'app-player-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="player-card">
      <div class="player-photo" [class.no-photo]="!photoUrl">
        <img
          *ngIf="photoUrl"
          [src]="photoUrl"
          alt="{{ player.first_name }} {{ player.last_name }}"
        />
        <div *ngIf="!photoUrl" class="initials">{{ getInitials() }}</div>
      </div>
      <div class="player-info">
        <h3>{{ player.first_name }} {{ player.last_name }}</h3>
        <div class="player-details">
          <div *ngIf="player.jersey_number" class="detail">
            <span class="label">Jersey:</span> #{{ player.jersey_number }}
          </div>
          <div *ngIf="player.primary_position" class="detail">
            <span class="label">Position:</span> {{ player.primary_position }}
          </div>
          <div class="detail">
            <span class="label">Status:</span>
            <span class="status" [class]="player.status">{{
              player.status
            }}</span>
          </div>
        </div>
      </div>
      <div class="player-actions">
        <a [routerLink]="['/players', player.id]" class="btn btn-view">View</a>
        <a [routerLink]="['/players', player.id, 'edit']" class="btn btn-edit"
          >Edit</a
        >
      </div>
    </div>
  `,
  styles: [
    `
      .player-card {
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        display: flex;
        overflow: hidden;
        height: 120px;
      }

      .player-photo {
        width: 120px;
        height: 120px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: #f0f0f0;
      }

      .player-photo img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .initials {
        font-size: 2rem;
        font-weight: bold;
        color: #666;
      }

      .player-info {
        flex: 1;
        padding: 1rem;
        display: flex;
        flex-direction: column;
      }

      h3 {
        margin: 0 0 0.5rem 0;
        font-size: 1.25rem;
      }

      .player-details {
        display: flex;
        flex-wrap: wrap;
        gap: 0.75rem;
        font-size: 0.9rem;
      }

      .label {
        font-weight: 500;
        color: #666;
      }

      .status {
        padding: 0.125rem 0.375rem;
        border-radius: 12px;
        font-size: 0.8rem;
      }

      .status.active {
        background-color: #c8e6c9;
        color: #2e7d32;
      }

      .status.inactive {
        background-color: #e0e0e0;
        color: #616161;
      }

      .status.injured {
        background-color: #ffcdd2;
        color: #c62828;
      }

      .player-actions {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.5rem;
        padding: 1rem;
        background-color: #f9f9f9;
      }

      .btn {
        text-decoration: none;
        padding: 0.375rem 0.75rem;
        border-radius: 4px;
        text-align: center;
        font-size: 0.875rem;
      }

      .btn-view {
        background-color: #e3f2fd;
        color: #1976d2;
      }

      .btn-edit {
        background-color: #1976d2;
        color: white;
      }
    `,
  ],
})
export class PlayerCardComponent {
  @Input() player!: Player;
  @Input() photoUrl: string | null = null;

  getInitials(): string {
    return (
      (this.player.first_name?.charAt(0) || '') +
      (this.player.last_name?.charAt(0) || '')
    ).toUpperCase();
  }
}
