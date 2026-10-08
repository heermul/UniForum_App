import express from 'express';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rywfnyxtcfrodnftpjhc.supabase.co/rest/v1/';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_mLctBEfTSickEMCn7CxJgg_PraWjchj';
const supabase = createClient(supabaseUrl, supabaseKey);

dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// ==========================================
// IN-MEMORY RELATIONAL DATABASE STORE
// ==========================================
export interface DbUser {
  id: string;
  full_name: string;
  email: string;
  profile_photo: string;
  role: 'student' | 'coordinator' | 'faculty' | 'admin';
  college_id: string;
  department: string;
  year: string;
  bio: string;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface DbForum {
  id: string;
  name: string;
  description: string;
  logo: string;
  cover_image: string;
  category: string;
  coordinator_id: string;
  status: 'active' | 'archived';
  created_at: string;
}

export interface DbEvent {
  id: string;
  forum_id: string;
  title: string;
  description: string;
  banner_image: string;
  event_type: 'hackathon' | 'workshop' | 'competition' | 'seminar' | 'cultural' | 'sports' | 'technical' | 'career';
  location: string;
  start_datetime: string;
  end_datetime: string;
  registration_deadline: string;
  capacity: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'completed';
  created_by: string;
  approved_by?: string;
  tags: string[];
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface DbRegistration {
  id: string;
  event_id: string;
  user_id: string;
  registration_status: 'registered' | 'waitlisted' | 'attended' | 'cancelled';
  registered_at: string;
}

export interface DbPost {
  id: string;
  forum_id: string;
  author_id: string;
  content: string;
  image_url?: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  sentiment_score: number;
  created_at: string;
  updated_at: string;
}

export interface DbComment {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
}

export interface DbLike {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface DbNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'registration' | 'approval' | 'rejection' | 'announcement' | 'reminder';
  reference_id?: string;
  is_read: boolean;
  created_at: string;
}

export interface DbMember {
  id: string;
  forum_id: string;
  user_id: string;
  joined_at: string;
}

export interface DbFollower {
  id: string;
  forum_id: string;
  user_id: string;
  created_at: string;
}

export interface DbReport {
  id: string;
  reporter_id: string;
  target_type: 'post' | 'event' | 'user';
  target_id: string;
  reason: string;
  status: 'pending' | 'resolved' | 'dismissed';
  resolved_by?: string;
  created_at: string;
}

export interface DbAuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  created_at: string;
}

// Initial Realistic Seed Data
const users: DbUser[] = [
  {
    id: 'u-student-1',
    full_name: 'Heer Mulchandani',
    email: 'heermulchandani2005@gmail.com',
    profile_photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    role: 'student',
    college_id: 'CS2023-042',
    department: 'Computer Science',
    year: '3rd Year',
    bio: 'Passionate about Web3, AI models, competitive coding and campus hackathons.',
    status: 'active',
    created_at: '2026-01-10T10:00:00Z',
  },
  {
    id: 'u-coord-1',
    full_name: 'Arjun Sharma',
    email: 'arjun.sharma@college.edu',
    profile_photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    role: 'coordinator',
    college_id: 'CORD-CS-01',
    department: 'Computer Science',
    year: '4th Year',
    bio: 'Lead Coordinator for Coding Club & Robotics Society. Organizing HackSprint 2027.',
    status: 'active',
    created_at: '2025-11-05T14:30:00Z',
  },
  {
    id: 'u-faculty-1',
    full_name: 'Dr. Rajesh Mehta',
    email: 'dean.events@college.edu',
    profile_photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    role: 'faculty',
    college_id: 'FAC-ENG-89',
    department: 'Dean of Student Affairs',
    year: 'Faculty',
    bio: 'Oversees campus event compliance, forum safety, scheduling and auditorium venue allocations.',
    status: 'active',
    created_at: '2024-08-01T09:00:00Z',
  },
  {
    id: 'u-admin-1',
    full_name: 'Sarah Jenkins',
    email: 'admin@uniforum.edu',
    profile_photo: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
    role: 'admin',
    college_id: 'ADM-SYS-001',
    department: 'Campus Administration',
    year: 'Staff',
    bio: 'System Administrator for UniForum collegiate platform.',
    status: 'active',
    created_at: '2024-01-01T08:00:00Z',
  },
];

const forums: DbForum[] = [
  {
    id: 'f-coding',
    name: 'Coding Club',
    description: 'The epicenter for algorithmic problem solvers, open-source contributors, and hackathon contenders.',
    logo: 'code',
    cover_image: '',
    category: 'Technical',
    coordinator_id: 'u-coord-1',
    status: 'active',
    created_at: '2025-01-15T10:00:00Z',
  },
  {
    id: 'f-robotics',
    name: 'Robotics Club',
    description: 'Designing autonomous rovers, combat bots, and IoT hardware solutions.',
    logo: 'bot',
    cover_image: '',
    category: 'Engineering',
    coordinator_id: 'u-coord-1',
    status: 'active',
    created_at: '2025-01-20T11:00:00Z',
  },
  {
    id: 'f-cultural',
    name: 'Cultural Forum',
    description: 'Celebrating performing arts, campus musicals, drama, dance, and annual inter-collegiate festivals.',
    logo: 'sparkles',
    cover_image: '',
    category: 'Cultural',
    coordinator_id: 'u-coord-1',
    status: 'active',
    created_at: '2025-02-01T09:00:00Z',
  },
  {
    id: 'f-cyber',
    name: 'Cyber Security Club',
    description: 'CTF challenges, ethical hacking drills, network defense workshops, and crypto security.',
    logo: 'shield',
    cover_image: '',
    category: 'Technical',
    coordinator_id: 'u-coord-1',
    status: 'active',
    created_at: '2025-02-10T14:00:00Z',
  },
  {
    id: 'f-aiml',
    name: 'AI/ML Club',
    description: 'Deep dive into LLMs, neural networks, computer vision, and machine learning research.',
    logo: 'cpu',
    cover_image: '',
    category: 'Technical',
    coordinator_id: 'u-coord-1',
    status: 'active',
    created_at: '2025-02-15T16:00:00Z',
  },
  {
    id: 'f-sports',
    name: 'Sports Committee',
    description: 'Inter-branch tournaments, athletics meets, football, basketball, and fitness challenges.',
    logo: 'trophy',
    cover_image: '',
    category: 'Sports',
    coordinator_id: 'u-coord-1',
    status: 'active',
    created_at: '2025-03-01T12:00:00Z',
  },
  {
    id: 'f-ecell',
    name: 'Entrepreneurship Cell',
    description: 'Empowering student startups with venture pitch sessions, angel investor mixers, and incubators.',
    logo: 'rocket',
    cover_image: '',
    category: 'Career',
    coordinator_id: 'u-coord-1',
    status: 'active',
    created_at: '2025-03-10T10:00:00Z',
  },
];

const events: DbEvent[] = [
  {
    id: 'e-1',
    forum_id: 'f-coding',
    title: 'HackSprint 2027',
    description: 'A 36-hour flagship hackathon where 100+ student teams build cutting-edge solutions in AI, ClimateTech, and FinTech. Mentorship from top engineers, food and prizes worth $5,000.',
    banner_image: '',
    event_type: 'hackathon',
    location: 'Main Auditorium & Innovation Lab',
    start_datetime: '2027-03-12T09:00:00Z',
    end_datetime: '2027-03-13T21:00:00Z',
    registration_deadline: '2027-03-10T23:59:00Z',
    capacity: 250,
    status: 'approved',
    created_by: 'u-coord-1',
    approved_by: 'u-faculty-1',
    tags: ['Hackathon', 'AI', 'Coding', 'FinTech', 'Prizes'],
    created_at: '2026-09-01T10:00:00Z',
    updated_at: '2026-09-05T12:00:00Z',
  },
  {
    id: 'e-2',
    forum_id: 'f-robotics',
    title: 'Robotics Challenge: Rover Arena',
    description: 'Design and pilot autonomous rovers across obstacle courses featuring terrain mapping, line following, and payload retrieval.',
    banner_image: '',
    event_type: 'competition',
    location: 'Mechanical Engineering Atrium',
    start_datetime: '2026-10-24T10:00:00Z',
    end_datetime: '2026-10-24T18:00:00Z',
    registration_deadline: '2026-10-22T18:00:00Z',
    capacity: 80,
    status: 'approved',
    created_by: 'u-coord-1',
    approved_by: 'u-faculty-1',
    tags: ['Robotics', 'Hardware', 'Competition', 'IoT'],
    created_at: '2026-09-10T10:00:00Z',
    updated_at: '2026-09-12T11:00:00Z',
  },
  {
    id: 'e-3',
    forum_id: 'f-cultural',
    title: 'Aura 2026: Annual Cultural Fest',
    description: 'The college largest festival of music, theater, fashion walk, and celebrity night. Featuring battle of the bands and international guest artists.',
    banner_image: '',
    event_type: 'cultural',
    location: 'Open Air Amphitheatre',
    start_datetime: '2026-11-14T17:00:00Z',
    end_datetime: '2026-11-16T23:00:00Z',
    registration_deadline: '2026-11-10T20:00:00Z',
    capacity: 1200,
    status: 'approved',
    created_by: 'u-coord-1',
    approved_by: 'u-faculty-1',
    tags: ['Cultural', 'Music', 'Festival', 'Drama'],
    created_at: '2026-09-15T09:00:00Z',
    updated_at: '2026-09-16T15:00:00Z',
  },
  {
    id: 'e-4',
    forum_id: 'f-aiml',
    title: 'Generative AI & Multimodal Models Workshop',
    description: 'Hands-on bootcamp exploring transformer architectures, prompt engineering, embedding indexing, and deploying full-stack AI agents.',
    banner_image: '',
    event_type: 'workshop',
    location: 'Computing Center Lab 4',
    start_datetime: '2026-10-18T14:00:00Z',
    end_datetime: '2026-10-18T17:30:00Z',
    registration_deadline: '2026-10-17T12:00:00Z',
    capacity: 60,
    status: 'approved',
    created_by: 'u-coord-1',
    approved_by: 'u-faculty-1',
    tags: ['AI', 'Workshop', 'Python', 'HandsOn'],
    created_at: '2026-09-20T10:00:00Z',
    updated_at: '2026-09-21T09:00:00Z',
  },
  {
    id: 'e-5',
    forum_id: 'f-sports',
    title: 'Inter-Department Football Tournament',
    description: 'Annual 7-a-side knock-out cup between Engineering branches. Trophy, medals, and best player awards.',
    banner_image: '',
    event_type: 'sports',
    location: 'University Sports Ground',
    start_datetime: '2026-10-28T08:00:00Z',
    end_datetime: '2026-10-30T19:00:00Z',
    registration_deadline: '2026-10-25T18:00:00Z',
    capacity: 150,
    status: 'pending_approval',
    created_by: 'u-coord-1',
    tags: ['Sports', 'Football', 'Tournament', 'Fitness'],
    created_at: '2026-10-01T11:00:00Z',
    updated_at: '2026-10-01T11:00:00Z',
  },
  {
    id: 'e-6',
    forum_id: 'f-cyber',
    title: 'Campus CTF: Cyber Siege',
    description: 'A 12-hour capture-the-flag tournament with jeopardy-style challenges in reverse engineering, binary exploitation, web vulnerabilities, and forensics.',
    banner_image: '',
    event_type: 'competition',
    location: 'Cybersecurity Lab (Room 302)',
    start_datetime: '2026-11-05T09:00:00Z',
    end_datetime: '2026-11-05T21:00:00Z',
    registration_deadline: '2026-11-03T18:00:00Z',
    capacity: 75,
    status: 'pending_approval',
    created_by: 'u-coord-1',
    tags: ['Cybersecurity', 'CTF', 'Competition', 'EthicalHacking'],
    created_at: '2026-10-02T14:00:00Z',
    updated_at: '2026-10-02T14:00:00Z',
  },
];

const registrations: DbRegistration[] = [
  {
    id: 'reg-1',
    event_id: 'e-1',
    user_id: 'u-student-1',
    registration_status: 'registered',
    registered_at: '2026-09-12T14:00:00Z',
  },
  {
    id: 'reg-2',
    event_id: 'e-4',
    user_id: 'u-student-1',
    registration_status: 'registered',
    registered_at: '2026-09-22T09:30:00Z',
  },
];

const joinedForumIds = new Set<string>();

const registeredEventIds = new Set<string>();

const forumMembers: DbMember[] = [
  { id: 'm-1', forum_id: 'f-coding', user_id: 'u-student-1', joined_at: '2026-02-01T10:00:00Z' },
  { id: 'm-2', forum_id: 'f-aiml', user_id: 'u-student-1', joined_at: '2026-02-15T12:00:00Z' },
  { id: 'm-3', forum_id: 'f-coding', user_id: 'u-coord-1', joined_at: '2025-01-15T10:00:00Z' },
];

const forumFollowers: DbFollower[] = [
  { id: 'fol-1', forum_id: 'f-coding', user_id: 'u-student-1', created_at: '2026-02-01T10:00:00Z' },
  { id: 'fol-2', forum_id: 'f-robotics', user_id: 'u-student-1', created_at: '2026-03-01T11:00:00Z' },
  { id: 'fol-3', forum_id: 'f-cultural', user_id: 'u-student-1', created_at: '2026-03-15T15:00:00Z' },
];

const posts: DbPost[] = [
  {
    id: 'p-1',
    forum_id: 'f-coding',
    author_id: 'u-coord-1',
    content: 'HackSprint 2027 problem statements have just been finalized with industry partners! Track 1 is autonomous AI agents, Track 2 is decentralized identity, Track 3 is green energy tech. Get your teams ready!',
    sentiment: 'positive',
    sentiment_score: 0.95,
    created_at: '2026-09-28T14:20:00Z',
    updated_at: '2026-09-28T14:20:00Z',
  },
  {
    id: 'p-2',
    forum_id: 'f-aiml',
    author_id: 'u-student-1',
    content: 'Looking for 1 frontend developer to join our team for the upcoming AI/ML hackathon challenge. We have trained a lightweight multimodal medical assistant model. DM if interested!',
    sentiment: 'positive',
    sentiment_score: 0.88,
    created_at: '2026-10-03T11:15:00Z',
    updated_at: '2026-10-03T11:15:00Z',
  },
  {
    id: 'p-3',
    forum_id: 'f-robotics',
    author_id: 'u-coord-1',
    content: 'Rover Arena lab hours are extended to 10 PM this entire week so participants can test their lidar obstacle mapping algorithms before the competition on Oct 24.',
    sentiment: 'positive',
    sentiment_score: 0.9,
    created_at: '2026-10-04T16:00:00Z',
    updated_at: '2026-10-04T16:00:00Z',
  },
];

const comments: DbComment[] = [
  {
    id: 'c-1',
    post_id: 'p-1',
    author_id: 'u-student-1',
    content: 'Are cross-department teams allowed for Track 1?',
    created_at: '2026-09-28T15:00:00Z',
  },
  {
    id: 'c-2',
    post_id: 'p-1',
    author_id: 'u-coord-1',
    content: 'Yes! Cross-department and inter-year teams are highly encouraged.',
    created_at: '2026-09-28T15:30:00Z',
  },
];

const likes: DbLike[] = [
  { id: 'l-1', post_id: 'p-1', user_id: 'u-student-1', created_at: '2026-09-28T14:25:00Z' },
  { id: 'l-2', post_id: 'p-2', user_id: 'u-coord-1', created_at: '2026-10-03T12:00:00Z' },
];

const notifications: DbNotification[] = [
  {
    id: 'n-1',
    user_id: 'u-student-1',
    title: 'Registration Confirmed',
    message: 'You have successfully registered for HackSprint 2027. Save your confirmation badge.',
    type: 'registration',
    reference_id: 'e-1',
    is_read: false,
    created_at: '2026-09-12T14:00:00Z',
  },
  {
    id: 'n-2',
    user_id: 'u-student-1',
    title: 'New Announcement in Coding Club',
    message: 'Arjun Sharma posted: HackSprint 2027 problem statements finalized!',
    type: 'announcement',
    reference_id: 'p-1',
    is_read: true,
    created_at: '2026-09-28T14:21:00Z',
  },
  {
    id: 'n-3',
    user_id: 'u-faculty-1',
    title: 'Approval Required: Inter-Department Football',
    message: 'A new event submitted by Sports Committee awaits your review.',
    type: 'approval',
    reference_id: 'e-5',
    is_read: false,
    created_at: '2026-10-01T11:05:00Z',
  },
  {
    id: 'n-4',
    user_id: 'u-faculty-1',
    title: 'Approval Required: Campus CTF',
    message: 'Cyber Security Club has submitted Campus CTF: Cyber Siege for approval.',
    type: 'approval',
    reference_id: 'e-6',
    is_read: false,
    created_at: '2026-10-02T14:05:00Z',
  },
];

const reports: DbReport[] = [
  {
    id: 'rep-1',
    reporter_id: 'u-student-1',
    target_type: 'post',
    target_id: 'p-1',
    reason: 'Duplicate announcement notice',
    status: 'pending',
    created_at: '2026-09-29T10:00:00Z',
  },
];

const auditLogs: DbAuditLog[] = [
  {
    id: 'log-1',
    user_id: 'u-faculty-1',
    action: 'APPROVED_EVENT',
    entity_type: 'event',
    entity_id: 'e-1',
    created_at: '2026-09-05T12:00:00Z',
  },
  {
    id: 'log-2',
    user_id: 'u-student-1',
    action: 'EVENT_REGISTRATION',
    entity_type: 'registration',
    entity_id: 'reg-1',
    created_at: '2026-09-12T14:00:00Z',
  },
];

// Helper to log audit events
function logAudit(userId: string, action: string, entityType: string, entityId: string) {
  auditLogs.unshift({
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    created_at: new Date().toISOString(),
  });
}

// Current active session (default is Heer - student)
let currentSessionUserId = 'u-student-1';

// Helper to populate event fields
function populateEvent(e: DbEvent, currentUserId?: string) {
  const forum = forums.find(f => f.id === e.forum_id);
  const creator = users.find(u => u.id === e.created_by);
  const regCount = registrations.filter(r => r.event_id === e.id && r.registration_status === 'registered').length;
  const isRegistered = currentUserId ? registrations.some(r => r.event_id === e.id && r.user_id === currentUserId && r.registration_status === 'registered') : false;

  return {
    ...e,
    forum_name: forum?.name || 'College Forum',
    forum_category: forum?.category || 'General',
    creator_name: creator?.full_name || 'Coordinator',
    registered_count: regCount,
    is_registered: isRegistered,
  };
}

// Helper to populate forum fields
function populateForum(f: DbForum, currentUserId?: string) {
  const coordinator = users.find(u => u.id === f.coordinator_id);
  const memberCount = forumMembers.filter(m => m.forum_id === f.id).length;
  const followerCount = forumFollowers.filter(m => m.forum_id === f.id).length;
  const isMember = currentUserId ? forumMembers.some(m => m.forum_id === f.id && m.user_id === currentUserId) : false;
  const isFollowing = currentUserId ? forumFollowers.some(m => m.forum_id === f.id && m.user_id === currentUserId) : false;

  return {
    ...f,
    coordinator_name: coordinator?.full_name || 'Assigned Coordinator',
    member_count: memberCount,
    follower_count: followerCount,
    is_member: isMember,
    is_following: isFollowing,
  };
}

// Helper to populate post fields
function populatePost(p: DbPost, currentUserId?: string) {
  const author = users.find(u => u.id === p.author_id);
  const forum = forums.find(f => f.id === p.forum_id);
  const likesCount = likes.filter(l => l.post_id === p.id).length;
  const commentsCount = comments.filter(c => c.post_id === p.id).length;
  const hasLiked = currentUserId ? likes.some(l => l.post_id === p.id && l.user_id === currentUserId) : false;

  return {
    ...p,
    author_name: author?.full_name || 'Member',
    author_role: author?.role || 'student',
    author_avatar: author?.profile_photo,
    forum_name: forum?.name || 'Forum',
    likes_count: likesCount,
    comments_count: commentsCount,
    has_liked: hasLiked,
  };
}

// ==========================================
// REST API ROUTES
// ==========================================

// 1. AUTH & USER PROFILE
app.get('/api/auth/me', (req, res) => {
  const user = users.find(u => u.id === currentSessionUserId) || users[0];
  res.json({ user });
});

app.post('/api/auth/switch-role', (req, res) => {
  const { role, userId } = req.body;
  let targetUser = users.find(u => u.id === userId);
  if (!targetUser && role) {
    targetUser = users.find(u => u.role === role);
  }
  if (targetUser) {
    currentSessionUserId = targetUser.id;
    return res.json({ success: true, user: targetUser });
  }
  res.status(404).json({ error: 'User not found' });
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (user) {
    currentSessionUserId = user.id;
    return res.json({ success: true, user });
  }
  // Allow login with created email
  const newUser: DbUser = {
    id: `u-${Date.now()}`,
    full_name: email.split('@')[0].replace('.', ' '),
    email,
    profile_photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    role: 'student',
    college_id: `CS-${Date.now().toString().slice(-4)}`,
    department: 'Computer Science',
    year: '1st Year',
    bio: 'UniForum student member',
    status: 'active',
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  currentSessionUserId = newUser.id;
  res.json({ success: true, user: newUser });
});

app.post('/api/auth/signup', (req, res) => {
  const { full_name, email, department, year, role = 'student' } = req.body;
  if (!email || !full_name) return res.status(400).json({ error: 'Name and email are required' });
  
  // Enforce server-side role check: public signups cannot be admin
  const safeRole = role === 'admin' ? 'student' : role;
  
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    currentSessionUserId = existing.id;
    return res.json({ success: true, user: existing });
  }

  const newUser: DbUser = {
    id: `u-${Date.now()}`,
    full_name,
    email,
    profile_photo: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
    role: safeRole,
    college_id: `COL-${Date.now().toString().slice(-4)}`,
    department: department || 'General Engineering',
    year: year || '1st Year',
    bio: 'College student on UniForum',
    status: 'active',
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  currentSessionUserId = newUser.id;
  logAudit(newUser.id, 'USER_SIGNUP', 'user', newUser.id);
  res.json({ success: true, user: newUser });
});

app.put('/api/users/profile', (req, res) => {
  const user = users.find(u => u.id === currentSessionUserId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  const { full_name, bio, department, year, profile_photo } = req.body;
  if (full_name) user.full_name = full_name;
  if (bio !== undefined) user.bio = bio;
  if (department) user.department = department;
  if (year) user.year = year;
  if (profile_photo) user.profile_photo = profile_photo;
  res.json({ success: true, user });
});

// 2. FORUMS
app.get('/api/forums', async (req, res) => {
  try {
    const { data: dbForums, error } = await supabase
      .from('forums')
      .select('*');

    if (error) throw error;

    const formatted = (dbForums || []).map((f: any) => ({
      ...f,
      is_member: joinedForumIds.has(f.id),
      is_following: joinedForumIds.has(f.id),
      member_count: (f.member_count || 35) + (joinedForumIds.has(f.id) ? 1 : 0)
    }));

    res.json({ forums: formatted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/forums/:id', async (req, res) => {
  try {
    const { data: dbForum, error } = await supabase
      .from('forums')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) throw error;
    if (!dbForum) return res.status(404).json({ error: 'Forum not found' });
    res.json({ forum: populateForum(dbForum, currentSessionUserId) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/forums/:id/join', (req, res) => {
  const forumId = req.params.id;

  if (joinedForumIds.has(forumId)) {
    joinedForumIds.delete(forumId);
    return res.json({
      success: true,
      is_member: false,
      action: 'left'
    });
  } else {
    joinedForumIds.add(forumId);
    return res.json({
      success: true,
      is_member: true,
      action: 'joined'
    });
  }
});

app.post('/api/forums/:id/follow', (req, res) => {
  const forumId = req.params.id;
  joinedForumIds.add(forumId);
  res.json({
    success: true,
    is_following: true,
    action: 'followed'
  });
});

app.post('/api/forums', (req, res) => {
  const user = users.find(u => u.id === currentSessionUserId);
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can create forums' });
  }
  const { name, description, category, coordinator_id, logo } = req.body;
  if (!name || !description) return res.status(400).json({ error: 'Name and description required' });
  
  const newForum: DbForum = {
    id: `f-${Date.now()}`,
    name,
    description,
    logo: logo || 'users',
    cover_image: '',
    category: category || 'General',
    coordinator_id: coordinator_id || currentSessionUserId,
    status: 'active',
    created_at: new Date().toISOString(),
  };
  forums.push(newForum);
  logAudit(currentSessionUserId, 'CREATE_FORUM', 'forum', newForum.id);
  res.json({ success: true, forum: populateForum(newForum, currentSessionUserId) });
});

// 3. EVENTS
app.get('/api/events', async (req, res) => {
  try {
    const filter = (req.query.filter as string) || 'upcoming';
    const category = req.query.category as string;
    const search = req.query.search as string;

    const { data: dbEvents, error } = await supabase
      .from('events')
      .select('*, forums(name, category)');

    if (error) throw error;

    const now = new Date();

    let formatted = (dbEvents || []).map((ev: any) => {
      const realForumName = ev.forums?.name || 'Campus Forum';
      const isReg = registeredEventIds.has(ev.id);

      return {
        ...ev,
        forum_name: realForumName,
        organizer: realForumName,
        forum: {
          name: realForumName,
          category: ev.forums?.category || 'General'
        },
        registered_count: (ev.registered_count || 12) + (isReg ? 1 : 0),
        is_registered: isReg
      };
    });

    // 1. Tab wise filtering (Upcoming vs Registered vs Past)
    if (filter === 'registered') {
      formatted = formatted.filter((ev: any) => ev.is_registered === true);
    } else if (filter === 'past') {
      formatted = formatted.filter((ev: any) => new Date(ev.start_datetime) < now);
    } else {
      // Upcoming events (future dates)
      formatted = formatted.filter((ev: any) => new Date(ev.start_datetime) >= now);
    }

    // 2. Category filter
    if (category && category !== 'all') {
      formatted = formatted.filter((ev: any) => 
        (ev.event_type || '').toLowerCase() === category.toLowerCase()
      );
    }

    // 3. Search query filter
    if (search) {
      const q = search.toLowerCase();
      formatted = formatted.filter((ev: any) => 
        (ev.title || '').toLowerCase().includes(q) || 
        (ev.location || '').toLowerCase().includes(q)
      );
    }

    res.json({ events: formatted });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/events/:id', (req, res) => {
  const e = events.find(item => item.id === req.params.id);
  if (!e) return res.status(404).json({ error: 'Event not found' });
  res.json({ event: populateEvent(e, currentSessionUserId) });
});

app.post('/api/events', (req, res) => {
  const currentUser = users.find(u => u.id === currentSessionUserId);
  if (!currentUser || (currentUser.role !== 'coordinator' && currentUser.role !== 'admin')) {
    return res.status(403).json({ error: 'Only coordinators and admins can create events' });
  }

  const {
    forum_id,
    title,
    description,
    event_type,
    location,
    start_datetime,
    end_datetime,
    registration_deadline,
    capacity,
    tags,
  } = req.body;

  if (!title || !description || !location || !start_datetime) {
    return res.status(400).json({ error: 'Missing required event fields' });
  }

  // Admin created events are approved immediately; coordinator events require approval
  const status = currentUser.role === 'admin' ? 'approved' : 'pending_approval';

  const newEvent: DbEvent = {
    id: `e-${Date.now()}`,
    forum_id: forum_id || forums[0].id,
    title,
    description,
    banner_image: '',
    event_type: event_type || 'technical',
    location,
    start_datetime,
    end_datetime: end_datetime || start_datetime,
    registration_deadline: registration_deadline || start_datetime,
    capacity: Number(capacity) || 100,
    status,
    created_by: currentSessionUserId,
    tags: Array.isArray(tags) ? tags : ['CollegeEvent'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  events.push(newEvent);
  logAudit(currentSessionUserId, 'CREATE_EVENT', 'event', newEvent.id);

  // Notify faculty reviewers if pending approval
  if (status === 'pending_approval') {
    const facultyUsers = users.filter(u => u.role === 'faculty');
    facultyUsers.forEach(f => {
      notifications.unshift({
        id: `notif-${Date.now()}-${f.id}`,
        user_id: f.id,
        title: `Event Approval Required: ${title}`,
        message: `${currentUser.full_name} has submitted "${title}" for review.`,
        type: 'approval',
        reference_id: newEvent.id,
        is_read: false,
        created_at: new Date().toISOString(),
      });
    });
  }

  res.json({ success: true, event: populateEvent(newEvent, currentSessionUserId) });
});

// Register for event
app.post('/api/events/:id/register', async (req, res) => {
  try {
    const { id } = req.params;

    // Agar already registered hai -> Cancel / Unregister karo
    if (registeredEventIds.has(id)) {
      registeredEventIds.delete(id);
      return res.json({
        success: true,
        is_registered: false,
        action: 'cancelled',
        message: 'Registration cancelled.'
      });
    }

    // Naya registration add karo
    registeredEventIds.add(id);
    const ticketCode = 'UNI-' + Math.floor(100000 + Math.random() * 900000);

    // Supabase DB mein save
    try {
      await supabase.from('registrations').insert([
        {
          event_id: id,
          user_name: req.body?.studentName || 'Student Demo User',
          prn_roll: req.body?.prnRoll || '23CS101',
          ticket_code: ticketCode,
          status: 'confirmed'
        }
      ]);
    } catch (e) {
      console.log('DB insert fallback:', e);
    }

    res.json({
      success: true,
      is_registered: true,
      action: 'registered',
      ticket_id: ticketCode,
      message: 'Registration confirmed!'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Event attendees
app.get('/api/events/:id/attendees', (req, res) => {
  const eventId = req.params.id;
  const regs = registrations.filter(r => r.event_id === eventId);
  const attendees = regs.map(r => {
    const user = users.find(u => u.id === r.user_id);
    return {
      ...r,
      user_name: user?.full_name || 'Unknown Student',
      user_email: user?.email || '',
      user_department: user?.department || 'Engineering',
      user_photo: user?.profile_photo,
    };
  });
  res.json({ attendees });
});

// 4. FACULTY APPROVALS
app.get('/api/faculty/pending-approvals', (req, res) => {
  const pending = events.filter(e => e.status === 'pending_approval').map(e => populateEvent(e, currentSessionUserId));
  res.json({ pending });
});

app.post('/api/faculty/review-event', (req, res) => {
  const currentUser = users.find(u => u.id === currentSessionUserId);
  if (!currentUser || (currentUser.role !== 'faculty' && currentUser.role !== 'admin')) {
    return res.status(403).json({ error: 'Only faculty and administrators can review events' });
  }

  const { event_id, action, remarks } = req.body;
  const event = events.find(e => e.id === event_id);
  if (!event) return res.status(404).json({ error: 'Event not found' });

  if (action === 'approve') {
    event.status = 'approved';
    event.approved_by = currentSessionUserId;
    event.updated_at = new Date().toISOString();

    // Notify coordinator
    notifications.unshift({
      id: `notif-appr-${Date.now()}`,
      user_id: event.created_by,
      title: 'Event Approved 🎉',
      message: `Your event "${event.title}" has been approved by ${currentUser.full_name} and is now live!`,
      type: 'approval',
      reference_id: event.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    logAudit(currentSessionUserId, 'APPROVE_EVENT', 'event', event.id);
  } else if (action === 'reject') {
    if (!remarks) {
      return res.status(400).json({ error: 'Rejection reason is required' });
    }
    event.status = 'rejected';
    event.rejection_reason = remarks;
    event.updated_at = new Date().toISOString();

    // Notify coordinator
    notifications.unshift({
      id: `notif-rej-${Date.now()}`,
      user_id: event.created_by,
      title: 'Event Revision Requested',
      message: `Your event "${event.title}" was rejected: ${remarks}`,
      type: 'rejection',
      reference_id: event.id,
      is_read: false,
      created_at: new Date().toISOString(),
    });

    logAudit(currentSessionUserId, 'REJECT_EVENT', 'event', event.id);
  } else {
    return res.status(400).json({ error: 'Invalid action. Must be approve or reject' });
  }

  res.json({ success: true, event: populateEvent(event, currentSessionUserId) });
});

// 5. FORUM POSTS & COMMENTS
app.get('/api/posts', (req, res) => {
  const { forum_id } = req.query;
  let result = posts.map(p => populatePost(p, currentSessionUserId));
  if (forum_id && forum_id !== 'all') {
    result = result.filter(p => p.forum_id === forum_id);
  }
  // Sort newest first
  result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  res.json({ posts: result });
});

app.post('/api/posts', async (req, res) => {
  const { forum_id, content, image_url } = req.body;
  if (!content) return res.status(400).json({ error: 'Content is required' });

  // Optional AI sentiment check
  let sentiment: 'positive' | 'neutral' | 'negative' = 'positive';
  let sentiment_score = 0.85;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze sentiment of this college forum post. Reply in single line JSON {"sentiment": "positive"|"neutral"|"negative", "score": 0.0-1.0}: "${content}"`,
      });
      const parsed = JSON.parse(response.text?.replace(/```json|```/g, '').trim() || '{}');
      if (parsed.sentiment) {
        sentiment = parsed.sentiment;
        sentiment_score = parsed.score || 0.8;
      }
    } catch {
      // Fallback
    }
  }

  const newPost: DbPost = {
    id: `p-${Date.now()}`,
    forum_id: forum_id || forums[0].id,
    author_id: currentSessionUserId,
    content,
    image_url,
    sentiment,
    sentiment_score,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  posts.unshift(newPost);
  logAudit(currentSessionUserId, 'CREATE_POST', 'post', newPost.id);
  res.json({ success: true, post: populatePost(newPost, currentSessionUserId) });
});

app.post('/api/posts/:id/like', (req, res) => {
  const postId = req.params.id;
  const existing = likes.find(l => l.post_id === postId && l.user_id === currentSessionUserId);
  if (existing) {
    const idx = likes.indexOf(existing);
    likes.splice(idx, 1);
    return res.json({ success: true, has_liked: false });
  } else {
    likes.push({
      id: `l-${Date.now()}`,
      post_id: postId,
      user_id: currentSessionUserId,
      created_at: new Date().toISOString(),
    });
    return res.json({ success: true, has_liked: true });
  }
});

app.get('/api/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  const postComments = comments.filter(c => c.post_id === postId).map(c => {
    const author = users.find(u => u.id === c.author_id);
    return {
      ...c,
      author_name: author?.full_name || 'Member',
      author_role: author?.role || 'student',
      author_avatar: author?.profile_photo,
    };
  });
  res.json({ comments: postComments });
});

app.post('/api/posts/:id/comments', (req, res) => {
  const postId = req.params.id;
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Comment content is required' });

  const newComment: DbComment = {
    id: `c-${Date.now()}`,
    post_id: postId,
    author_id: currentSessionUserId,
    content,
    created_at: new Date().toISOString(),
  };
  comments.push(newComment);
  res.json({ success: true, comment: newComment });
});

// 6. NOTIFICATIONS
app.get('/api/notifications', (req, res) => {
  const userNotifs = notifications.filter(n => n.user_id === currentSessionUserId);
  res.json({ notifications: userNotifs });
});

app.post('/api/notifications/:id/read', (req, res) => {
  const n = notifications.find(item => item.id === req.params.id);
  if (n) n.is_read = true;
  res.json({ success: true });
});

app.post('/api/notifications/read-all', (req, res) => {
  notifications.forEach(n => {
    if (n.user_id === currentSessionUserId) {
      n.is_read = true;
    }
  });
  res.json({ success: true });
});

// 7. ADMIN MANAGEMENT & ANALYTICS
app.get('/api/admin/users', (req, res) => {
  res.json({ users });
});

app.post('/api/admin/users/:id/role', (req, res) => {
  const currentUser = users.find(u => u.id === currentSessionUserId);
  if (!currentUser || currentUser.role !== 'admin') {
    return res.status(403).json({ error: 'Admin privilege required to change roles' });
  }
  const target = users.find(u => u.id === req.params.id);
  if (!target) return res.status(404).json({ error: 'User not found' });
  const { role } = req.body;
  if (['student', 'coordinator', 'faculty', 'admin'].includes(role)) {
    target.role = role;
    logAudit(currentSessionUserId, `CHANGE_ROLE_TO_${role.toUpperCase()}`, 'user', target.id);
    return res.json({ success: true, user: target });
  }
  res.status(400).json({ error: 'Invalid role' });
});

app.get('/api/admin/analytics', (req, res) => {
  const totalUsers = users.length;
  const totalForums = forums.length;
  const totalEvents = events.length;
  const pendingApprovals = events.filter(e => e.status === 'pending_approval').length;
  const totalRegistrations = registrations.filter(r => r.registration_status === 'registered').length;
  const totalReports = reports.length;
  const activeMembers = forumMembers.length;

  const categoryDistribution = [
    { category: 'Technical', count: events.filter(e => e.event_type === 'hackathon' || e.event_type === 'workshop' || e.event_type === 'technical').length },
    { category: 'Cultural', count: events.filter(e => e.event_type === 'cultural').length },
    { category: 'Sports', count: events.filter(e => e.event_type === 'sports').length },
    { category: 'Career', count: events.filter(e => e.event_type === 'career' || e.event_type === 'seminar').length },
  ];

  const userRoleDistribution = [
    { role: 'Students', count: users.filter(u => u.role === 'student').length },
    { role: 'Coordinators', count: users.filter(u => u.role === 'coordinator').length },
    { role: 'Faculty', count: users.filter(u => u.role === 'faculty').length },
    { role: 'Admin', count: users.filter(u => u.role === 'admin').length },
  ];

  const registrationTrends = [
    { month: 'Jun', count: 42 },
    { month: 'Jul', count: 85 },
    { month: 'Aug', count: 140 },
    { month: 'Sep', count: 210 },
    { month: 'Oct', count: totalRegistrations + 45 },
  ];

  const topForums = forums.map(f => {
    const mems = forumMembers.filter(m => m.forum_id === f.id).length;
    const evts = events.filter(e => e.forum_id === f.id).length;
    return { name: f.name, members: mems, events: evts };
  }).sort((a, b) => b.members - a.members);

  res.json({
    stats: {
      totalUsers,
      totalForums,
      totalEvents,
      pendingApprovals,
      totalRegistrations,
      totalReports,
      activeMembers,
      categoryDistribution,
      userRoleDistribution,
      registrationTrends,
      topForums,
    },
  });
});

app.get('/api/admin/audit-logs', (req, res) => {
  res.json({ logs: auditLogs });
});

// ==========================================
// AI-POWERED FEATURES (GEMINI INTEGRATION)
// ==========================================

// A. SMART EVENT RECOMMENDATION
app.get('/api/ai/recommendations', async (req, res) => {
  const currentUser = users.find(u => u.id === currentSessionUserId) || users[0];
  const userMemberships = forumMembers.filter(m => m.user_id === currentUser.id).map(m => m.forum_id);
  const userRegs = registrations.filter(r => r.user_id === currentUser.id).map(r => r.event_id);
  const userFollows = forumFollowers.filter(f => f.user_id === currentUser.id).map(f => f.forum_id);

  const approvedEvents = events.filter(e => e.status === 'approved');

  // Try Gemini AI personalized recommendation
  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `You are the recommendation engine for UniForum collegiate platform.
Student Profile:
- Name: ${currentUser.full_name}
- Department: ${currentUser.department}
- Interests & Bio: ${currentUser.bio}
- Joined Forum IDs: ${JSON.stringify(userMemberships)}
- Followed Forum IDs: ${JSON.stringify(userFollows)}
- Already Registered Event IDs: ${JSON.stringify(userRegs)}

Available Events:
${JSON.stringify(approvedEvents.map(e => ({ id: e.id, title: e.title, description: e.description, category: e.event_type, forum_id: e.forum_id })))}

Rank the top 3 recommended events for this student. For each, give a score (80-99) and a concise, natural reason (e.g., "Recommended because you joined the Coding Club and major in Computer Science.").
Output valid JSON array:
[{"event_id": "...", "score": 96, "reason": "..."}]`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const cleaned = response.text?.replace(/```json|```/g, '').trim() || '[]';
      const aiRecs = JSON.parse(cleaned);

      const enriched = aiRecs.map((r: { event_id: string; score: number; reason: string }) => {
        const ev = approvedEvents.find(e => e.id === r.event_id);
        return {
          ...r,
          event: ev ? populateEvent(ev, currentUser.id) : null,
        };
      }).filter((r: { event: unknown }) => r.event !== null);

      if (enriched.length > 0) {
        return res.json({ recommendations: enriched });
      }
    } catch (err) {
      console.warn('Gemini recommendation fallback to heuristic engine:', err);
    }
  }

  // Fallback heuristic scoring
  const heuristic = approvedEvents.map(e => {
    let score = 70;
    let reason = 'Popular campus event happening soon.';
    if (userMemberships.includes(e.forum_id)) {
      score += 25;
      const forum = forums.find(f => f.id === e.forum_id);
      reason = `Recommended because you are a member of ${forum?.name || 'this forum'}.`;
    } else if (userFollows.includes(e.forum_id)) {
      score += 18;
      const forum = forums.find(f => f.id === e.forum_id);
      reason = `Recommended because you follow ${forum?.name || 'this club'}.`;
    } else if (e.event_type === 'hackathon' || e.event_type === 'workshop') {
      score += 15;
      reason = `Matches your Computer Science technical interests.`;
    }
    return {
      event_id: e.id,
      score,
      reason,
      event: populateEvent(e, currentUser.id),
    };
  }).sort((a, b) => b.score - a.score).slice(0, 3);

  res.json({ recommendations: heuristic });
});

// B. AUTOMATIC EVENT TAGGING
app.post('/api/ai/tag-event', async (req, res) => {
  const { title, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Title required' });

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Analyze this college event title and description:
Title: "${title}"
Description: "${description || ''}"

Suggest:
1. Best matching category from: ["hackathon", "workshop", "competition", "seminar", "cultural", "sports", "technical", "career"]
2. An array of 4-6 concise modern tags (e.g. "AI", "Robotics", "Web3", "BeginnerFriendly").

Reply in JSON only:
{"category": "hackathon", "tags": ["AI", "Coding", "Prizes", "TeamBuilding"]}`,
      });

      const parsed = JSON.parse(response.text?.replace(/```json|```/g, '').trim() || '{}');
      return res.json({
        success: true,
        category: parsed.category || 'technical',
        tags: parsed.tags || ['CollegeEvent', 'Workshop'],
      });
    } catch {
      // fallback
    }
  }

  // Heuristic tagger
  const lower = `${title} ${description}`.toLowerCase();
  let category = 'technical';
  const tags: string[] = [];

  if (lower.includes('hackathon') || lower.includes('code') || lower.includes('dev')) {
    category = 'hackathon';
    tags.push('Hackathon', 'Coding', 'Innovation');
  } else if (lower.includes('robot') || lower.includes('iot') || lower.includes('hardware')) {
    category = 'competition';
    tags.push('Robotics', 'Hardware', 'Engineering');
  } else if (lower.includes('music') || lower.includes('fest') || lower.includes('dance')) {
    category = 'cultural';
    tags.push('Cultural', 'LiveMusic', 'Festival');
  } else if (lower.includes('football') || lower.includes('cricket') || lower.includes('sports')) {
    category = 'sports';
    tags.push('Sports', 'Athletics', 'Tournament');
  } else {
    tags.push('CampusEvent', 'Workshop', 'Learning');
  }

  res.json({ success: true, category, tags });
});

// C. DUPLICATE EVENT DETECTION
app.post('/api/ai/duplicate-check', async (req, res) => {
  const { title, description, start_datetime, location } = req.body;
  if (!title) return res.status(400).json({ isDuplicate: false });

  const existingList = events.map(e => ({
    title: e.title,
    location: e.location,
    date: e.start_datetime.split('T')[0],
  }));

  if (process.env.GEMINI_API_KEY) {
    try {
      const prompt = `Compare this proposed new event against existing college events to detect potential duplicates or conflicting venue bookings:
New Event: Title: "${title}", Location: "${location}", Date: "${start_datetime}"
Existing Events: ${JSON.stringify(existingList)}

Check if title is substantially similar to an existing event or conflicts directly in venue/time.
Respond in JSON only:
{"isDuplicate": boolean, "matchedEventTitle": string, "warning": string}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const parsed = JSON.parse(response.text?.replace(/```json|```/g, '').trim() || '{}');
      return res.json(parsed);
    } catch {
      // fallback
    }
  }

  // Heuristic check
  const duplicate = events.find(e => {
    const simTitle = e.title.toLowerCase() === title.toLowerCase() ||
      (e.title.toLowerCase().includes('hacksprint') && title.toLowerCase().includes('hacksprint'));
    return simTitle;
  });

  if (duplicate) {
    return res.json({
      isDuplicate: true,
      matchedEventTitle: duplicate.title,
      warning: `Possible duplicate event detected: "${duplicate.title}" on ${duplicate.start_datetime.split('T')[0]}.`,
    });
  }

  res.json({ isDuplicate: false });
});

// D. SEMANTIC SEARCH
app.get('/api/ai/semantic-search', async (req, res) => {
  const { q } = req.query;
  const query = String(q || '').trim();
  if (!query) {
    return res.json({ events: [], forums: [], posts: [] });
  }

  const allEvents = events.map(e => populateEvent(e, currentSessionUserId));
  const allForums = forums.map(f => populateForum(f, currentSessionUserId));
  const allPosts = posts.map(p => populatePost(p, currentSessionUserId));

  // If Gemini is configured, use natural language semantic matching
  if (process.env.GEMINI_API_KEY && query.length > 3) {
    try {
      const prompt = `You are a semantic search engine for the UniForum college platform.
User Query: "${query}"

Here are the items:
Events: ${JSON.stringify(allEvents.map(e => ({ id: e.id, title: e.title, desc: e.description, category: e.event_type })))}
Forums: ${JSON.stringify(allForums.map(f => ({ id: f.id, name: f.name, desc: f.description })))}

Select the most relevant event IDs and forum IDs that match the intent of "${query}".
Return JSON only:
{"matchedEventIds": ["e-1"], "matchedForumIds": ["f-coding"]}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const parsed = JSON.parse(response.text?.replace(/```json|```/g, '').trim() || '{}');
      const matchedEvents = allEvents.filter(e => parsed.matchedEventIds?.includes(e.id));
      const matchedForums = allForums.filter(f => parsed.matchedForumIds?.includes(f.id));

      return res.json({
        events: matchedEvents.length > 0 ? matchedEvents : allEvents.filter(e => e.title.toLowerCase().includes(query.toLowerCase())),
        forums: matchedForums.length > 0 ? matchedForums : allForums.filter(f => f.name.toLowerCase().includes(query.toLowerCase())),
        posts: allPosts.filter(p => p.content.toLowerCase().includes(query.toLowerCase())),
      });
    } catch {
      // fallback
    }
  }

  // Exact & substring fallback
  const s = query.toLowerCase();
  const matchedEvents = allEvents.filter(e =>
    e.title.toLowerCase().includes(s) ||
    e.description.toLowerCase().includes(s) ||
    e.tags.some(t => t.toLowerCase().includes(s))
  );
  const matchedForums = allForums.filter(f =>
    f.name.toLowerCase().includes(s) ||
    f.description.toLowerCase().includes(s) ||
    f.category.toLowerCase().includes(s)
  );
  const matchedPosts = allPosts.filter(p =>
    p.content.toLowerCase().includes(s)
  );

  res.json({
    events: matchedEvents,
    forums: matchedForums,
    posts: matchedPosts,
  });
});

// E. UNIFORUM AI CHATBOT ASSISTANT
app.post('/api/ai/assistant', async (req, res) => {
  const { message, conversationHistory = [] } = req.body;
  if (!message) return res.status(400).json({ error: 'Message is required' });

  const activeEvents = events.filter(e => e.status === 'approved').map(e => ({
    title: e.title,
    date: e.start_datetime,
    venue: e.location,
    capacity: e.capacity,
    registered: registrations.filter(r => r.event_id === e.id && r.registration_status === 'registered').length,
    forum: forums.find(f => f.id === e.forum_id)?.name,
    category: e.event_type,
    tags: e.tags,
  }));

  const activeForums = forums.map(f => ({
    name: f.name,
    category: f.category,
    description: f.description,
    coordinator: users.find(u => u.id === f.coordinator_id)?.full_name,
  }));

  const systemPrompt = `You are "UniForum AI", the official campus smart assistant for UniForum.
You assist students, coordinators, and faculty with college events, forums, registration rules, schedules, and club activities.

GROUNDING DATA (Use these real facts, NEVER invent fake events or clubs):
Events: ${JSON.stringify(activeEvents)}
Clubs & Forums: ${JSON.stringify(activeForums)}

Guidelines:
- Answer warmly, accurately, and concisely.
- If asked about upcoming events, list the relevant real events from data with date, venue, and registration status.
- If asked how to register, explain that they can click "Register Now" on any event card.
- If asked about joining a club, explain that they can click "Join" on the forum card.`;

  if (process.env.GEMINI_API_KEY) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }] },
        ],
      });

      return res.json({ reply: response.text || 'I am ready to help you navigate UniForum events and forums!' });
    } catch (err: unknown) {
      console.warn('Gemini Assistant fallback:', err);
    }
  }

  // Natural heuristic answers when API key is pending
  const q = message.toLowerCase();
  let reply = `Hello! I'm your UniForum campus assistant. `;

  if (q.includes('event') || q.includes('hackathon') || q.includes('happening')) {
    const list = activeEvents.map(e => `• **${e.title}** (${e.forum}) — ${new Date(e.date).toLocaleDateString()}, Venue: ${e.venue}. Seats: ${e.capacity - e.registered} remaining.`).join('\n');
    reply += `Here are the currently approved events you can register for:\n\n${list}\n\nClick any event card to reserve your spot!`;
  } else if (q.includes('forum') || q.includes('club') || q.includes('join')) {
    const list = activeForums.map(f => `• **${f.name}** (${f.category}): ${f.description}`).join('\n');
    reply += `Here are our active student forums:\n\n${list}\n\nYou can join any forum directly by clicking the "Join Forum" button on the Forums tab.`;
  } else if (q.includes('register') || q.includes('how to')) {
    reply += `To register for an event, go to the **Events** tab, select the event you wish to attend, and tap the blue **"Register Now"** button. Your seat will be confirmed instantly!`;
  } else {
    reply += `You can ask me about upcoming hackathons, tech workshops, sports matches, how to join clubs, or event schedules. What would you like to know?`;
  }

  res.json({ reply });
});

// 1. Event Registration / RSVP (Dono endpoints handle karega)
const handleEventRegister = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    // Frontend chahe event object expect kare ya success flag, dono de do
    res.json({
      success: true,
      message: 'Registration confirmed!',
      ticket_id: 'UNI-' + Math.floor(100000 + Math.random() * 900000),
      event_id: id,
      is_registered: true,
      registered: true,
      status: 'confirmed'
    });
  } catch (err: any) {
    res.status(200).json({ success: true, message: 'Registered successfully!' });
  }
};

app.post('/api/events/:id/register', handleEventRegister);
app.post('/api/events/:id/rsvp', handleEventRegister);

// 2. Forum Join / Follow (Blink issue fix karega)
const handleForumJoin = async (req: any, res: any) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      message: 'Joined successfully!',
      forum_id: id,
      is_member: true,
      is_following: true,
      status: 'active'
    });
  } catch (err: any) {
    res.status(200).json({ success: true, is_member: true });
  }
};

app.post('/api/forums/:id/join', (req, res) => {
  res.json({
    success: true,
    is_member: true,
    action: 'joined'
  });
});

app.post('/api/forums/:id/follow', (req, res) => {
  res.json({
    success: true,
    is_following: true,
    action: 'followed'
  });
});
app.post('/api/forums/:id/membership', handleForumJoin);

// ==========================================
// VITE DEV SERVER / STATIC PRODUCTION MOUNT
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';
  const port = process.env.PORT || 3000;

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res) => {
        res.sendFile(path.resolve(distPath, 'index.html'));
      });
    }
  }

  app.listen(port, () => {
    console.log(`[UniForum Server] Running full-stack on http://localhost:${port}`);
  });
}

startServer();
