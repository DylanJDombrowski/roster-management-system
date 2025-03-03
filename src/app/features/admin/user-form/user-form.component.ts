// src/app/features/admin/user-form/user-form.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UserProfile } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="user-form-container">
      <div class="header">
        <h1>{{ isEdit ? 'Edit User' : 'Create User' }}</h1>
      </div>

      <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="form">
        <div class="form-section">
          <h2>User Information</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="first_name">First Name *</label>
              <input type="text" id="first_name" formControlName="first_name" />
              <div
                *ngIf="
                  userForm.get('first_name')?.invalid &&
                  userForm.get('first_name')?.touched
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
                  userForm.get('last_name')?.invalid &&
                  userForm.get('last_name')?.touched
                "
                class="error"
              >
                Last name is required
              </div>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="email">Email *</label>
              <input
                type="email"
                id="email"
                formControlName="email"
                [readonly]="isEdit"
              />
              <div
                *ngIf="
                  userForm.get('email')?.invalid &&
                  userForm.get('email')?.touched
                "
                class="error"
              >
                <span *ngIf="userForm.get('email')?.errors?.['required']"
                  >Email is required</span
                >
                <span *ngIf="userForm.get('email')?.errors?.['email']"
                  >Please enter a valid email</span
                >
              </div>
            </div>

            <div class="form-group">
              <label for="role">Role *</label>
              <select id="role" formControlName="role">
                <option value="coach">Coach</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="phone">Phone</label>
              <input type="tel" id="phone" formControlName="phone" />
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
            [disabled]="userForm.invalid || isSubmitting"
          >
            {{ isSubmitting ? 'Saving...' : 'Save User' }}
          </button>
        </div>
      </form>
    </div>
  `,
  styles: [
    `
      .user-form-container {
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
      select {
        width: 100%;
        padding: 0.625rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }

      input[readonly] {
        background-color: #f5f5f5;
        cursor: not-allowed;
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
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEdit = false;
  userId: string | null = null;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.userForm = this.createForm();
  }

  ngOnInit(): void {
    // Check if we're editing an existing user
    this.userId = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!this.userId;

    if (this.isEdit && this.userId) {
      this.loadUser(this.userId);
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      role: ['coach', [Validators.required]],
      phone: [''],
    });
  }

  loadUser(id: string): void {
    // For now, we'll use mock data
    if (id === '1') {
      this.userForm.patchValue({
        first_name: 'John',
        last_name: 'Admin',
        email: 'john@example.com',
        role: 'admin',
      });
    } else if (id === '2') {
      this.userForm.patchValue({
        first_name: 'Jane',
        last_name: 'Coach',
        email: 'jane@example.com',
        role: 'coach',
        phone: '555-123-4567',
      });
    }
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const userData = this.userForm.value;

    // For now, we'll just simulate a successful save
    setTimeout(() => {
      this.router.navigate(['/admin/users']);
    }, 1000);
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
