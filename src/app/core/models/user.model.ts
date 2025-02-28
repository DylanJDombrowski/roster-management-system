export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  role: 'admin' | 'coach';
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}
