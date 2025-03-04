// src/app/core/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      }
    );

    // Set up global error handler for lock errors
    window.addEventListener('error', (event) => {
      if (
        event.error &&
        event.error.name === 'NavigatorLockAcquireTimeoutError'
      ) {
        console.warn(
          'Auth lock error occurred. This is usually harmless and will resolve itself.'
        );
        // Prevent the error from bubbling up to the UI
        event.preventDefault();
      }
    });
  }

  get client() {
    return this.supabase;
  }
}
