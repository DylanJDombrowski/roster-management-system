// src/app/core/models/team.model.ts
export interface Team {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_active: boolean;
  season_year?: number;
  age_group?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TeamCoach {
  id: string;
  team_id: string;
  profile_id: string;
  is_head_coach: boolean;
  created_at?: string;
  updated_at?: string;
  profile?: {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
  };
}

export interface TeamPlayer {
  id: string;
  team_id: string;
  player_id: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  player?: any;
}
