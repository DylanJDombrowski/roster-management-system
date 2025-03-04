import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { SupabaseService } from './supabase.service';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'coach';
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<UserProfile | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private supabaseService: SupabaseService,
    private router: Router
  ) {
    // Check for existing session on init
    this.supabaseService.client.auth.getSession().then(({ data }) => {
      if (data && data.session) {
        this.fetchUserProfile(data.session.user.id);
      }
    });

    // Set up auth state change listener
    this.supabaseService.client.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        this.fetchUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private async fetchUserProfile(userId: string): Promise<void> {
    console.log('Fetching profile for user ID:', userId); // Add this log

    try {
      // This is the correct way to query by ID
      const { data, error } = await this.supabaseService.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);

        // If the profile doesn't exist, we could create it automatically
        if (error.code === 'PGRST116') {
          console.log('No profile found. Creating a default profile...');

          // Get user email from auth
          const { data: userData } =
            await this.supabaseService.client.auth.getUser();
          if (userData?.user) {
            const email = userData.user.email || '';

            // Insert a default profile
            const { data: newProfile, error: insertError } =
              await this.supabaseService.client
                .from('profiles')
                .insert([
                  {
                    id: userId,
                    first_name: 'New',
                    last_name: 'User',
                    email: email,
                    role: 'admin', // Default to admin for testing
                  },
                ])
                .select()
                .single();

            if (insertError) {
              console.error('Error creating default profile:', insertError);
            } else if (newProfile) {
              console.log('Created default profile:', newProfile);
              this.currentUserSubject.next(newProfile as UserProfile);
              return;
            }
          }
        }

        this.currentUserSubject.next(null);
        return;
      }

      if (data) {
        console.log('Profile found:', data);
        this.currentUserSubject.next(data as UserProfile);
      } else {
        console.log('No data returned but no error either');
        this.currentUserSubject.next(null);
      }
    } catch (err: any) {
      if (err.name === 'NavigatorLockAcquireTimeoutError') {
        console.warn('Auth lock error occurred. Retrying...');
        // Retry after a short delay
        setTimeout(() => this.fetchUserProfile(userId), 500);
        return;
      }
      console.error('Unexpected error in fetchUserProfile:', err);
      this.currentUserSubject.next(null);
    }
  }

  async signInWithEmail(
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: any }> {
    const { data, error } =
      await this.supabaseService.client.auth.signInWithPassword({
        email,
        password,
      });

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  }

  async signInWithGoogle(): Promise<{ success: boolean; error?: any }> {
    const { data, error } =
      await this.supabaseService.client.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

    if (error) {
      return { success: false, error };
    }

    return { success: true };
  }

  async signOut(): Promise<void> {
    await this.supabaseService.client.auth.signOut();
    this.currentUserSubject.next(null);
  }

  isAuthenticated(): boolean {
    return !!this.currentUserSubject.value;
  }

  isAdmin(): boolean {
    return this.currentUserSubject.value?.role === 'admin';
  }

  isCoach(): boolean {
    return this.currentUserSubject.value?.role === 'coach';
  }
}
