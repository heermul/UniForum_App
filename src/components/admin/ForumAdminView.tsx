import React, { useState, useEffect } from 'react';
import { api } from '../../lib/api';
import { Forum, UserProfile } from '../../types';
import { Modal } from '../common/Modal';
import { Plus, Users, ShieldCheck, CheckCircle2, Search, Edit } from 'lucide-react';

export const ForumAdminView: React.FC = () => {
  const [forums, setForums] = useState<Forum[]>([]);
  const [coordinators, setCoordinators] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Technical');
  const [submitting, setSubmitting] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [fRes, uRes] = await Promise.all([
        api.getForums(),
        api.getAllUsers(),
      ]);
      setForums(fRes.forums);
      setCoordinators(uRes.users.filter((u) => u.role === 'coordinator' || u.role === 'admin'));
    } catch (err) {
      console.error('Failed to load forum admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateForum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    try {
      setSubmitting(true);
      await api.createForum({
        name: name.trim(),
        description: description.trim(),
        category,
      });
      setName('');
      setDescription('');
      setCreateModalOpen(false);
      await loadData();
    } catch (err) {
      alert((err as Error).message || 'Failed to create forum');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Forum & Society Governance</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Charter new college societies, assign authorized faculty coordinators, and regulate club memberships.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Charter New Forum</span>
        </button>
      </div>

      {/* Forums Table */}
      {loading ? (
        <div className="space-y-2 py-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/90 overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Club / Forum Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Coordinator</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Charter Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {forums.map((f) => (
                <tr key={f.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-900">
                    <p className="text-xs sm:text-sm">{f.name}</p>
                    <p className="text-[11px] text-slate-400 font-normal line-clamp-1">{f.description}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                      {f.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium text-slate-700">
                    {f.coordinator_name || 'Assigned Coordinator'}
                  </td>
                  <td className="py-3.5 px-4 font-mono tabular-nums text-slate-700">
                    {f.member_count} enrolled
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      Active
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono text-slate-400 text-[11px]">
                    {new Date(f.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Charter Modal */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Charter New Student Forum"
        subtitle="Establish an official collegiate society with dedicated board"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateForum} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Forum Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Quantum Computing Society"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Technical">Technical</option>
              <option value="Engineering">Engineering</option>
              <option value="Cultural">Cultural</option>
              <option value="Sports">Sports</option>
              <option value="Career">Career & Placement</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Purpose & Description *</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the forum objectives, annual flagship goals, and student target group..."
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCreateModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors"
            >
              {submitting ? 'Creating...' : 'Charter Forum'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
