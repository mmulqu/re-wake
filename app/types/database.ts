export interface UserMetadata {
  role?: 'admin' | 'user';
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  clerk_id: string;
  display_name: string;
  created_at: Date;
  last_login: Date;
  publicMetadata?: UserMetadata;
}

export interface MasterText {
  id: number;
  text: string;
  order_index: number;
  approvals: number | null;
  user_id: string;
  created_at: Date;
  contribution_id: number | null;
  author_name?: string;
  approved_by?: string;
  approved_at?: Date;
  approver_name?: string;
}

export interface Contribution {
  id: number;
  text: string;
  themes: any[];
  cultural_references: any[];
  historical_context: string | null;
  created_at: Date;
  is_approved: boolean;
  user_id: string;
  page_number: number;
  author_name?: string;
}

export interface EditHistory {
  id: string;
  contribution_id: string;
  user_id: string;
  previous_text: string;
  new_text: string;
  created_at: Date;
} 