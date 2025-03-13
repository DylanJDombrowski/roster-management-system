import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PlayerPhoto } from '../../../core/models/player.model';
import { PlayersService } from '../../../core/services/players.service';
import { ImageCropperComponent } from 'ngx-image-cropper';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="photo-upload-container">
      <!-- Section for displaying existing photos -->
      <div class="existing-photos" *ngIf="existingPhotos.length > 0">
        <h3>Player Photos</h3>
        <div class="photos-grid">
          <div
            *ngFor="let photo of existingPhotos"
            class="photo-item"
            [class.primary]="photo.is_primary"
          >
            <div class="photo-preview">
              <img [src]="getPhotoUrl(photo)" alt="Player photo" />
              <div class="primary-badge" *ngIf="photo.is_primary">Primary</div>
            </div>
            <div class="photo-actions">
              <button
                *ngIf="!photo.is_primary"
                (click)="setPrimaryPhoto(photo.id)"
                class="btn btn-primary"
              >
                Set as Primary
              </button>
              <button (click)="deletePhoto(photo.id)" class="btn btn-danger">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload section -->
      <div class="upload-section">
        <h3>Upload New Photo</h3>

        <div
          class="drop-zone"
          (dragover)="onDragOver($event)"
          (dragleave)="onDragLeave($event)"
          (drop)="onDrop($event)"
          [class.active]="isDragging"
        >
          <!-- Placeholder when no file is selected -->
          <div *ngIf="!previewUrl" class="placeholder">
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
              (change)="onFileSelected($event)"
              hidden
              #fileInput
            />
            <button class="btn btn-primary" (click)="fileInput.click()">
              Select Image
            </button>
          </div>

          <!-- Preview when a file is selected -->
          <div *ngIf="previewUrl" class="preview">
            <img [src]="previewUrl" alt="Preview" />
            <div class="preview-actions">
              <button
                class="btn btn-primary"
                (click)="uploadPhoto()"
                [disabled]="isUploading"
              >
                {{ isUploading ? 'Uploading...' : 'Upload Photo' }}
              </button>
              <button class="btn btn-secondary" (click)="cancelUpload()">
                Cancel
              </button>
            </div>

            <!-- Progress bar for upload -->
            <div *ngIf="isUploading" class="progress-container">
              <div class="progress-bar">
                <div class="progress" [style.width.%]="uploadProgress"></div>
              </div>
              <span>{{ uploadProgress }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .photo-upload-container {
        margin-bottom: 2rem;
      }

      h3 {
        margin-bottom: 1rem;
        font-size: 1.2rem;
        color: #333;
      }

      .existing-photos {
        margin-bottom: 2rem;
      }

      .photos-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }

      .photo-item {
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        background-color: white;
      }

      .photo-item.primary {
        border: 2px solid #4caf50;
      }

      .photo-preview {
        position: relative;
        height: 160px;
      }

      .photo-preview img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .primary-badge {
        position: absolute;
        top: 10px;
        right: 10px;
        background-color: #4caf50;
        color: white;
        font-size: 0.75rem;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
      }

      .photo-actions {
        padding: 0.75rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .drop-zone {
        border: 2px dashed #ccc;
        border-radius: 8px;
        padding: 2rem;
        text-align: center;
        transition: all 0.3s ease;
        background-color: #f9f9f9;
      }

      .drop-zone.active {
        border-color: #2196f3;
        background-color: rgba(33, 150, 243, 0.05);
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
      }

      .preview-actions {
        display: flex;
        gap: 0.5rem;
      }

      .progress-container {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .progress-bar {
        flex: 1;
        height: 10px;
        background-color: #e0e0e0;
        border-radius: 5px;
        overflow: hidden;
      }

      .progress {
        height: 100%;
        background-color: #2196f3;
      }

      .btn {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        font-size: 0.875rem;
      }

      .btn-primary {
        background-color: #2196f3;
        color: white;
      }

      .btn-secondary {
        background-color: #f5f5f5;
        color: #333;
      }

      .btn-danger {
        background-color: #f5f5f5;
        color: #f44336;
      }

      .btn:disabled {
        opacity: 0.7;
        cursor: not-allowed;
      }

      @media (max-width: 768px) {
        .photos-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
      }
    `,
  ],
})
export class PhotoUploadComponent {
  @Input() playerId: string = '';
  @Input() existingPhotos: PlayerPhoto[] = [];
  @Output() photoUploaded = new EventEmitter<PlayerPhoto>();
  @Output() photoDeleted = new EventEmitter<string>();
  @Output() primaryPhotoChanged = new EventEmitter<string>();

  isUploading = false;
  uploadProgress = 0;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isDragging = false;

  constructor(private playersService: PlayersService) {}

  // Handle file selection from input
  onFileSelected(event: any): void {
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

      this.selectedFile = file;
      this.createPreview(file);
    }
  }

  // Handle drag and drop events
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
        this.selectedFile = file;
        this.createPreview(file);
      }
    }
  }

  // Create a preview of the selected image
  createPreview(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.previewUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  // Upload the selected photo
  uploadPhoto(): void {
    if (!this.selectedFile || !this.playerId) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    // Simulate progress updates for better UX
    const progressInterval = setInterval(() => {
      if (this.uploadProgress < 90) {
        this.uploadProgress += 10;
      }
    }, 300);

    this.playersService
      .uploadPlayerPhoto(this.playerId, this.selectedFile)
      .subscribe({
        next: (photo) => {
          clearInterval(progressInterval);
          this.uploadProgress = 100;

          console.log('Uploaded photo:', photo);
          console.log('Photo URL:', photo.url);

          setTimeout(() => {
            this.isUploading = false;
            this.selectedFile = null;
            this.previewUrl = null;
            this.photoUploaded.emit(photo);
          }, 500);
        },
        error: (error) => {
          clearInterval(progressInterval);
          this.isUploading = false;
          this.uploadProgress = 0;
          console.error('Upload failed', error);
        },
      });
  }

  // Cancel the current upload
  cancelUpload(): void {
    this.selectedFile = null;
    this.previewUrl = null;
  }

  // Set a photo as the primary photo
  setPrimaryPhoto(photoId: string): void {
    if (!this.playerId) return;

    this.playersService.setAsPrimaryPhoto(photoId, this.playerId).subscribe({
      next: () => {
        // Update local state
        this.existingPhotos = this.existingPhotos.map((photo) => ({
          ...photo,
          is_primary: photo.id === photoId,
        }));
        this.primaryPhotoChanged.emit(photoId);
      },
      error: (error) => {
        console.error('Failed to set primary photo', error);
      },
    });
  }

  // Delete a photo
  deletePhoto(photoId: string): void {
    if (confirm('Are you sure you want to delete this photo?')) {
      this.playersService.deletePhoto(photoId).subscribe({
        next: () => {
          this.existingPhotos = this.existingPhotos.filter(
            (photo) => photo.id !== photoId
          );
          this.photoDeleted.emit(photoId);
        },
        error: (error) => {
          console.error('Failed to delete photo', error);
        },
      });
    }
  }

  // Get the URL for a photo
  getPhotoUrl(photo: PlayerPhoto): string {
    // If the photo already has a URL (from our processing), use that
    if (photo.url) {
      return photo.url;
    }

    // Otherwise, get the URL from the storage path
    if (photo.storage_path) {
      return this.playersService.getPhotoPublicUrl(photo.storage_path);
    }

    // Fall back to a placeholder
    return 'assets/placeholder-image.jpg';
  }
}
