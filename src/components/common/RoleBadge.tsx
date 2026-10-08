import React from 'react';
import { UserRole } from '../../types';

interface RoleBadgeProps {
  role: UserRole;
  size?: 'sm' | 'md';
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({ role, size = 'md' }) => {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-semibold';

  switch (role) {
    case 'student':
      return (
        <span className={`inline-flex items-center rounded-md bg-blue-50 text-blue-700 border border-blue-200/60 ${sizeClasses}`}>
          Student
        </span>
      );
    case 'coordinator':
      return (
        <span className={`inline-flex items-center rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/60 ${sizeClasses}`}>
          Coordinator
        </span>
      );
    case 'faculty':
      return (
        <span className={`inline-flex items-center rounded-md bg-purple-50 text-purple-700 border border-purple-200/60 ${sizeClasses}`}>
          Faculty / Authority
        </span>
      );
    case 'admin':
      return (
        <span className={`inline-flex items-center rounded-md bg-amber-50 text-amber-700 border border-amber-200/60 ${sizeClasses}`}>
          Administrator
        </span>
      );
    default:
      return null;
  }
};
