export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  clerk_id: string;
  display_name: string;
  created_at: Date;
  last_login: Date;
}

export interface MasterText {
  id: string;
  text: string;
  order_index: number;
  user_id: string;
  contribution_id: string;
  created_at: Date;
  approvals: number;
}

export interface Contribution {
  id: string;
  text: string;
  user_id: string;
  themes: string[];
  cultural_references: string[];
  historical_context: string;
  is_approved: boolean;
  created_at: Date;
}

export interface EditHistory {
  id: string;
  contribution_id: string;
  user_id: string;
  previous_text: string;
  new_text: string;
  created_at: Date;
} 