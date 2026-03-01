// Type definitions for BaniTalk Admin Dashboard

export type UserRole = 'user' | 'admin' | 'super_admin';
export type UserStatus = 'active' | 'suspended' | 'banned';
export type ReportStatus = 'pending' | 'resolved' | 'dismissed';
export type ReportType = 'user' | 'post' | 'comment' | 'message' | 'room';

export interface User {
  id: number;
  uuid: string;
  username: string;
  email: string;
  name: string;
  role: UserRole;
  status: UserStatus;
  email_verified_at: string | null;
  last_seen_at: string | null;
  created_at: string;
  profile?: Profile;
}

export interface Profile {
  id: number;
  user_id: number;
  bio: string | null;
  avatar_url: string | null;
  country_code: string | null;
  date_of_birth: string | null;
  gender: string | null;
  followers_count: number;
  following_count: number;
}

export interface Report {
  id: number;
  reporter_id: number;
  reported_user_id: number | null;
  reportable_type: ReportType;
  reportable_id: number;
  reason: string;
  details: string | null;
  status: ReportStatus;
  resolved_by: number | null;
  resolved_at: string | null;
  resolution_notes: string | null;
  created_at: string;
}

export interface Call {
  id: number;
  caller_id: number;
  callee_id: number;
  type: 'audio' | 'video';
  status: 'initiated' | 'ringing' | 'answered' | 'ended' | 'declined' | 'missed';
  started_at: string | null;
  ended_at: string | null;
  duration: number | null;
}

export interface VoiceRoom {
  id: number;
  host_id: number;
  title: string;
  description: string | null;
  is_public: boolean;
  max_participants: number;
  status: 'active' | 'closed';
  created_at: string;
  closed_at: string | null;
}

export interface Gift {
  id: number;
  name: string;
  description: string | null;
  image_url: string;
  coin_cost: number;
  category_id: number;
  is_active: boolean;
}

export interface GiftTransaction {
  id: number;
  sender_id: number;
  receiver_id: number;
  gift_id: number;
  coin_amount: number;
  context_type: string | null;
  context_id: number | null;
  created_at: string;
}

export interface AnalyticsOverview {
  total_users: number;
  active_users_today: number;
  total_calls: number;
  total_rooms: number;
  total_posts: number;
  total_revenue: number;
  pending_reports: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}
