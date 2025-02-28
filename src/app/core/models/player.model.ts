export interface Player {
  id: string;
  first_name: string;
  last_name: string;
  jersey_number?: number;
  primary_position?: string;
  secondary_positions?: string[];
  height?: string;
  bats?: string;
  throws?: string;
  hometown?: string;
  high_school?: string;
  gpa?: string;
  bio?: string;
  email?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'injured';
  created_at?: string;
  updated_at?: string;
}

export interface PlayerPhoto {
  id: string;
  player_id: string;
  storage_path: string;
  is_primary: boolean;
  uploaded_by: string;
  created_at?: string;
  updated_at?: string;
}
