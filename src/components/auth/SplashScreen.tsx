import React from 'react';
import { Sparkles, Calendar, Users, ShieldCheck, ArrowRight } from 'lucide-react';

interface SplashScreenProps {
  onContinue: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onContinue }) => {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      {/* Background radial ambient lights */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-md w-full bg-white/10 backdrop-blur-xl border border-white/15 rounded-3xl p-8 sm:p-10 text-center text-white shadow-2xl">
        {/* Animated Brand Emblem */}
        <div className="relative mx-auto mb-6 w-20 h-20 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
          <span className="text-4xl font-black text-white">U</span>
          <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div>

        {/* Branding Typography */}
        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          UniForum
        </h1>
        <p className="text-xs font-semibold uppercase tracking-wider text-blue-300 mb-4">
          AI-Powered College Forums & Event Management
        </p>

        <p className="text-sm text-slate-300 leading-relaxed mb-8">
          The unified collegiate platform where students discover hackathons, engage with campus clubs, and access verified event registrations with personalized AI recommendations.
        </p>

        {/* Highlights Row */}
        <div className="grid grid-cols-3 gap-2 py-4 px-2 mb-8 bg-white/5 rounded-2xl border border-white/10 text-center">
          <div>
            <Calendar className="w-4 h-4 text-blue-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">Verified</span>
            <span className="text-[10px] text-slate-400">Events</span>
          </div>
          <div className="border-x border-white/10">
            <Users className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">Clubs</span>
            <span className="text-[10px] text-slate-400">Forums</span>
          </div>
          <div>
            <Sparkles className="w-4 h-4 text-purple-400 mx-auto mb-1" />
            <span className="text-[11px] font-bold text-white block">Smart</span>
            <span className="text-[10px] text-slate-400">AI Alerts</span>
          </div>
        </div>

        {/* CTA Launch */}
        <button
          onClick={onContinue}
          className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group cursor-pointer"
        >
          <span>Enter Campus Portal</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>

        <p className="mt-4 text-[11px] text-slate-400 font-mono">
          Demo version · Includes Student, Coordinator, Faculty & Admin flows
        </p>
      </div>
    </div>
  );
};
