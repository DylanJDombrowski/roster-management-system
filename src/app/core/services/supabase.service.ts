// src/app/core/services/supabase.service.ts
import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class SupabaseService {
  private supabase: SupabaseClient;

  // Add this debugging code to your SupabaseService constructor
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
          storage: localStorage,
        },
      }
    );

    // List all buckets to verify existence and access
    this.supabase.storage.listBuckets().then(({ data, error }) => {
      console.log('Available buckets:', data);
      console.log('Bucket listing error:', error);

      // Check if player-photos bucket exists
      if (data) {
        const playerPhotosBucket = data.find(
          (bucket) => bucket.name === 'player-photos'
        );
        console.log('player-photos bucket found:', !!playerPhotosBucket);

        if (playerPhotosBucket) {
          console.log('Bucket details:', playerPhotosBucket);
        }
      }
    });
  }

  get client() {
    return this.supabase;
  }
}
