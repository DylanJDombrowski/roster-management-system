// src/app/features/admin/admin-dashboard/admin-dashboard.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-dashboard-container">
      <h1>Admin Dashboard</h1>

      <div class="admin-cards">
        <div class="admin-card">
          <h2>User Management</h2>
          <p>Invite and manage coaches and admin users</p>
          <a routerLink="/admin/users" class="btn">Manage Users</a>
        </div>

        <div class="admin-card">
          <h2>Team Management</h2>
          <p>Create and configure teams</p>
          <a routerLink="/teams" class="btn">Manage Teams</a>
        </div>

        <div class="admin-card">
          <h2>Player Management</h2>
          <p>Manage player profiles and assignments</p>
          <a routerLink="/players" class="btn">Manage Players</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .admin-dashboard-container {
        max-width: 1200px;
        margin: 0 auto;
      }

      h1 {
        margin-bottom: 1.5rem;
      }

      .admin-cards {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1.5rem;
      }

      .admin-card {
        background-color: white;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        padding: 1.5rem;
      }

      h2 {
        margin-top: 0;
        color: #1976d2;
      }

      .btn {
        display: inline-block;
        background-color: #1976d2;
        color: white;
        padding: 0.5rem 1rem;
        border-radius: 4px;
        text-decoration: none;
        margin-top: 1rem;
      }
    `,
  ],
})
export class AdminDashboardComponent {}
