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
    console.log('AuthService initializing');

    // Initialize authentication state sequentially
    this.initAuthState();
  }

  private async initAuthState(): Promise<void> {
    try {
      // First check existing session
      const { data } = await this.supabaseService.client.auth.getSession();

      if (data?.session) {
        console.log('Found existing session');
        await this.fetchUserProfile(data.session.user.id);
      } else {
        console.log('No active session found');
      }

      // Then set up auth state change listener
      this.supabaseService.client.auth.onAuthStateChange((event, session) => {
        console.log('Auth state change:', event);

        if (event === 'SIGNED_IN' && session) {
          this.fetchUserProfile(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          this.currentUserSubject.next(null);
          this.router.navigate(['/auth/login']);
        }
      });
    } catch (err) {
      console.error('Error initializing auth state:', err);
    }
  }

  private async fetchUserProfile(
    userId: string,
    retryCount = 0
  ): Promise<void> {
    const maxRetries = 3;
    console.log('Fetching profile for user ID:', userId);

    try {
      const { data, error } = await this.supabaseService.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user profile:', error);

        // For PGRST116, profile not found, create a new one
        if (error.code === 'PGRST116') {
          console.log(
            'Profile not found. Attempting to create a default profile...'
          );
          try {
            const { data: userData } =
              await this.supabaseService.client.auth.getUser();

            if (userData?.user) {
              // Create a default profile
              const email = userData.user.email || '';
              const { data: newProfile, error: insertError } =
                await this.supabaseService.client
                  .from('profiles')
                  .insert([
                    {
                      id: userId,
                      first_name: 'New',
                      last_name: 'User',
                      email: email,
                      role: 'admin',
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
          } catch (createErr) {
            console.error('Error in profile creation flow:', createErr);
          }
        }

        // Only set user to null if we couldn't recover
        this.currentUserSubject.next(null);
        return;
      }

      if (data) {
        console.log('Profile loaded successfully:', data);
        this.currentUserSubject.next(data as UserProfile);
      } else {
        console.log('No profile data returned but no error');
        this.currentUserSubject.next(null);
      }
    } catch (err: any) {
      console.error('Unexpected error in fetchUserProfile:', err);

      // Only retry for lock errors
      if (
        err.name === 'NavigatorLockAcquireTimeoutError' &&
        retryCount < maxRetries
      ) {
        console.warn(
          `Auth lock error occurred. Retrying (${
            retryCount + 1
          }/${maxRetries})...`
        );
        // Exponential backoff
        const delay = 500 * Math.pow(2, retryCount);
        setTimeout(() => this.fetchUserProfile(userId, retryCount + 1), delay);
        return;
      }

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
