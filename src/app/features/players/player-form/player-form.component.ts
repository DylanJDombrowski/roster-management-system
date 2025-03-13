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
import { Location } from '@angular/common';

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

          <div class="photo-section">
            <h2>Player Photo</h2>
            <p class="photo-hint">
              Add a photo for this player.
              {{
                isEdit
                  ? 'The primary photo will be used for player cards and roster displays.'
                  : 'This will become the players primary photo.'
              }}
            </p>

            <div *ngIf="!isEdit" class="new-player-photo-upload">
              <div
                class="drop-zone"
                (dragover)="onDragOver($event)"
                (dragleave)="onDragLeave($event)"
                (drop)="onDrop($event)"
                [class.active]="isDragging"
              >
                <div *ngIf="!newPlayerPhotoPreview" class="placeholder">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <p>Drag and drop an image here or click to select</p>
                  <input
                    type="file"
                    accept="image/*"
                    (change)="onNewPlayerPhotoSelected($event)"
                    hidden
                    #newPlayerFileInput
                  />
                  <button
                    type="button"
                    class="btn btn-primary"
                    (click)="newPlayerFileInput.click()"
                  >
                    Select Image
                  </button>
                </div>

                <div *ngIf="newPlayerPhotoPreview" class="preview">
                  <img [src]="newPlayerPhotoPreview" alt="Preview" />
                  <button
                    type="button"
                    class="btn btn-secondary"
                    (click)="cancelNewPlayerPhotoUpload()"
                  >
                    Remove Photo
                  </button>
                </div>
              </div>
            </div>

            <app-photo-upload
              *ngIf="isEdit && playerId"
              [playerId]="playerId"
              [existingPhotos]="playerPhotos"
              (photoUploaded)="onPhotoUploaded($event)"
              (photoDeleted)="onPhotoDeleted($event)"
              (primaryPhotoChanged)="onPrimaryPhotoChanged($event)"
            ></app-photo-upload>
          </div>

          <!-- Player Details -->
          <div class="form-section">
            <h2>Player Details</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="primary_position">Primary Position</label>
                <select
                  id="primary_position"
                  formControlName="primary_position"
                >
                  <option value="">-- Select Position --</option>
                  <option *ngFor="let position of positions" [value]="position">
                    {{ position }}
                  </option>
                </select>
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
  // In player-form.component.ts, update the styles section
  styles: [
    `
      .player-form-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 2rem 1rem;
      }

      .header {
        margin-bottom: 2rem;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 1rem;
      }

      .header h1 {
        font-size: 2rem;
        color: #1976d2;
        margin: 0;
      }

      .form {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        padding: 2rem;
      }

      .form-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
        gap: 2rem;
      }

      .form-section {
        margin-bottom: 2rem;
      }

      .form-section h2 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: #1976d2;
        border-bottom: 2px solid #e0e0e0;
        padding-bottom: 0.5rem;
      }

      .form-row {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 1.5rem;
        margin-bottom: 1.5rem;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 600;
        color: #555;
      }

      input,
      select,
      textarea {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.2s;
      }

      input:focus,
      select:focus,
      textarea:focus {
        outline: none;
        border-color: #1976d2;
        box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
      }

      .error {
        color: #d32f2f;
        font-size: 0.875rem;
        margin-top: 0.375rem;
      }

      .form-actions {
        margin-top: 2rem;
        padding-top: 1.5rem;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        font-size: 1rem;
        transition: all 0.2s;
      }

      .btn-cancel {
        background-color: #f5f5f5;
        color: #333;
      }

      .btn-cancel:hover {
        background-color: #e0e0e0;
      }

      .btn-save {
        background-color: #1976d2;
        color: white;
      }

      .btn-save:hover {
        background-color: #1565c0;
      }

      .btn-save:disabled {
        background-color: #bbdefb;
        cursor: not-allowed;
      }

      /* Photo upload section styling */
      .photo-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background-color: #f9f9f9;
        border-radius: 8px;
        border: 1px dashed #ccc;
      }

      .photo-hint {
        color: #666;
        margin-bottom: 1.5rem;
      }

      .drop-zone {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        transition: all 0.3s ease;
        background-color: white;
        cursor: pointer;
      }

      .drop-zone.active {
        border-color: #1976d2;
        background-color: rgba(25, 118, 210, 0.05);
      }

      .placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        color: #666;
      }

      .preview {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }

      .preview img {
        max-width: 100%;
        max-height: 300px;
        border-radius: 4px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }

      .new-player-photo-upload {
        max-width: 500px;
        margin: 0 auto;
      }

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
        }

        .form-grid {
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
  newPlayerPhotoFile: File | null = null;
  newPlayerPhotoPreview: string | null = null;
  isDragging = false;

  positions: string[] = [
    'Pitcher',
    'Catcher',
    'First Base',
    'Second Base',
    'Third Base',
    'Shortstop',
    'Left Field',
    'Center Field',
    'Right Field',
    'Designated Player',
    'Utility',
  ];

  constructor(
    private fb: FormBuilder,
    private playersService: PlayersService,
    private router: Router,
    private route: ActivatedRoute,
    private location: Location
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

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.newPlayerPhotoFile = file;
        this.createNewPlayerPhotoPreview(file);
      }
    }
  }

  onNewPlayerPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Check if the file is an image
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file (JPEG, PNG, GIF, etc.)');
        return;
      }

      // Check file size (e.g., max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      this.newPlayerPhotoFile = file;
      this.createNewPlayerPhotoPreview(file);
    }
  }

  createNewPlayerPhotoPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.newPlayerPhotoPreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  cancelNewPlayerPhotoUpload(): void {
    this.newPlayerPhotoFile = null;
    this.newPlayerPhotoPreview = null;
  }

  onSubmit(): void {
    if (this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const playerData = this.playerForm.value;

    if (this.isEdit && this.playerId) {
      // Update existing player
      this.playersService.updatePlayer(this.playerId, playerData).subscribe({
        next: (player) => {
          this.isSubmitting = false;
          // Go back to the previous page instead of showing an alert
          this.location.back();
        },
        error: (err) => {
          console.error('Error saving player', err);
          this.isSubmitting = false;
        },
      });
    } else {
      // For new players, create the player first
      this.playersService.createPlayer(playerData).subscribe({
        next: (newPlayer) => {
          // If there's a photo to upload, upload it
          if (this.newPlayerPhotoFile) {
            this.playersService
              .uploadPlayerPhoto(newPlayer.id, this.newPlayerPhotoFile)
              .subscribe({
                next: (photo) => {
                  // Navigate to the player details page
                  this.router.navigate(['/players', newPlayer.id]);
                },
                error: (err) => {
                  console.error('Error uploading photo', err);
                  // Still navigate to the player page, but show an error about the photo
                  alert(
                    'Player was created, but there was an error uploading the photo. You can try again later.'
                  );
                  this.router.navigate(['/players', newPlayer.id]);
                },
              });
          } else {
            // No photo to upload, just navigate to the new player
            this.router.navigate(['/players', newPlayer.id]);
          }
        },
        error: (err) => {
          console.error('Error creating player', err);
          this.isSubmitting = false;
          alert('Error creating player. Please try again.');
        },
      });
    }
  }

  goBack(): void {
    this.location.back();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
