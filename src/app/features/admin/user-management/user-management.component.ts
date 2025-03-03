// src/app/features/admin/user-management/user-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserProfile } from '../../../core/models/user.model';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="user-management-container">
      <div class="header">
        <h1>User Management</h1>
        <div class="actions">
          <button class="btn btn-invite" (click)="openInviteModal()">
            + Invite User
          </button>
        </div>
      </div>

      <div class="users-card">
        <div class="users-table-container">
          <table class="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.first_name }} {{ user.last_name }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <span class="role-badge" [class]="user.role">{{
                    user.role
                  }}</span>
                </td>
                <td class="actions-cell">
                  <button
                    class="btn-icon"
                    [routerLink]="['/admin/users', user.id]"
                  >
                    View
                  </button>
                  <button
                    class="btn-icon btn-icon-edit"
                    [routerLink]="['/admin/users', user.id, 'edit']"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- This would be replaced with a proper modal component -->
    <div class="modal" *ngIf="showInviteModal">
      <div class="modal-content">
        <div class="modal-header">
          <h2>Invite New User</h2>
          <button class="btn-close" (click)="closeInviteModal()">×</button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="newUserEmail"
              placeholder="Enter email address"
            />
          </div>

          <div class="form-group">
            <label for="role">Role</label>
            <select id="role" [(ngModel)]="newUserRole">
              <option value="coach">Coach</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-cancel" (click)="closeInviteModal()">
            Cancel
          </button>
          <button
            class="btn btn-save"
            [disabled]="!newUserEmail"
            (click)="inviteUser()"
          >
            {{ isInviting ? 'Sending...' : 'Send Invitation' }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .user-management-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1.5rem;
      }

      .btn-invite {
        background-color: #1976d2;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        cursor: pointer;
        border: none;
        font-weight: 500;
      }

      .users-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
      }

      .users-table-container {
        overflow-x: auto;
      }

      .users-table {
        width: 100%;
        border-collapse: collapse;
      }

      .users-table th,
      .users-table td {
        padding: 1rem;
        text-align: left;
        border-bottom: 1px solid #e0e0e0;
      }

      .users-table th {
        background-color: #f5f5f5;
        font-weight: 500;
      }

      .role-badge {
        display: inline-block;
        padding: 0.25rem 0.5rem;
        border-radius: 4px;
        font-size: 0.75rem;
        font-weight: 500;
      }

      .role-badge.admin {
        background-color: #bbdefb;
        color: #1976d2;
      }

      .role-badge.coach {
        background-color: #c8e6c9;
        color: #388e3c;
      }

      .actions-cell {
        white-space: nowrap;
      }

      .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        color: #1976d2;
        margin-right: 0.5rem;
        font-size: 0.875rem;
      }

      .btn-icon-edit {
        color: #388e3c;
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
        max-width: 500px;
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
      }

      .form-group {
        margin-bottom: 1rem;
      }

      .form-group label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      .form-group input,
      .form-group select {
        width: 100%;
        padding: 0.625rem;
        border: 1px solid #ccc;
        border-radius: 4px;
        font-size: 1rem;
      }

      .modal-footer {
        padding: 1rem 1.5rem;
        border-top: 1px solid #e0e0e0;
        display: flex;
        justify-content: flex-end;
        gap: 1rem;
      }

      .btn {
        padding: 0.5rem 1rem;
        border-radius: 4px;
        font-weight: 500;
        cursor: pointer;
        border: none;
        font-size: 0.875rem;
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
    `,
  ],
})
export class UserManagementComponent implements OnInit {
  users: UserProfile[] = [];
  showInviteModal = false;
  newUserEmail = '';
  newUserRole = 'coach';
  isInviting = false;

  ngOnInit(): void {
    // For now, we'll use mock data
    this.users = [
      {
        id: '1',
        first_name: 'John',
        last_name: 'Admin',
        email: 'john@example.com',
        role: 'admin',
      },
      {
        id: '2',
        first_name: 'Jane',
        last_name: 'Coach',
        email: 'jane@example.com',
        role: 'coach',
      },
    ];
  }

  openInviteModal(): void {
    this.showInviteModal = true;
  }

  closeInviteModal(): void {
    this.showInviteModal = false;
    this.newUserEmail = '';
    this.newUserRole = 'coach';
  }

  inviteUser(): void {
    if (!this.newUserEmail) return;

    this.isInviting = true;

    // Simulate API call
    setTimeout(() => {
      // Add new user to the list (in a real app, this would come from the API)
      this.users.push({
        id: (this.users.length + 1).toString(),
        first_name: 'New',
        last_name: 'User',
        email: this.newUserEmail,
        role: this.newUserRole as 'admin' | 'coach',
      });

      this.isInviting = false;
      this.closeInviteModal();
      alert(`Invitation sent to ${this.newUserEmail}`);
    }, 1000);
  }
}
