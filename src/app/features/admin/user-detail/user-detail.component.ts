// src/app/features/admin/user-detail/user-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { UserProfile } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="user-detail-container" *ngIf="user">
      <div class="header">
        <h1>User Profile: {{ user.first_name }} {{ user.last_name }}</h1>
        <div class="actions">
          <button
            class="btn btn-edit"
            [routerLink]="['/admin/users', user.id, 'edit']"
          >
            Edit User
          </button>
          <button class="btn btn-back" (click)="goBack()">Back to Users</button>
        </div>
      </div>

      <div class="user-card">
        <div class="user-info">
          <div class="info-section">
            <h2>Basic Information</h2>
            <div class="info-row">
              <div class="info-item">
                <span class="label">First Name</span>
                <span class="value">{{ user.first_name }}</span>
              </div>
              <div class="info-item">
                <span class="label">Last Name</span>
                <span class="value">{{ user.last_name }}</span>
              </div>
            </div>
            <div class="info-row">
              <div class="info-item">
                <span class="label">Email</span>
                <span class="value">{{ user.email }}</span>
              </div>
              <div class="info-item">
                <span class="label">Role</span>
                <span class="value role-badge" [class]="user.role">{{
                  user.role
                }}</span>
              </div>
            </div>
            <div class="info-row" *ngIf="user.phone">
              <div class="info-item">
                <span class="label">Phone</span>
                <span class="value">{{ user.phone }}</span>
              </div>
            </div>
          </div>

          <!-- This would be expanded to show teams the coach is assigned to -->
          <div class="teams-section" *ngIf="user.role === 'coach'">
            <h2>Assigned Teams</h2>
            <p class="empty-message">No team assignments yet.</p>
          </div>
        </div>
      </div>
    </div>

    <div class="loading-state" *ngIf="!user && !error">
      <p>Loading user information...</p>
    </div>

    <div class="error-state" *ngIf="error">
      <h2>Error Loading User</h2>
      <p>{{ error }}</p>
      <button class="btn" routerLink="/admin/users">Return to Users</button>
    </div>
  `,
  styles: [
    `
      .user-detail-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
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
      }

      .btn-edit {
        background-color: #1976d2;
        color: white;
      }

      .btn-back {
        background-color: #f5f5f5;
        color: #333;
      }

      .user-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
      }

      h2 {
        font-size: 1.25rem;
        margin-bottom: 1rem;
        color: #1976d2;
        border-bottom: 1px solid #e0e0e0;
        padding-bottom: 0.5rem;
      }

      .info-section,
      .teams-section {
        margin-bottom: 2rem;
      }

      .info-row {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 1.5rem;
        margin-bottom: 1rem;
      }

      .info-item {
        display: flex;
        flex-direction: column;
      }

      .label {
        font-size: 0.875rem;
        color: #666;
        margin-bottom: 0.25rem;
      }

      .value {
        font-size: 1.125rem;
      }

      .role-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.875rem;
        font-weight: 500;
        width: fit-content;
      }

      .role-badge.admin {
        background-color: #bbdefb;
        color: #1976d2;
      }

      .role-badge.coach {
        background-color: #c8e6c9;
        color: #388e3c;
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
    `,
  ],
})
export class UserDetailComponent implements OnInit {
  user: UserProfile | null = null;
  error: string | null = null;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUser(userId);
    } else {
      this.error = 'No user ID provided';
    }
  }

  loadUser(id: string): void {
    // For now, we'll use mock data
    if (id === '1') {
      this.user = {
        id: '1',
        first_name: 'John',
        last_name: 'Admin',
        email: 'john@example.com',
        role: 'admin',
      };
    } else if (id === '2') {
      this.user = {
        id: '2',
        first_name: 'Jane',
        last_name: 'Coach',
        email: 'jane@example.com',
        role: 'coach',
        phone: '555-123-4567',
      };
    } else {
      this.error = 'User not found';
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/users']);
  }
}
