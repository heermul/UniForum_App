import React from 'react';
import { Modal } from '../common/Modal';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';
import { RoleBadge } from '../common/RoleBadge';
import { GraduationCap, Users, ShieldCheck, UserCog, ArrowRight, Check } from 'lucide-react';

interface RoleSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRoleSelected: (role: UserRole) => void;
}

export const RoleSelectorModal: React.FC<RoleSelectorModalProps> = ({
  isOpen,
  onClose,
  onRoleSelected,
}) => {
  const { role, switchRole } = useAuth();

  const roleCards = [
    {
      role: 'student' as UserRole,
      title: 'Student Portal',
      description: 'Discover hackathons, register for college workshops, join clubs, and receive AI recommendations.',
      icon: GraduationCap,
      color: 'blue',
      badge: 'Student',
    },
    {
      role: 'coordinator' as UserRole,
      title: 'Forum Coordinator',
      description: 'Manage assigned club activities, propose events with AI auto-tagging, and track attendance rosters.',
      icon: Users,
      color: 'emerald',
      badge: 'Coordinator',
    },
    {
      role: 'faculty' as UserRole,
      title: 'Faculty / Authority',
      description: 'Review pending event submissions, approve/reject proposals with feedback, and monitor schedules.',
      icon: ShieldCheck,
      color: 'purple',
      badge: 'Faculty',
    },
    {
      role: 'admin' as UserRole,
      title: 'Platform Administrator',
      description: 'System-wide governance, RBAC role assignments, chartering forums, and telemetry analytics.',
      icon: UserCog,
      color: 'amber',
      badge: 'Admin',
    },
  ];

  const handleSelect = async (r: UserRole) => {
    await switchRole(r);
    onRoleSelected(r);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Workspace Role"
      subtitle="Switch between the 4 authorized role flows to inspect functionality"
      maxWidth="max-w-2xl"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {roleCards.map((item) => {
          const Icon = item.icon;
          const isSelected = role === item.role;

          return (
            <div
              key={item.role}
              onClick={() => handleSelect(item.role)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm ring-1 ring-blue-600/30'
                  : 'border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/80 bg-white'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
                    <Icon className="w-5 h-5" />
                  </div>
                  <RoleBadge role={item.role} size="sm" />
                </div>

                <h3 className="font-bold text-base text-slate-900 flex items-center justify-between">
                  <span>{item.title}</span>
                  {isSelected && <Check className="w-4 h-4 text-blue-600 shrink-0" />}
                </h3>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-blue-600">
                <span>{isSelected ? 'Current Active Flow' : 'Switch into Role'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          );
        })}
      </div>
    </Modal>
  );
};
