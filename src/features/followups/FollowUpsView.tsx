import React, { useState } from 'react';
import {
  CalendarCheck,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Calendar,
  User,
  ExternalLink,
  Filter
} from 'lucide-react';
import { FollowUp, Lead, FollowUpStatus } from '../../types';

interface FollowUpsViewProps {
  followUps: FollowUp[];
  leads: Lead[];
  onToggleFollowUpStatus: (followUpId: string, currentStatus: FollowUpStatus) => void;
  onSelectLead: (lead: Lead) => void;
}

export const FollowUpsView: React.FC<FollowUpsViewProps> = ({
  followUps,
  leads,
  onToggleFollowUpStatus,
  onSelectLead
}) => {
  const [filter, setFilter] = useState<'all' | 'overdue' | 'upcoming' | 'completed'>('all');
  const now = new Date();

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Follow-up Schedule
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Manage scheduled calls, consultations, and reminders for student enquiries.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '8px', background: '#ffffff', padding: '6px', borderRadius: '8px', border: '1px solid #e2e8f0', width: 'fit-content' }}>
        <button
          type="button"
          onClick={() => setFilter('all')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filter === 'all' ? '#2563eb' : 'transparent',
            color: filter === 'all' ? '#ffffff' : '#475569'
          }}
        >
          All ({followUps.length})
        </button>

        <button
          type="button"
          onClick={() => setFilter('overdue')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filter === 'overdue' ? '#dc2626' : 'transparent',
            color: filter === 'overdue' ? '#ffffff' : overdueCount > 0 ? '#dc2626' : '#475569'
          }}
        >
          Overdue ({overdueCount})
        </button>

        <button
          type="button"
          onClick={() => setFilter('upcoming')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filter === 'upcoming' ? '#2563eb' : 'transparent',
            color: filter === 'upcoming' ? '#ffffff' : '#475569'
          }}
        >
          Upcoming
        </button>

        <button
          type="button"
          onClick={() => setFilter('completed')}
          style={{
            padding: '6px 14px',
            borderRadius: '6px',
            border: 'none',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            background: filter === 'completed' ? '#16a34a' : 'transparent',
            color: filter === 'completed' ? '#ffffff' : '#475569'
          }}
        >
          Completed
        </button>
      </div>

      {/* Follow-up List */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {filteredFollowUps.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: '#64748b' }}>
            <CalendarCheck size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.1rem' }}>No Follow-ups in this view</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>All student follow-up reminders are up to date.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {filteredFollowUps.map((item) => {
              const isOverdue = item.status === 'pending' && new Date(item.due_at) < now;
              const relatedLead = leads.find((l) => l.id === item.lead_id) || item.lead;

              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderBottom: '1px solid #f1f5f9',
                    background: isOverdue ? '#fffafa' : '#ffffff',
                    gap: '16px'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', flex: 1 }}>
                    <button
                      type="button"
                      onClick={() => onToggleFollowUpStatus(item.id, item.status)}
                      title={item.status === 'completed' ? 'Mark Pending' : 'Mark Completed'}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: 0,
                        marginTop: '2px',
                        color: item.status === 'completed' ? '#16a34a' : '#94a3b8'
                      }}
                    >
                      <CheckCircle2 size={22} />
                    </button>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <span
                          style={{
                            fontWeight: 600,
                            color: item.status === 'completed' ? '#94a3b8' : '#0f172a',
                            textDecoration: item.status === 'completed' ? 'line-through' : 'none',
                            fontSize: '0.95rem'
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
                              fontSize: '0.72rem',
                              fontWeight: 700
                            }}
                          >
                            <AlertTriangle size={12} /> OVERDUE
                          </span>
                        )}

                        {item.status === 'completed' && (
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              background: '#dcfce7',
                              color: '#15803d',
                              fontSize: '0.72rem',
                              fontWeight: 600
                            }}
                          >
                            Completed {item.completed_at ? new Date(item.completed_at).toLocaleDateString() : ''}
                          </span>
                        )}
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.78rem', color: '#64748b' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={13} /> Due: {new Date(item.due_at).toLocaleString()}
                        </span>

                        {item.assignee && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={13} /> {item.assignee.full_name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {relatedLead && (
                    <button
                      type="button"
                      onClick={() => onSelectLead(relatedLead)}
                      style={{
                        padding: '6px 12px',
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.78rem',
                        color: '#2563eb',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        whiteSpace: 'nowrap'
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
    </div>
  );
};
