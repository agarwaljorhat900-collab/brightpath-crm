import React, { useState } from 'react';
import {
  History,
  User,
  Clock,
  ArrowRight,
  UserPlus,
  RefreshCw,
  Award,
  XCircle,
  Calendar,
  CheckCircle2,
  Filter,
  Search
} from 'lucide-react';
import { Activity, Lead, ActivityType } from '../../types';

interface ActivitiesViewProps {
  activities: Activity[];
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
}

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({
  activities,
  leads,
  onSelectLead
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Relative Time Helper
  const formatTimeAgo = (dateStr: string) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHours = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Activity Icon & Style Resolver
  const getActivityMeta = (type: ActivityType, description: string) => {
    if (type === 'lead_created') {
      return {
        icon: <UserPlus size={14} />,
        bg: '#eff6ff',
        color: '#3b82f6',
        border: '#bfdbfe',
        label: 'Enquiry Added'
      };
    }
    if (type === 'status_changed') {
      if (description.includes('Converted')) {
        return {
          icon: <Award size={14} />,
          bg: '#ecfdf5',
          color: '#10b981',
          border: '#a7f3d0',
          label: 'Admitted'
        };
      }
      if (description.includes('Lost')) {
        return {
          icon: <XCircle size={14} />,
          bg: '#fff1f2',
          color: '#f43f5e',
          border: '#fecdd3',
          label: 'Marked Lost'
        };
      }
      return {
        icon: <RefreshCw size={14} />,
        bg: '#f8fafc',
        color: '#6366f1',
        border: '#e0e7ff',
        label: 'Stage Update'
      };
    }
    if (type === 'follow_up_scheduled') {
      return {
        icon: <Calendar size={14} />,
        bg: '#fffbeb',
        color: '#f59e0b',
        border: '#fde68a',
        label: 'Call Scheduled'
      };
    }
    if (type === 'follow_up_completed') {
      return {
        icon: <CheckCircle2 size={14} />,
        bg: '#f0fdf4',
        color: '#16a34a',
        border: '#bbf7d0',
        label: 'Call Completed'
      };
    }
    return {
      icon: <History size={14} />,
      bg: '#f1f5f9',
      color: '#475569',
      border: '#cbd5e1',
      label: 'Activity'
    };
  };

  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const filteredActivities = sortedActivities.filter((act) => {
    // Filter Type
    let matchesType = true;
    if (filterType === 'lead_created') matchesType = act.activity_type === 'lead_created';
    else if (filterType === 'status_changed') matchesType = act.activity_type === 'status_changed';
    else if (filterType === 'follow_up') matchesType = act.activity_type.startsWith('follow_up');

    // Search Query
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      act.description.toLowerCase().includes(q) ||
      (act.actor?.full_name && act.actor.full_name.toLowerCase().includes(q));

    return matchesType && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Activity Log & Audit Trail
        </h1>
        <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
          Real-time chronological timeline tracking admissions, counselor interactions, and stage updates.
        </p>
      </div>

      {/* Control Bar: Filter Tabs & Search */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        {/* Category Tabs */}
        <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '5px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <button
            type="button"
            onClick={() => setFilterType('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: filterType === 'all' ? '#0f172a' : 'transparent',
              color: filterType === 'all' ? '#ffffff' : '#64748b'
            }}
          >
            All Events ({activities.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('status_changed')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: filterType === 'status_changed' ? '#4f46e5' : 'transparent',
              color: filterType === 'status_changed' ? '#ffffff' : '#64748b'
            }}
          >
            Stage Updates
          </button>
          <button
            type="button"
            onClick={() => setFilterType('lead_created')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: filterType === 'lead_created' ? '#2563eb' : 'transparent',
              color: filterType === 'lead_created' ? '#ffffff' : '#64748b'
            }}
          >
            New Enquiries
          </button>
          <button
            type="button"
            onClick={() => setFilterType('follow_up')}
            style={{
              padding: '6px 14px',
              borderRadius: '7px',
              border: 'none',
              fontSize: '0.825rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              background: filterType === 'follow_up' ? '#16a34a' : 'transparent',
              color: filterType === 'follow_up' ? '#ffffff' : '#64748b'
            }}
          >
            Follow-ups
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '10px' }} />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontSize: '0.825rem',
              background: '#ffffff',
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Timeline Container */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          padding: '28px 24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)'
        }}
      >
        {filteredActivities.length === 0 ? (
          <div style={{ padding: '48px 12px', textAlign: 'center', color: '#64748b' }}>
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
              <History size={24} />
            </div>
            <h3 style={{ margin: '0 0 6px 0', color: '#0f172a', fontSize: '1.05rem', fontWeight: 600 }}>
              No Events Found
            </h3>
            <p style={{ margin: 0, fontSize: '0.85rem' }}>
              Audit activities are automatically generated when you add leads, change stages, or complete calls.
            </p>
          </div>
        ) : (
          <div style={{ position: 'relative', paddingLeft: '32px' }}>
            {/* Continuous Vertical Timeline Track */}
            <div
              style={{
                position: 'absolute',
                left: '15px',
                top: '12px',
                bottom: '12px',
                width: '2px',
                backgroundColor: '#f1f5f9'
              }}
            />

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {filteredActivities.map((act) => {
                const relatedLead = leads.find((l) => l.id === act.lead_id);
                const meta = getActivityMeta(act.activity_type, act.description);
                const timeAgo = formatTimeAgo(act.created_at);

                return (
                  <div key={act.id} style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                    {/* Event Node Icon */}
                    <div
                      style={{
                        position: 'absolute',
                        left: '-32px',
                        top: '2px',
                        width: '30px',
                        height: '30px',
                        borderRadius: '50%',
                        backgroundColor: meta.bg,
                        border: `2px solid ${meta.border}`,
                        color: meta.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                        zIndex: 2
                      }}
                      title={meta.label}
                    >
                      {meta.icon}
                    </div>

                    {/* Event Card Content */}
                    <div
                      style={{
                        flex: 1,
                        background: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        borderRadius: '10px',
                        padding: '14px 18px',
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: '16px',
                        transition: 'background-color 0.15s ease'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              textTransform: 'uppercase',
                              letterSpacing: '0.04em',
                              padding: '2px 7px',
                              borderRadius: '4px',
                              backgroundColor: meta.bg,
                              color: meta.color,
                              border: `1px solid ${meta.border}`
                            }}
                          >
                            {meta.label}
                          </span>
                          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>•</span>
                          <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 500 }}>
                            {timeAgo}
                          </span>
                        </div>

                        <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 500, lineHeight: 1.45 }}>
                          {act.description}
                        </div>

                        {/* Actor Attribution */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '8px', fontSize: '0.78rem', color: '#64748b' }}>
                          <User size={13} color="#94a3b8" />
                          <span>Recorded by</span>
                          <strong style={{ color: '#334155' }}>
                            {act.actor?.full_name || 'Staff Member'}
                          </strong>
                          {act.actor?.role && (
                            <span
                              style={{
                                fontSize: '0.7rem',
                                padding: '1px 6px',
                                borderRadius: '4px',
                                background: '#e2e8f0',
                                color: '#475569',
                                textTransform: 'capitalize'
                              }}
                            >
                              {act.actor.role}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Deep Link to Student Enquiry */}
                      {relatedLead && (
                        <button
                          type="button"
                          onClick={() => onSelectLead(relatedLead)}
                          title={`View enquiry for ${relatedLead.full_name}`}
                          style={{
                            padding: '6px 12px',
                            background: '#ffffff',
                            border: '1px solid #cbd5e1',
                            borderRadius: '7px',
                            fontSize: '0.78rem',
                            color: '#4f46e5',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            whiteSpace: 'nowrap',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.02)',
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <span>{relatedLead.full_name}</span>
                          <ArrowRight size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
