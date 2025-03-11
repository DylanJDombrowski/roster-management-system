// src/app/features/players/player-detail/player-detail.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { PlayersService } from '../../../core/services/players.service';
import { Player } from '../../../core/models/player.model';
import { AuthService } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-player-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="player-detail-container" *ngIf="player">
      <div class="header">
        <!-- In the player header -->
        <div class="player-photo">
          <img
            *ngIf="primaryPhotoUrl"
            [src]="primaryPhotoUrl"
            alt="{{ player.first_name }} {{ player.last_name }}"
          />
          <div *ngIf="!primaryPhotoUrl" class="initials">
            {{ getInitials() }}
          </div>
        </div>
        <div>
          <h1>{{ player.first_name }} {{ player.last_name }}</h1>
          <div class="status-badge" [class]="player.status">
            {{ player.status }}
          </div>
        </div>
        <div class="actions" *ngIf="authService.isAuthenticated()">
          <button
            class="btn btn-edit"
            [routerLink]="['/players', player.id, 'edit']"
          >
            Edit Player
          </button>
          <button class="btn btn-delete" (click)="confirmDelete()">
            Delete
          </button>
        </div>
      </div>

      <div class="player-content">
        <div class="player-info-card">
          <div class="profile-section">
            <div class="player-photo" [class.no-photo]="!photoUrl">
              <img
                *ngIf="photoUrl"
                [src]="photoUrl"
                alt="{{ player.first_name }} {{ player.last_name }}"
              />
              <div *ngIf="!photoUrl" class="initials">{{ getInitials() }}</div>
            </div>

            <div class="quick-info">
              <div class="info-item" *ngIf="player.jersey_number">
                <span class="label">Jersey</span>
                <span class="value">#{{ player.jersey_number }}</span>
              </div>
              <div class="info-item" *ngIf="player.primary_position">
                <span class="label">Position</span>
                <span class="value">{{ player.primary_position }}</span>
              </div>
              <div class="info-item" *ngIf="player.height">
                <span class="label">Height</span>
                <span class="value">{{ player.height }}</span>
              </div>
            </div>
          </div>

          <div class="details-section">
            <h2>Player Details</h2>
            <div class="details-grid">
              <div class="detail-item" *ngIf="player.bats">
                <span class="label">Bats</span>
                <span class="value">{{ getBatsDisplay(player.bats) }}</span>
              </div>
              <div class="detail-item" *ngIf="player.throws">
                <span class="label">Throws</span>
                <span class="value">{{ getThrowsDisplay(player.throws) }}</span>
              </div>
              <div class="detail-item" *ngIf="player.hometown">
                <span class="label">Hometown</span>
                <span class="value">{{ player.hometown }}</span>
              </div>
              <div class="detail-item" *ngIf="player.high_school">
                <span class="label">High School</span>
                <span class="value">{{ player.high_school }}</span>
              </div>
              <div class="detail-item" *ngIf="player.gpa">
                <span class="label">GPA</span>
                <span class="value">{{ player.gpa }}</span>
              </div>
            </div>
          </div>

          <div class="contact-section" *ngIf="player.email || player.phone">
            <h2>Contact Information</h2>
            <div class="details-grid">
              <div class="detail-item" *ngIf="player.email">
                <span class="label">Email</span>
                <span class="value">{{ player.email }}</span>
              </div>
              <div class="detail-item" *ngIf="player.phone">
                <span class="label">Phone</span>
                <span class="value">{{ player.phone }}</span>
              </div>
            </div>
          </div>

          <div class="bio-section" *ngIf="player.bio">
            <h2>Biography</h2>
            <p>{{ player.bio }}</p>
          </div>
        </div>

        <!-- This section will be expanded later to show team assignments -->
        <div class="teams-section">
          <h2>Team Assignments</h2>
          <div *ngIf="isLoadingTeams" class="loading-message">
            Loading team assignments...
          </div>
          <div
            *ngIf="
              !isLoadingTeams &&
              (!teamAssignments || teamAssignments.length === 0)
            "
            class="empty-message"
          >
            No team assignments yet.
          </div>
          <div
            *ngIf="
              !isLoadingTeams && teamAssignments && teamAssignments.length > 0
            "
            class="teams-list"
          >
            <div *ngFor="let assignment of teamAssignments" class="team-item">
              <span class="team-name">{{ assignment.teams.display_name }}</span>
              <a
                [routerLink]="['/teams', assignment.team_id]"
                class="view-team-link"
                >View Team</a
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="!player && !error">
      <p>Loading player information...</p>
    </div>

    <div class="error-state" *ngIf="error">
      <h2>Error Loading Player</h2>
      <p>{{ error }}</p>
      <button class="btn" routerLink="/players">Return to Players</button>
    </div>
  `,
  styles: [
    `
      .player-detail-container {
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

      .status-badge {
        display: inline-block;
        padding: 0.25rem 0.75rem;
        border-radius: 1rem;
        font-size: 0.875rem;
        font-weight: 500;
      }

      .status-badge.active {
        background-color: #c8e6c9;
        color: #2e7d32;
      }

      .status-badge.inactive {
        background-color: #e0e0e0;
        color: #616161;
      }

      .status-badge.injured {
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

      .btn-edit {
        background-color: #1976d2;
        color: white;
      }

      .btn-delete {
        background-color: #f5f5f5;
        color: #d32f2f;
      }

      .player-content {
        display: grid;
        grid-template-columns: 2fr 1fr;
        gap: 1.5rem;
      }

      .player-info-card,
      .teams-section {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
      }

      .profile-section {
        display: flex;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
        padding-bottom: 1.5rem;
        border-bottom: 1px solid #f0f0f0;
      }

      .player-photo {
        width: 150px;
        height: 150px;
        overflow: hidden;
        border-radius: 8px;
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
        font-size: 3rem;
        font-weight: bold;
        color: #666;
      }

      .quick-info {
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.5rem;
      }

      .info-item {
        display: flex;
        flex-direction: column;
      }

      .info-item .label {
        font-size: 0.875rem;
        color: #666;
      }

      .info-item .value {
        font-size: 1.25rem;
        font-weight: 500;
      }

      h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #1976d2;
      }

      .details-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
        margin-bottom: 1.5rem;
      }

      .detail-item {
        display: flex;
        flex-direction: column;
      }

      .detail-item .label {
        font-size: 0.875rem;
        color: #666;
      }

      .detail-item .value {
        font-size: 1rem;
      }

      .empty-message {
        color: #666;
        font-style: italic;
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
      .teams-list {
        margin-top: 1rem;
      }

      .team-item {
        padding: 0.75rem;
        border-radius: 4px;
        background-color: #f5f5f5;
        margin-bottom: 0.5rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .team-name {
        font-weight: 500;
      }

      .view-team-link {
        color: #1976d2;
        text-decoration: none;
        font-size: 0.875rem;
      }

      .view-team-link:hover {
        text-decoration: underline;
      }

      .loading-message {
        font-style: italic;
        color: #666;
      }

      @media (max-width: 768px) {
        .player-content {
          grid-template-columns: 1fr;
        }

        .profile-section {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }
      }
    `,
  ],
})
export class PlayerDetailComponent implements OnInit, OnDestroy {
  player: Player | null = null;
  primaryPhotoUrl: string | null = null;
  photoUrl: string | null = null;
  error: string | null = null;
  teamAssignments: any[] = [];
  isLoadingTeams = false;
  private subscriptions = new Subscription();

  constructor(
    private playersService: PlayersService,
    private route: ActivatedRoute,
    private router: Router,
    public authService: AuthService
  ) {}

  ngOnInit(): void {
    const playerId = this.route.snapshot.paramMap.get('id');
    if (playerId) {
      this.loadPlayer(playerId);
      this.loadPlayerTeams(playerId);

      // Also load the player photos
      this.playersService.getPlayerPhotos(playerId).subscribe({
        next: (photos) => {
          const primaryPhoto = photos.find((p) => p.is_primary);
          if (primaryPhoto) {
            this.primaryPhotoUrl = this.playersService.getPhotoPublicUrl(
              primaryPhoto.storage_path
            );
          }
        },
        error: (err) => console.error('Error loading player photos', err),
      });
    } else {
      this.error = 'No player ID provided';
    }
  }

  loadPlayer(id: string): void {
    const sub = this.playersService.getPlayer(id).subscribe({
      next: (player) => {
        this.player = player;
        // In a real implementation, we would also load the player's photo
        // this.loadPlayerPhoto(id);
      },
      error: (err) => {
        console.error('Error loading player', err);
        this.error = 'Failed to load player information. Please try again.';
      },
    });
    this.subscriptions.add(sub);

    this.playersService.getPlayerPhotos(id).subscribe({
      next: (photos) => {
        const primaryPhoto = photos.find((p) => p.is_primary);
        if (primaryPhoto) {
          this.primaryPhotoUrl = this.playersService.getPhotoPublicUrl(
            primaryPhoto.storage_path
          );
        }
      },
      error: (err) => console.error('Error loading player photos', err),
    });
  }

  loadPlayerTeams(playerId: string): void {
    this.isLoadingTeams = true;
    const sub = this.playersService
      .getPlayerTeamsWithDetails(playerId)
      .subscribe({
        next: (teamAssignments) => {
          console.log('Team assignments loaded:', teamAssignments);
          this.teamAssignments = teamAssignments;
          this.isLoadingTeams = false;
        },
        error: (err) => {
          console.error('Error loading team assignments', err);
          this.isLoadingTeams = false;
        },
      });
    this.subscriptions.add(sub);
  }

  getInitials(): string {
    if (!this.player) return '';
    return (
      (this.player.first_name?.charAt(0) || '') +
      (this.player.last_name?.charAt(0) || '')
    ).toUpperCase();
  }

  getBatsDisplay(bats: string): string {
    switch (bats) {
      case 'R':
        return 'Right';
      case 'L':
        return 'Left';
      case 'S':
        return 'Switch';
      default:
        return bats;
    }
  }

  getThrowsDisplay(throws: string): string {
    switch (throws) {
      case 'R':
        return 'Right';
      case 'L':
        return 'Left';
      default:
        return throws;
    }
  }

  confirmDelete(): void {
    if (confirm('Are you sure you want to delete this player?')) {
      // In a real implementation, we would call a delete method on the service
      // this.playersService.deletePlayer(this.player!.id).subscribe({
      //   next: () => {
      //     this.router.navigate(['/players']);
      //   },
      //   error: (err) => {
      //     console.error('Error deleting player', err);
      //     this.error = 'Failed to delete player. Please try again.';
      //   }
      // });

      // For now, just navigate back to the player list
      alert('Delete functionality will be implemented in the future.');
    }
  }

  ngOnDestroy(): void {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }
}
