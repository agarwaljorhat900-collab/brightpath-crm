import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  User,
  ExternalLink,
  Calendar,
  X,
  PhoneCall,
  MessageSquare
} from 'lucide-react';
import { FollowUp, Lead, FollowUpStatus } from '../../types';

interface FollowUpsViewProps {
  followUps: FollowUp[];
  leads: Lead[];
  onToggleFollowUpStatus: (followUpId: string, currentStatus: FollowUpStatus) => void;
  onSelectLead: (lead: Lead) => void;
  onScheduleFollowUp?: (leadId: string, dueAt: string, note: string) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  followUps,
  leads,
  onToggleFollowUpStatus,
  onSelectLead,
  onScheduleFollowUp
}) => {
  const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming' | 'completed'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>(leads[0]?.id || '');
  const [dueAt, setDueAt] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [formError, setFormError] = useState<string | null>(null);

  const now = new Date();

  // Helper to format overdue/upcoming time differences
  const getTimeDiffLabel = (dateStr: string, isOverdue: boolean) => {
    const diffMs = Math.abs(new Date(dateStr).getTime() - now.getTime());
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${isOverdue ? 'Overdue by' : 'Due in'} ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    }
    if (diffHours > 0) {
      return `${isOverdue ? 'Overdue by' : 'Due in'} ${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    }
    return isOverdue ? 'Overdue just now' : 'Due within an hour';
  };

  // Quick Date Helpers
  const setQuickDate = (offsetHours: number) => {
    const target = new Date(Date.now() + offsetHours * 60 * 60 * 1000);
    const year = target.getFullYear();
    const month = String(target.getMonth() + 1).padStart(2, '0');
    const day = String(target.getDate()).padStart(2, '0');
    const hours = String(target.getHours()).padStart(2, '0');
    const minutes = String(target.getMinutes()).padStart(2, '0');
    setDueAt(`${year}-${month}-${day}T${hours}:${minutes}`);
  };

  const filteredFollowUps = followUps.filter((item) => {
    const isOverdue = item.status === 'pending' && new Date(item.due_at) < now;
    const isUpcoming = item.status === 'pending' && new Date(item.due_at) >= now;

    if (filter === 'overdue') return isOverdue;
    if (filter === 'upcoming') return isUpcoming;
    if (filter === 'completed') return item.status === 'completed';
    return true;
  });

  const overdueCount = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at) < now
  ).length;

  const upcomingCount = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at) >= now
  ).length;

  const completedCount = followUps.filter(
    (f) => f.status === 'completed'
  ).length;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!selectedLeadId) {
      setFormError('Please select a student enquiry.');
      return;
    }
    if (!dueAt) {
      setFormError('Please select a due date and time.');
      return;
    }
    if (!note.trim()) {
      setFormError('Please enter a note for this follow-up.');
      return;
    }

    if (onScheduleFollowUp) {
      onScheduleFollowUp(selectedLeadId, dueAt, note.trim());
    }

    setDueAt('');
    setNote('');
    setIsModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Follow-up Schedule
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Structured call reminders, parent consultations, and batch confirmations.
          </p>
        </div>

        {onScheduleFollowUp && leads.length > 0 && (
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              setSelectedLeadId(leads[0]?.id || '');
              setQuickDate(3);
              setIsModalOpen(true);
            }}
          >
            <Plus size={16} />
            <span>Schedule Follow-up</span>
          </button>
        )}
      </div>

      {/* Filter Tabs & Counter Chips */}
      <div style={{ display: 'flex', gap: '8px', background: '#ffffff', padding: '6px', borderRadius: '10px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '7px 16px',
            borderRadius: '7px',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: filter === 'all' ? '#0f172a' : 'transparent',
            color: filter === 'all' ? '#ffffff' : '#64748b'
          }}
        >
          All ({followUps.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('overdue')}
          style={{
            padding: '7px 16px',
            borderRadius: '7px',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: filter === 'overdue' ? '#dc2626' : 'transparent',
            color: filter === 'overdue' ? '#ffffff' : overdueCount > 0 ? '#dc2626' : '#64748b'
          }}
        >
          Overdue ({overdueCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('upcoming')}
          style={{
            padding: '7px 16px',
            borderRadius: '7px',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: filter === 'upcoming' ? '#4f46e5' : 'transparent',
            color: filter === 'upcoming' ? '#ffffff' : '#64748b'
          }}
        >
          Upcoming ({upcomingCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('completed')}
          style={{
            padding: '7px 16px',
            borderRadius: '7px',
            border: 'none',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
            background: filter === 'completed' ? '#16a34a' : 'transparent',
            color: filter === 'completed' ? '#ffffff' : '#64748b'
          }}
        >
          Completed ({completedCount})
        </button>
      </div>

      {/* Follow-up List Container */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          overflow: 'hidden'
        }}
      >
        {filteredFollowUps.length === 0 ? (
          <div style={{ padding: '56px 24px', textAlign: 'center', color: '#64748b' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: '#f1f5f9',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '14px',
                color: '#64748b'
              }}
            >
              <CalendarCheck size={24} />
            </div>
            <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.05rem', fontWeight: 600 }}>
              No Follow-ups in this view
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              {filter === 'overdue'
                ? 'All scheduled student follow-up reminders are on track!'
                : 'No follow-up consultations found matching this criteria.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredFollowUps.map((item, index) => {
              const isOverdue = item.status === 'pending' && new Date(item.due_at) < now;
              const relatedLead = leads.find((l) => l.id === item.lead_id) || item.lead;
              const diffText = getTimeDiffLabel(item.due_at, isOverdue);

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '18px 22px',
                    borderBottom: index === filteredFollowUps.length - 1 ? 'none' : '1px solid #f1f5f9',
                    background: isOverdue ? '#fffbfb' : '#ffffff',
                    transition: 'background-color 0.15s ease',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', flex: 1 }}>
                    {/* Completion Toggle Button */}
                    <button
                      type="button"
                      onClick={() => onToggleFollowUpStatus(item.id, item.status)}
                      title={item.status === 'completed' ? 'Click to reopen follow-up' : 'Click to mark as completed'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        marginTop: '2px',
                        color: item.status === 'completed' ? '#16a34a' : isOverdue ? '#ef4444' : '#cbd5e1',
                        transition: 'color 0.15s ease, transform 0.1s ease'
                      }}
                    >
                      <CheckCircle2 size={24} />
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: item.status === 'completed' ? '#94a3b8' : '#0f172a',
                            textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                            fontSize: '0.925rem',
                            lineHeight: 1.4
                          }}
                        >
                          {item.note}
                        </span>

                        {isOverdue && (
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#fee2e2',
                              color: '#b91c1c',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              letterSpacing: '0.02em'
                            }}
                          >
                            <AlertTriangle size={11} /> {diffText}
                          </span>
                        )}

                        {item.status === 'completed' && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#dcfce7',
                              color: '#15803d',
                              fontSize: '0.7rem',
                              fontWeight: 600
                            }}
                          >
                            Completed {item.completed_at ? `on ${new Date(item.completed_at).toLocaleDateString()}` : ''}
                          </span>
                        )}
                      </div>

                      {/* Metadata Row */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '18px', marginTop: '8px', fontSize: '0.78rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Clock size={13} color={isOverdue ? '#ef4444' : '#64748b'} />
                          <span>{new Date(item.due_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </span>

                        {item.assignee && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <User size={13} color="#94a3b8" />
                            <span>{item.assignee.full_name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Student Deep-Link Card */}
                  {relatedLead && (
                    <button
                      type="button"
                      onClick={() => onSelectLead(relatedLead)}
                      title={`Open enquiry record for ${relatedLead.full_name}`}
                      style={{
                        padding: '6px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '7px',
                        fontSize: '0.8rem',
                        color: '#4f46e5',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <span>{relatedLead.full_name}</span>
                      <ExternalLink size={12} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Schedule Follow-up Modal */}
      {isModalOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px'
          }}
        >
          <div
            className="modal-content"
            style={{
              background: '#ffffff',
              borderRadius: '14px',
              maxWidth: '480px',
              width: '100%',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#f8fafc'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CalendarCheck size={18} color="#4f46e5" />
                <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
                  Schedule Follow-up
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleCreateSubmit} style={{ padding: '22px' }}>
              {formError && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    marginBottom: '16px',
                    color: '#b91c1c',
                    fontSize: '0.8rem'
                  }}
                >
                  {formError}
                </div>
              )}

              {/* Student Enquiry Selector */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Student Enquiry *
                </label>
                <select
                  value={selectedLeadId}
                  onChange={(e) => setSelectedLeadId(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                >
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.full_name} — {l.course_interest} ({l.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Quick Time Chips */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' }}>
                  Quick Schedule Presets:
                </label>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    onClick={() => setQuickDate(2)}
                    style={{
                      padding: '4px 10px',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    +2 Hours
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(24)}
                    style={{
                      padding: '4px 10px',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(48)}
                    style={{
                      padding: '4px 10px',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    In 2 Days
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(168)}
                    style={{
                      padding: '4px 10px',
                      background: '#f1f5f9',
                      border: '1px solid #e2e8f0',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      color: '#475569'
                    }}
                  >
                    Next Week
                  </button>
                </div>
              </div>

              {/* Due Date & Time Picker */}
              <div className="form-group" style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Due Date & Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={dueAt}
                  onChange={(e) => setDueAt(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem'
                  }}
                />
              </div>

              {/* Note / Action Description */}
              <div className="form-group" style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Call / Consultation Purpose *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="e.g. Call student to discuss curriculum syllabus and batch schedule timings..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '7px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.875rem',
                    resize: 'vertical'
                  }}
                />
              </div>

              {/* Modal Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{
                    padding: '9px 16px',
                    borderRadius: '7px',
                    background: '#f8fafc',
                    color: '#475569',
                    border: '1px solid #cbd5e1',
                    fontWeight: 600,
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '9px 18px', fontSize: '0.85rem' }}
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
