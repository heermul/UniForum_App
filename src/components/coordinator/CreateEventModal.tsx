import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../lib/api';
import { CollegeEvent, EventCategory, Forum } from '../../types';
import { Sparkles, AlertTriangle, Calendar, MapPin, Users, Check, X } from 'lucide-react';

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: () => void;
  forums: Forum[];
}

export const CreateEventModal: React.FC<CreateEventModalProps> = ({
  isOpen,
  onClose,
  onEventCreated,
  forums,
}) => {
  const [forumId, setForumId] = useState(forums[0]?.id || '');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [eventType, setEventType] = useState<EventCategory>('hackathon');
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('17:00');
  const [deadlineDate, setDeadlineDate] = useState('');
  const [deadlineTime, setDeadlineTime] = useState('23:59');
  const [capacity, setCapacity] = useState('100');
  const [tags, setTags] = useState<string[]>(['Hackathon', 'Coding']);
  const [newTagInput, setNewTagInput] = useState('');

  // AI Helpers state
  const [suggestingTags, setSuggestingTags] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Trigger AI Auto-Tagging
  const handleAiAutoTag = async () => {
    if (!title.trim()) {
      alert('Please enter an event title first so the AI can analyze it.');
      return;
    }
    try {
      setSuggestingTags(true);
      const res = await api.autoTagEvent(title, description);
      if (res.category) {
        setEventType(res.category as EventCategory);
      }
      if (res.tags && res.tags.length > 0) {
        setTags(res.tags);
      }
    } catch (err) {
      console.error('AI tag error:', err);
    } finally {
      setSuggestingTags(false);
    }
  };

  // Trigger AI Duplicate Detection
  const handleCheckDuplicate = async () => {
    if (title.length < 3) return;
    try {
      const res = await api.checkDuplicateEvent({
        title,
        location,
        start_datetime: startDate ? `${startDate}T${startTime}:00Z` : undefined,
      });
      if (res.isDuplicate && res.warning) {
        setDuplicateWarning(res.warning);
      } else {
        setDuplicateWarning(null);
      }
    } catch {
      // ignore
    }
  };

  const handleAddTag = () => {
    if (newTagInput.trim() && !tags.includes(newTagInput.trim())) {
      setTags([...tags, newTagInput.trim()]);
      setNewTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !location.trim() || !startDate) {
      alert('Please fill out all required event details (title, location, date).');
      return;
    }

    try {
      setSubmitting(true);
      const startDateTime = `${startDate}T${startTime}:00Z`;
      const endDateTime = endDate ? `${endDate}T${endTime}:00Z` : startDateTime;
      const deadlineDateTime = deadlineDate ? `${deadlineDate}T${deadlineTime}:00Z` : startDateTime;

      await api.createEvent({
        forum_id: forumId || forums[0]?.id,
        title: title.trim(),
        description: description.trim(),
        event_type: eventType,
        location: location.trim(),
        start_datetime: startDateTime,
        end_datetime: endDateTime,
        registration_deadline: deadlineDateTime,
        capacity: Number(capacity) || 100,
        tags,
      });

      onEventCreated();
      onClose();
    } catch (err) {
      alert((err as Error).message || 'Failed to submit event');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Campus Event"
      subtitle="Submit event proposal for faculty review and registration publication"
      maxWidth="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Forum Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Host Forum / Club</label>
          <select
            value={forumId}
            onChange={(e) => setForumId(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
          >
            {forums.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f.category})
              </option>
            ))}
          </select>
        </div>

        {/* Title + AI Duplicate Check */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-bold text-slate-700">Event Title *</label>
            <button
              type="button"
              onClick={handleAiAutoTag}
              disabled={suggestingTags}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100 transition-colors"
            >
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span>{suggestingTags ? 'Analyzing with AI...' : 'Suggest Tags & Category'}</span>
            </button>
          </div>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={handleCheckDuplicate}
            placeholder="e.g. HackSprint 2027: National Collegiate Hackathon"
            className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          />
        </div>

        {/* AI Duplicate Warning Banner */}
        {duplicateWarning && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Duplicate Event Notice</p>
              <p className="text-amber-700 mt-0.5">{duplicateWarning}</p>
            </div>
          </div>
        )}

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Event Description & Schedule *</label>
          <textarea
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the agenda, competition tracks, eligibility, rules, prizes, and venue amenities..."
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Category & Location */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Category</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value as EventCategory)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
            >
              <option value="hackathon">Hackathon</option>
              <option value="workshop">Workshop</option>
              <option value="competition">Competition</option>
              <option value="seminar">Seminar / Lecture</option>
              <option value="cultural">Cultural Festival</option>
              <option value="sports">Sports Match</option>
              <option value="technical">Technical Meetup</option>
              <option value="career">Career / Placement</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Venue / Room Location *</label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Main Auditorium & Innovation Lab"
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event Start Date & Time *</label>
            <div className="flex gap-2">
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-24 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Event End Date & Time</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-24 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Deadline & Capacity */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Registration Cutoff Deadline</label>
            <div className="flex gap-2">
              <input
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
              <input
                type="time"
                value={deadlineTime}
                onChange={(e) => setDeadlineTime(e.target.value)}
                className="w-24 px-2 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Maximum Seat Capacity</label>
            <input
              type="number"
              min="5"
              max="5000"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white font-mono tabular-nums"
            />
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Event Tags</label>
          <div className="flex flex-wrap items-center gap-1.5 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-medium"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTagInput}
              onChange={(e) => setNewTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              placeholder="Add custom tag (press Enter)"
              className="flex-1 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
            >
              Add
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-[11px] text-slate-500">
            * Events require review and approval from campus faculty before appearing publicly.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
            >
              <span>{submitting ? 'Submitting...' : 'Submit for Approval'}</span>
            </button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
