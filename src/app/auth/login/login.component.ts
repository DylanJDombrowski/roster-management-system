// src/app/auth/login/login.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h2>Login</h2>
        <div *ngIf="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
            />
          </div>

          <button type="submit" [disabled]="isLoading">
            {{ isLoading ? 'Logging in...' : 'Log In' }}
          </button>
        </form>

        <div class="divider">
          <span>OR</span>
        </div>

        <button
          class="google-button"
          (click)="signInWithGoogle()"
          [disabled]="isLoading"
        >
          Continue with Google
        </button>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #f5f5f5;
      }

      .login-card {
        background: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        width: 100%;
        max-width: 400px;
      }

      h2 {
        text-align: center;
        margin-bottom: 1.5rem;
      }

      .form-group {
        margin-bottom: 1rem;
      }

      label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
      }

      input {
        width: 100%;
        padding: 0.75rem;
        border: 1px solid #ccc;
        border-radius: 4px;
      }

      button {
        width: 100%;
        padding: 0.75rem;
        background-color: #3f51b5;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: 500;
      }

      button:disabled {
        background-color: #9fa8da;
        cursor: not-allowed;
      }

      .divider {
        display: flex;
        align-items: center;
        margin: 1.5rem 0;
      }

      .divider::before,
      .divider::after {
        content: '';
        flex: 1;
        border-bottom: 1px solid #ddd;
      }

      .divider span {
        padding: 0 10px;
        color: #777;
      }

      .google-button {
        background-color: white;
        color: #333;
        border: 1px solid #ddd;
      }

      .error-message {
        background-color: #ffebee;
        color: #c62828;
        padding: 0.75rem;
        border-radius: 4px;
        margin-bottom: 1rem;
      }
    `,
  ],
})
export class LoginComponent {
  email = '';
  password = '';
  isLoading = false;
  errorMessage = '';
  returnUrl = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    // Get return URL from route parameters or default to '/dashboard'
    this.returnUrl =
      this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  async onSubmit() {
    if (!this.email || !this.password) {
      this.errorMessage = 'Please enter both email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
      const { success, error } = await this.authService.signInWithEmail(
        this.email,
        this.password
      );

      if (success) {
        this.router.navigateByUrl(this.returnUrl);
      } else {
        this.errorMessage =
          error.message || 'Failed to log in. Please try again.';
      }
    } catch (err: any) {
      this.errorMessage = err.message || 'An unexpected error occurred';
    } finally {
      this.isLoading = false;
    }
  }

  async signInWithGoogle() {
    this.isLoading = true;
    this.errorMessage = '';

    try {
      await this.authService.signInWithGoogle();
      // Redirect is handled by Supabase OAuth
    } catch (err: any) {
      this.errorMessage = err.message || 'Failed to log in with Google';
      this.isLoading = false;
    }
  }
}
