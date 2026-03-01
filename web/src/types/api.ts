export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'super_admin';
  status: 'active' | 'suspended' | 'banned';
  avatar?: string;
  bio?: string;
  country_code?: string;
  created_at: string;
  last_seen_at?: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
    expires_at: string;
  };
  message: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
  timestamp: string;
  request_id: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
  links: {
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}

export interface Message {
  id: number;
  conversation_id: number;
  sender_id: number;
  content: string;
  type: 'text' | 'image' | 'video' | 'audio';
  created_at: string;
  read_at?: string;
}

export interface Conversation {
  id: number;
  participants: User[];
  last_message?: Message;
  unread_count: number;
  created_at: string;
}
