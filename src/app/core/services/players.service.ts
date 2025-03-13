import { Injectable } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  from,
  map,
  switchMap,
  tap,
} from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Player, PlayerPhoto } from '../models/player.model';

@Injectable({
  providedIn: 'root',
})
export class PlayersService {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  players$ = this.playersSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {}

  fetchPlayers(): Observable<Player[]> {
    return from(
      this.supabaseService.client
        .from('players')
        .select('*')
        .order('last_name', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as Player[];
      }),
      tap((players) => this.playersSubject.next(players))
    );
  }

  fetchPlayersByTeam(teamId: string): Observable<Player[]> {
    return from(
      this.supabaseService.client
        .from('team_players')
        .select('player_id, players(*)')
        .eq('team_id', teamId)
        .eq('is_active', true)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data.map((item) => item.players) as unknown as Player[];
      })
    );
  }

  getPlayer(playerId: string): Observable<Player> {
    return from(
      this.supabaseService.client
        .from('players')
        .select('*')
        .eq('id', playerId)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as Player;
      })
    );
  }

  createPlayer(
    player: Omit<Player, 'id' | 'created_at' | 'updated_at'>
  ): Observable<Player> {
    return from(
      this.supabaseService.client
        .from('players')
        .insert([player])
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as Player;
      }),
      tap((newPlayer) => {
        const currentPlayers = this.playersSubject.value;
        this.playersSubject.next([...currentPlayers, newPlayer]);
      })
    );
  }

  updatePlayer(id: string, updates: Partial<Player>): Observable<Player> {
    return from(
      this.supabaseService.client
        .from('players')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as Player;
      }),
      tap((updatedPlayer) => {
        const currentPlayers = this.playersSubject.value;
        const index = currentPlayers.findIndex((p) => p.id === id);
        if (index !== -1) {
          const updatedPlayers = [...currentPlayers];
          updatedPlayers[index] = updatedPlayer;
          this.playersSubject.next(updatedPlayers);
        }
      })
    );
  }

  // Photo related methods
  getPlayerPhotos(playerId: string): Observable<PlayerPhoto[]> {
    return from(
      this.supabaseService.client
        .from('player_photos')
        .select('*')
        .eq('player_id', playerId)
        .order('is_primary', { ascending: false })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        // Add URLs to the photos
        return (data as PlayerPhoto[]).map((photo) => ({
          ...photo,
          url: this.getPhotoPublicUrl(photo.storage_path),
        }));
      })
    );
  }

  uploadPlayerPhoto(playerId: string, file: File): Observable<PlayerPhoto> {
    const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
    const fileName = `${playerId}/${Date.now()}-${sanitizedFileName}`;

    console.log('Attempting to upload file:', fileName);
    console.log('To bucket: player-photos');
    console.log('File size:', file.size);

    return from(
      this.supabaseService.client.storage
        .from('player-photos')
        .upload(fileName, file)
    ).pipe(
      tap((response) => {
        console.log('Upload response:', response);
        console.log('Upload error details:', response.error);
        if (response.error) {
          console.error('Upload failed:', response.error.message);
          console.error('Error details:', response.error);
        }
      }),
      switchMap(({ data, error }) => {
        if (error) {
          throw error;
        }
        // Store the path for later use
        const storagePath = data?.path;

        // First get the user ID
        return from(this.supabaseService.client.auth.getUser()).pipe(
          switchMap((userData) => {
            const userId = userData.data.user?.id;

            // Then insert the photo record - DON'T include url field
            return from(
              this.supabaseService.client
                .from('player_photos')
                .insert([
                  {
                    player_id: playerId,
                    storage_path: storagePath,
                    is_primary: false,
                    uploaded_by: userId,
                    // No url field since it doesn't exist in the database
                  },
                ])
                .select()
                .single()
            );
          })
        );
      }),
      map(({ data, error }) => {
        if (error) {
          throw error;
        }

        // Add the URL to the returned object (but don't store in DB)
        const photoWithUrl = {
          ...(data as PlayerPhoto),
          url: this.getPhotoPublicUrl(data.storage_path),
        };

        return photoWithUrl;
      })
    );
  }

  getPrimaryPhotoUrl(playerId: string): Observable<string | null> {
    return from(
      this.supabaseService.client
        .from('player_photos')
        .select('storage_path')
        .eq('player_id', playerId)
        .eq('is_primary', true)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) {
          // Return placeholder if no primary photo exists
          return 'assets/placeholder-image.jpg';
        }
        return this.getPhotoPublicUrl(data.storage_path);
      }),
      catchError(() => {
        // Return placeholder on error
        return from(Promise.resolve('assets/placeholder-image.jpg'));
      })
    );
  }

  setAsPrimaryPhoto(photoId: string, playerId: string): Observable<void> {
    // First, set all photos for this player to is_primary = false
    return from(
      this.supabaseService.client
        .from('player_photos')
        .update({ is_primary: false })
        .eq('player_id', playerId)
    ).pipe(
      switchMap(({ error }) => {
        if (error) {
          throw error;
        }

        // Then set the selected photo to is_primary = true
        return from(
          this.supabaseService.client
            .from('player_photos')
            .update({ is_primary: true })
            .eq('id', photoId)
        );
      }),
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }

  deletePhoto(photoId: string): Observable<void> {
    return from(
      this.supabaseService.client
        .from('player_photos')
        .select('storage_path')
        .eq('id', photoId)
        .single()
    ).pipe(
      switchMap(({ data, error }) => {
        if (error) {
          throw error;
        }

        // Delete from storage first
        return from(
          this.supabaseService.client.storage
            .from('player-photos')
            .remove([data?.storage_path])
        );
      }),
      switchMap(({ error }) => {
        if (error) {
          throw error;
        }

        // Then delete the record
        return from(
          this.supabaseService.client
            .from('player_photos')
            .delete()
            .eq('id', photoId)
        );
      }),
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }

  // Team player relationship methods
  addPlayerToTeam(playerId: string, teamId: string): Observable<void> {
    return from(
      this.supabaseService.client.from('team_players').insert([
        {
          player_id: playerId,
          team_id: teamId,
          is_active: true,
        },
      ])
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }

  removePlayerFromTeam(playerId: string, teamId: string): Observable<void> {
    return from(
      this.supabaseService.client
        .from('team_players')
        .delete()
        .eq('player_id', playerId)
        .eq('team_id', teamId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }

  getPlayerTeams(playerId: string): Observable<string[]> {
    return from(
      this.supabaseService.client
        .from('team_players')
        .select('team_id')
        .eq('player_id', playerId)
        .eq('is_active', true)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data.map((item) => item.team_id);
      })
    );
  }

  getPlayerTeamsWithDetails(playerId: string): Observable<any[]> {
    return from(
      this.supabaseService.client
        .from('team_players')
        .select(
          `
        id,
        team_id,
        teams:team_id (id, name, display_name)
      `
        )
        .eq('player_id', playerId)
        .eq('is_active', true)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data;
      })
    );
  }

  getPhotoPublicUrl(storagePath: string): string {
    if (!storagePath) return 'assets/placeholder-image.jpg';

    // Force the direct URL format that should work
    return `https://cdcykkvxscyliiosrnwq.supabase.co/storage/v1/object/public/player-photos/${storagePath}`;
  }
}
