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
    console.log('Initializing Supabase client');

    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseKey,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          storage: localStorage, // Explicitly set to localStorage
        },
      }
    );

    // Check if we have a session at initialization
    this.supabase.auth.getSession().then(({ data }) => {
      console.log(
        'Initial Supabase session check:',
        data.session ? 'Session exists' : 'No session found'
      );
    });

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        'Supabase auth state change:',
        event,
        session ? 'With session' : 'No session'
      );
    });
  }

  get client() {
    return this.supabase;
  }
}
