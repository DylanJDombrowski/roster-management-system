import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-container">
      <div class="spinner"></div>
      <p>Completing login...</p>
    </div>
  `,
  styles: [
    `
      .callback-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background-color: #f5f5f5;
      }

      .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        border-radius: 50%;
        border-top: 4px solid #3f51b5;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin-bottom: 1rem;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    `,
  ],
})
export class CallbackComponent implements OnInit {
  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Handle the OAuth callback
    this.supabaseService.client.auth
      .getSession()
      .then(({ data }) => {
        // Once the session is confirmed, redirect to dashboard
        if (data.session) {
          this.router.navigate(['/dashboard']);
        } else {
          // If no session, redirect back to login
          this.router.navigate(['/auth/login']);
        }
      })
      .catch((error) => {
        console.error('Error during auth callback:', error);
        this.router.navigate(['/auth/login']);
      });
  }
}
