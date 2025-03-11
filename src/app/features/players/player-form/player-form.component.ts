// src/app/features/players/player-form/player-form.component.ts
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PlayersService } from '../../../core/services/players.service';
import { Player, PlayerPhoto } from '../../../core/models/player.model';
import { PhotoUploadComponent } from '../../../shared/components/photo-upload/photo-upload.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-player-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, PhotoUploadComponent],
  template: `
    <div class="player-form-container">
      <div class="header">
        <h1>{{ isEdit ? 'Edit Player' : 'Add New Player' }}</h1>
      </div>

      <form [formGroup]="playerForm" (ngSubmit)="onSubmit()" class="form">
        <div class="form-grid">
          <!-- Basic Info -->
          <div class="form-section">
            <h2>Basic Information</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  formControlName="first_name"
                />
                <div
                  *ngIf="
                    playerForm.get('first_name')?.invalid &&
                    playerForm.get('first_name')?.touched
                  "
                  class="error"
                >
                  First name is required
                </div>
              </div>

              <div class="form-group">
                <label for="last_name">Last Name *</label>
                <input type="text" id="last_name" formControlName="last_name" />
                <div
                  *ngIf="
                    playerForm.get('last_name')?.invalid &&
                    playerForm.get('last_name')?.touched
                  "
                  class="error"
                >
                  Last name is required
                </div>
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="jersey_number">Jersey Number</label>
                <input
                  type="number"
                  id="jersey_number"
                  formControlName="jersey_number"
                />
              </div>

              <div class="form-group">
                <label for="status">Status *</label>
                <select id="status" formControlName="status">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="injured">Injured</option>
                </select>
              </div>
            </div>
          </div>

          <div class="photo-section" *ngIf="isEdit && playerId">
            <h2>Player Photos</h2>
            <p class="photo-hint">
              Add or update player photos. The primary photo will be used for
              player cards and roster displays.
            </p>

            <app-photo-upload
              [playerId]="playerId"
              [existingPhotos]="playerPhotos"
              (photoUploaded)="onPhotoUploaded($event)"
              (photoDeleted)="onPhotoDeleted($event)"
              (primaryPhotoChanged)="onPrimaryPhotoChanged($event)"
            >
            </app-photo-upload>
          </div>

          <!-- Player Details -->
          <div class="form-section">
            <h2>Player Details</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="primary_position">Primary Position</label>
                <input
                  type="text"
                  id="primary_position"
                  formControlName="primary_position"
                />
              </div>

              <div class="form-group">
                <label for="height">Height</label>
                <input
                  type="text"
                  id="height"
                  formControlName="height"
                  placeholder="e.g., 5'10&quot;"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="bats">Bats</label>
                <select id="bats" formControlName="bats">
                  <option value="">-- Select --</option>
                  <option value="R">Right</option>
                  <option value="L">Left</option>
                  <option value="S">Switch</option>
                </select>
              </div>

              <div class="form-group">
                <label for="throws">Throws</label>
                <select id="throws" formControlName="throws">
                  <option value="">-- Select --</option>
                  <option value="R">Right</option>
                  <option value="L">Left</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Additional Info -->
          <div class="form-section">
            <h2>Additional Information</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="hometown">Hometown</label>
                <input type="text" id="hometown" formControlName="hometown" />
              </div>

              <div class="form-group">
                <label for="high_school">High School</label>
                <input
                  type="text"
                  id="high_school"
                  formControlName="high_school"
                />
              </div>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="gpa">GPA</label>
                <input type="text" id="gpa" formControlName="gpa" />
              </div>
            </div>
          </div>

          <!-- Contact Info -->
          <div class="form-section">
            <h2>Contact Information</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" formControlName="email" />
                <div
                  *ngIf="playerForm.get('email')?.errors?.['email'] && playerForm.get('email')?.touched"
                  class="error"
                >
                  Please enter a valid email address
                </div>
              </div>

              <div class="form-group">
                <label for="phone">Phone</label>
                <input type="tel" id="phone" formControlName="phone" />
              </div>
            </div>
          </div>
        </div>

        <div class="form-actions">
          <button type="button" class="btn btn-cancel" (click)="goBack()">
            Cancel
          </button>
          <button
            type="submit"
            class="btn btn-save"
            [disabled]="playerForm.invalid || isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Player' }}
          </button>
        </div>
      </form>
      <div class="photo-message" *ngIf="!isEdit">
        <p>
          <strong>Note:</strong> Photos can be added after creating the player.
        </p>
      </div>
    </div>
  `,
  styles: [
    `
      .player-form-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        margin-bottom: 1.5rem;
      }

      .form {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
        gap: 1.5rem;
      }

      .form-section {
        margin-bottom: 1.5rem;
      }

      .form-section h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #1976d2;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 0.5rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1rem;
        margin-bottom: 1rem;
      }

      .form-group {
        margin-bottom: 0.5rem;
      }

      label {
        display: block;
        margin-bottom: 0.375rem;
        font-weight: 500;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 0.625rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }

      .error {
        color: #d32f2f;
        font-size: 0.875rem;
        margin-top: 0.25rem;
      }

      .form-actions {
        margin-top: 1.5rem;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      .btn {
        padding: 0.625rem 1.25rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        font-size: 1rem;
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

      /* Add these to your player-form.component.ts styles */
      .photo-section {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e0e0e0;
      }

      .photo-hint {
        color: #666;
        margin-bottom: 1rem;
      }

      .photo-message {
        margin-top: 1.5rem;
        padding: 1rem;
        background-color: #f5f5f5;
        border-radius: 4px;
        color: #666;
      }

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class PlayerFormComponent implements OnInit, OnDestroy {
  playerForm: FormGroup;
  private subscriptions = new Subscription();
  isEdit = false;
  playerId: string | null = null;
  isSubmitting = false;
  playerPhotos: PlayerPhoto[] = [];

  constructor(
    private fb: FormBuilder,
    private playersService: PlayersService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.playerForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if we're editing an existing player
    this.playerId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.playerId;

    if (this.isEdit && this.playerId) {
      this.loadPlayer(this.playerId);
      this.loadPlayerPhotos(this.playerId);
    }
  }

  loadPlayerPhotos(playerId: string): void {
    const sub = this.playersService.getPlayerPhotos(playerId).subscribe({
      next: (photos) => {
        console.log('Player photos loaded:', photos);
        // Add public URLs to the photos
        this.playerPhotos = photos.map((photo) => ({
          ...photo,
          url: this.playersService.getPhotoPublicUrl(photo.storage_path),
        }));
      },
      error: (err) => {
        console.error('Error loading player photos', err);
      },
    });
    this.subscriptions.add(sub);
  }

  onPhotoUploaded(photo: PlayerPhoto): void {
    console.log('Photo uploaded:', photo);
    // Add URL to the new photo
    const photoWithUrl = {
      ...photo,
      url: this.playersService.getPhotoPublicUrl(photo.storage_path),
    };
    this.playerPhotos = [...this.playerPhotos, photoWithUrl];
  }

  onPhotoDeleted(photoId: string): void {
    console.log('Photo deleted:', photoId);
    this.playerPhotos = this.playerPhotos.filter(
      (photo) => photo.id !== photoId
    );
  }

  onPrimaryPhotoChanged(photoId: string): void {
    console.log('Primary photo changed:', photoId);
    this.playerPhotos = this.playerPhotos.map((photo) => ({
      ...photo,
      is_primary: photo.id === photoId,
    }));
  }

  createForm(): FormGroup {
    return this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      jersey_number: [null],
      primary_position: [''],
      height: [''],
      bats: [''],
      throws: [''],
      hometown: [''],
      high_school: [''],
      gpa: [''],
      email: ['', [Validators.email]],
      phone: [''],
      status: ['active', [Validators.required]],
    });
  }

  loadPlayer(id: string): void {
    this.playersService.getPlayer(id).subscribe((player) => {
      this.playerForm.patchValue(player);
    });
  }

  onSubmit(): void {
    if (this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const playerData = this.playerForm.value;

    const saveOperation =
      this.isEdit && this.playerId
        ? this.playersService.updatePlayer(this.playerId, playerData)
        : this.playersService.createPlayer(playerData);

    saveOperation.subscribe({
      next: (player) => {
        // If this was a new player, redirect to edit mode to add photos
        if (!this.isEdit) {
          this.router.navigate(['/players', player.id, 'edit']);
        } else {
          // For existing players being edited, stay on the same page
          this.isSubmitting = false;
          // Show a success message
          alert('Player saved successfully!');
        }
      },
      error: (err) => {
        console.error('Error saving player', err);
        this.isSubmitting = false;
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/players']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
