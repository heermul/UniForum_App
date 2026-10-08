export type UserRole = 'student' | 'coordinator' | 'faculty' | 'admin';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  profile_photo?: string;
  role: UserRole;
  college_id?: string;
  department?: string;
  year?: string;
  bio?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export type EventStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed';
export type EventCategory = 'hackathon' | 'workshop' | 'competition' | 'seminar' | 'cultural' | 'sports' | 'technical' | 'career';

export interface CollegeEvent {
  id: string;
  forum_id: string;
  forum_name?: string;
  forum_category?: string;
  title: string;
  description: string;
  banner_image?: string;
  event_type: EventCategory;
  location: string;
  start_datetime: string;
  end_datetime: string;
  registration_deadline: string;
  capacity: number;
  registered_count: number;
  status: EventStatus;
  created_by: string;
  creator_name?: string;
  approved_by?: string;
  tags: string[];
  rejection_reason?: string;
  is_registered?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Forum {
  id: string;
  name: string;
  description: string;
  logo?: string;
  cover_image?: string;
  category: string;
  coordinator_id: string;
  coordinator_name?: string;
  status: 'active' | 'archived';
  member_count: number;
  follower_count: number;
  is_member?: boolean;
  is_following?: boolean;
  created_at: string;
}

export interface ForumMember {
  id: string;
  forum_id: string;
  user_id: string;
  joined_at: string;
}

export interface EventRegistration {
  id: string;
  event_id: string;
  user_id: string;
  user_name?: string;
  user_email?: string;
  user_department?: string;
  registration_status: 'registered' | 'waitlisted' | 'attended' | 'cancelled';
  registered_at: string;
}

export type SentimentType = 'positive' | 'neutral' | 'negative';

export interface ForumPost {
  id: string;
  forum_id: string;
  forum_name?: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
  content: string;
  image_url?: string;
  likes_count: number;
  comments_count: number;
  has_liked?: boolean;
  sentiment?: SentimentType;
  sentiment_score?: number;
  created_at: string;
  updated_at: string;
}

export interface PostComment {
  id: string;
  post_id: string;
  author_id: string;
  author_name: string;
  author_role: UserRole;
  author_avatar?: string;
  content: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'registration' | 'approval' | 'rejection' | 'announcement' | 'reminder';
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface EventApproval {
  id: string;
  event_id: string;
  reviewer_id: string;
  reviewer_name?: string;
  status: 'approved' | 'rejected';
  remarks?: string;
  reviewed_at: string;
}

export interface ReportItem {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  target_type: 'post' | 'event' | 'user';
  target_id: string;
  target_summary?: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolved_by?: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  event_id: string;
  score: number;
  reason: string;
  event?: CollegeEvent;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

export interface AnalyticsStats {
  totalUsers: number;
  totalForums: number;
  totalEvents: number;
  pendingApprovals: number;
  totalRegistrations: number;
  totalReports: number;
  activeMembers: number;
  categoryDistribution: { category: string; count: number }[];
  userRoleDistribution: { role: string; count: number }[];
  registrationTrends: { month: string; count: number }[];
  topForums: { name: string; members: number; events: number }[];
}
