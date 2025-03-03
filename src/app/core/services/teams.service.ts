// src/app/core/services/teams.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, from, map, switchMap, tap } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Team } from '../models/team.model';

@Injectable({
  providedIn: 'root',
})
export class TeamsService {
  private teamsSubject = new BehaviorSubject<Team[]>([]);
  teams$ = this.teamsSubject.asObservable();

  constructor(private supabaseService: SupabaseService) {}

  /**
   * Fetch all teams and update the teams subject
   */
  fetchTeams(): Observable<Team[]> {
    return from(
      this.supabaseService.client
        .from('teams')
        .select('*')
        .order('name', { ascending: true })
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as Team[];
      }),
      tap((teams) => this.teamsSubject.next(teams))
    );
  }

  /**
   * Get a single team by ID
   * @param teamId The team ID to fetch
   */
  getTeam(teamId: string): Observable<Team> {
    return from(
      this.supabaseService.client
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as Team;
      })
    );
  }

  /**
   * Create a new team
   * @param team The team data to create
   */
  createTeam(
    team: Omit<Team, 'id' | 'created_at' | 'updated_at'>
  ): Observable<Team> {
    return from(
      this.supabaseService.client.from('teams').insert([team]).select().single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as Team;
      }),
      tap((newTeam) => {
        const currentTeams = this.teamsSubject.value;
        this.teamsSubject.next([...currentTeams, newTeam]);
      })
    );
  }

  /**
   * Update an existing team
   * @param id The team ID to update
   * @param updates The team fields to update
   */
  updateTeam(id: string, updates: Partial<Team>): Observable<Team> {
    return from(
      this.supabaseService.client
        .from('teams')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as Team;
      }),
      tap((updatedTeam) => {
        const currentTeams = this.teamsSubject.value;
        const index = currentTeams.findIndex((t) => t.id === id);
        if (index !== -1) {
          const updatedTeams = [...currentTeams];
          updatedTeams[index] = updatedTeam;
          this.teamsSubject.next(updatedTeams);
        }
      })
    );
  }

  /**
   * Delete a team
   * @param id The team ID to delete
   */
  deleteTeam(id: string): Observable<void> {
    return from(
      this.supabaseService.client.from('teams').delete().eq('id', id)
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
      tap(() => {
        const currentTeams = this.teamsSubject.value;
        this.teamsSubject.next(currentTeams.filter((t) => t.id !== id));
      })
    );
  }

  /**
   * Get all players for a team
   * @param teamId The team ID to get players for
   */
  getTeamPlayers(teamId: string): Observable<any[]> {
    return from(
      this.supabaseService.client
        .from('team_players')
        .select(
          `
          id,
          team_id,
          player_id,
          is_active,
          players (*)
        `
        )
        .eq('team_id', teamId)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data;
      })
    );
  }

  /**
   * Add a player to a team
   * @param teamId The team ID
   * @param playerId The player ID
   */
  addPlayerToTeam(teamId: string, playerId: string): Observable<void> {
    return from(
      this.supabaseService.client.from('team_players').insert([
        {
          team_id: teamId,
          player_id: playerId,
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

  /**
   * Remove a player from a team
   * @param teamId The team ID
   * @param playerId The player ID
   */
  removePlayerFromTeam(teamId: string, playerId: string): Observable<void> {
    return from(
      this.supabaseService.client
        .from('team_players')
        .delete()
        .eq('team_id', teamId)
        .eq('player_id', playerId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }

  /**
   * Get coaches assigned to a team
   * @param teamId The team ID
   */
  getTeamCoaches(teamId: string): Observable<any[]> {
    return from(
      this.supabaseService.client
        .from('team_coaches')
        .select(
          `
          id,
          team_id,
          profile_id,
          is_head_coach,
          profiles (*)
        `
        )
        .eq('team_id', teamId)
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data;
      })
    );
  }

  /**
   * Assign a coach to a team
   * @param teamId The team ID
   * @param profileId The coach's profile ID
   * @param isHeadCoach Whether this is the head coach
   */
  assignCoachToTeam(
    teamId: string,
    profileId: string,
    isHeadCoach: boolean = false
  ): Observable<void> {
    return from(
      this.supabaseService.client.from('team_coaches').insert([
        {
          team_id: teamId,
          profile_id: profileId,
          is_head_coach: isHeadCoach,
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

  /**
   * Remove a coach from a team
   * @param teamId The team ID
   * @param profileId The coach's profile ID
   */
  removeCoachFromTeam(teamId: string, profileId: string): Observable<void> {
    return from(
      this.supabaseService.client
        .from('team_coaches')
        .delete()
        .eq('team_id', teamId)
        .eq('profile_id', profileId)
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      })
    );
  }
}
