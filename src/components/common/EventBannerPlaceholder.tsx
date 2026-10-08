import React from 'react';
import { EventCategory } from '../../types';
import { 
  Code2, 
  Bot, 
  Sparkles, 
  Trophy, 
  Cpu, 
  GraduationCap, 
  Briefcase, 
  Wrench,
  Calendar
} from 'lucide-react';

interface EventBannerProps {
  category: EventCategory;
  title: string;
  className?: string;
  imageUrl?: string;
}

export const EventBannerPlaceholder: React.FC<EventBannerProps> = ({ category, title, className = 'h-40', imageUrl }) => {
  if (imageUrl) {
    return (
      <div className={`relative w-full overflow-hidden bg-slate-900 ${className}`}>
        <img
          src={imageUrl}
          alt={title}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>
    );
  }

  // Domain-specific styled SVG gradient graphic
  const getTheme = () => {
    switch (category) {
      case 'hackathon':
        return {
          gradient: 'from-blue-700 via-indigo-800 to-slate-900',
          patternColor: 'rgba(59, 130, 246, 0.15)',
          Icon: Code2,
          tag: 'Hackathon Track',
        };
      case 'competition':
        return {
          gradient: 'from-cyan-700 via-teal-800 to-slate-900',
          patternColor: 'rgba(6, 182, 212, 0.15)',
          Icon: Bot,
          tag: 'Arena Challenge',
        };
      case 'cultural':
        return {
          gradient: 'from-purple-700 via-pink-800 to-slate-900',
          patternColor: 'rgba(168, 85, 247, 0.15)',
          Icon: Sparkles,
          tag: 'Cultural Stage',
        };
      case 'sports':
        return {
          gradient: 'from-emerald-700 via-teal-800 to-slate-900',
          patternColor: 'rgba(16, 185, 129, 0.15)',
          Icon: Trophy,
          tag: 'Athletics & Cup',
        };
      case 'workshop':
        return {
          gradient: 'from-sky-700 via-blue-800 to-slate-900',
          patternColor: 'rgba(14, 165, 233, 0.15)',
          Icon: Wrench,
          tag: 'Hands-on Bootcamp',
        };
      case 'seminar':
        return {
          gradient: 'from-indigo-700 via-slate-800 to-slate-900',
          patternColor: 'rgba(99, 102, 241, 0.15)',
          Icon: GraduationCap,
          tag: 'Keynote & Lecture',
        };
      case 'career':
        return {
          gradient: 'from-amber-700 via-orange-800 to-slate-900',
          patternColor: 'rgba(245, 158, 11, 0.15)',
          Icon: Briefcase,
          tag: 'Career & Industry',
        };
      default:
        return {
          gradient: 'from-blue-800 via-indigo-900 to-slate-900',
          patternColor: 'rgba(96, 165, 250, 0.15)',
          Icon: Cpu,
          tag: 'Technical Forum',
        };
    }
  };

  const theme = getTheme();
  const Icon = theme.Icon;

  return (
    <div className={`relative w-full overflow-hidden bg-gradient-to-br ${theme.gradient} flex flex-col justify-between p-4 text-white ${className}`}>
      {/* Subtle grid background pattern */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '20px 20px',
        }} 
      />

      {/* Top row */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold tracking-wide uppercase text-white/80">
          <Icon className="w-4 h-4" />
          <span>{theme.tag}</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center text-white/90">
          <Calendar className="w-4 h-4" />
        </div>
      </div>

      {/* Title preview in banner */}
      <div className="relative z-10">
        <h4 className="font-bold text-lg leading-snug line-clamp-1 drop-shadow-sm text-white">
          {title}
        </h4>
      </div>
    </div>
  );
};
