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
    const { data, error } = await this.supabaseService.client
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      this.currentUserSubject.next(null);
      return;
    }

    if (data) {
      this.currentUserSubject.next(data as UserProfile);
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
