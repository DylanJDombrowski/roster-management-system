// src/app/features/teams/team-form/team-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Team } from '../../../core/models/team.model';

@Component({
  selector: 'app-team-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="team-form-container">
      <div class="header">
        <h1>{{ isEdit ? 'Edit Team' : 'Add New Team' }}</h1>
      </div>

      <form [formGroup]="teamForm" (ngSubmit)="onSubmit()" class="form">
        <div class="form-grid">
          <div class="form-section">
            <h2>Team Information</h2>

            <div class="form-row">
              <div class="form-group">
                <label for="name">Team ID *</label>
                <input
                  type="text"
                  id="name"
                  formControlName="name"
                  placeholder="e.g., 16U"
                />
                <div
                  *ngIf="
                    teamForm.get('name')?.invalid &&
                    teamForm.get('name')?.touched
                  "
                  class="error"
                >
                  Team ID is required
                </div>
              </div>

              <div class="form-group">
                <label for="display_name">Display Name *</label>
                <input
                  type="text"
                  id="display_name"
                  formControlName="display_name"
                  placeholder="e.g., Lightning 16U"
                />
                <div
                  *ngIf="
                    teamForm.get('display_name')?.invalid &&
                    teamForm.get('display_name')?.touched
                  "
                  class="error"
                >
                  Display name is required
                </div>
              </div>
            </div>

            <div class="form-group">
              <label for="description">Description</label>
              <textarea
                id="description"
                formControlName="description"
                rows="3"
              ></textarea>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="season_year">Season Year</label>
                <input
                  type="number"
                  id="season_year"
                  formControlName="season_year"
                />
              </div>

              <div class="form-group">
                <label for="age_group">Age Group</label>
                <input
                  type="text"
                  id="age_group"
                  formControlName="age_group"
                  placeholder="e.g., 16U"
                />
              </div>
            </div>

            <div class="form-group form-checkbox">
              <label>
                <input type="checkbox" formControlName="is_active" />
                Active Team
              </label>
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
            [disabled]="teamForm.invalid || isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : 'Save Team' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .team-form-container {
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
        margin-bottom: 1rem;
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

      textarea {
        resize: vertical;
      }

      .form-checkbox {
        display: flex;
        align-items: center;
      }

      .form-checkbox label {
        display: flex;
        align-items: center;
        gap: 0.5rem;
      }

      .form-checkbox input {
        width: auto;
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

      @media (max-width: 768px) {
        .form-row {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class TeamFormComponent implements OnInit {
  teamForm: FormGroup;
  isEdit = false;
  teamId: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.teamForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if we're editing an existing team
    this.teamId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.teamId;

    if (this.isEdit && this.teamId) {
      // For now, we'll use mock data until we implement the TeamsService
      if (this.teamId === '1') {
        this.teamForm.patchValue({
          name: '16U',
          display_name: 'Lightning 16U',
          description: 'Our 16 and under competitive team',
          is_active: true,
          season_year: 2025,
          age_group: '16U',
        });
      }
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required]],
      display_name: ['', [Validators.required]],
      description: [''],
      season_year: [new Date().getFullYear()],
      age_group: [''],
      is_active: [true],
    });
  }

  onSubmit(): void {
    if (this.teamForm.invalid) {
      this.teamForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const teamData = this.teamForm.value;

    // For now, we'll just simulate a successful save
    setTimeout(() => {
      this.router.navigate(['/teams']);
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/teams']);
  }
}
