// src/app/shared/components/layout/main-layout.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="app-container">
      <header class="header">
        <div class="logo">
          <h1>Softball Team Manager</h1>
        </div>

        <nav class="main-nav">
          <a routerLink="/dashboard" routerLinkActive="active">Dashboard</a>
          <a routerLink="/players" routerLinkActive="active">Players</a>
          <a routerLink="/teams" routerLinkActive="active">Teams</a>
          <ng-container *ngIf="authService.isAdmin()">
            <a routerLink="/admin" routerLinkActive="active">Admin</a>
          </ng-container>
        </nav>

        <div class="user-menu" *ngIf="authService.currentUser$ | async as user">
          <span class="user-name"
            >{{ user.first_name }} {{ user.last_name }}</span
          >
          <button (click)="logout()" class="logout-btn">Logout</button>
        </div>
      </header>

      <main class="content">
        <router-outlet></router-outlet>
      </main>

      <footer class="footer">
        <p>&copy; 2025 Softball Team Management System</p>
      </footer>
    </div>
  `,
  styles: [
    `
      .app-container {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
      }

      .header {
        background-color: #1976d2;
        color: white;
        padding: 1rem;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .logo h1 {
        margin: 0;
        font-size: 1.5rem;
      }

      .main-nav {
        display: flex;
        gap: 1.5rem;
      }

      .main-nav a {
        color: white;
        text-decoration: none;
        padding: 0.5rem 0;
        position: relative;
      }

      .main-nav a.active::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 3px;
        background-color: white;
      }

      .user-menu {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .logout-btn {
        background-color: rgba(255, 255, 255, 0.2);
        border: 1px solid white;
        color: white;
        padding: 0.25rem 0.75rem;
        border-radius: 4px;
        cursor: pointer;
      }

      .content {
        flex: 1;
        padding: 1.5rem;
        background-color: #f5f5f5;
      }

      .footer {
        background-color: #f0f0f0;
        padding: 1rem;
        text-align: center;
        color: #666;
      }

      @media (max-width: 768px) {
        .header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .main-nav {
          width: 100%;
          overflow-x: auto;
        }
      }
    `,
  ],
})
export class MainLayoutComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.signOut();
  }
}
