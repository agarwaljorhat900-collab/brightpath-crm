import React from 'react';
import {
  Users,
  UserPlus,
  Award,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  BookOpen,
  Calendar,
  Sparkles,
  ChevronRight,
  Activity as ActivityIcon,
  PlusCircle
} from 'lucide-react';
import { Lead, FollowUp, UserRole } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { STATUS_CONFIG, COURSES } from '../../constants';

interface DashboardViewProps {
  leads: Lead[];
  followUps: FollowUp[];
  currentRole: UserRole;
  onNavigateTab: (tab: string) => void;
  onSelectLead?: (lead: Lead) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  followUps,
  currentRole,
  onNavigateTab,
  onSelectLead
}) => {
  const now = new Date();

  // Metrics definition from Master Spec Section 15
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New').length;
  const contactedLeads = leads.filter((l) => l.status === 'Contacted').length;
  const qualifiedLeads = leads.filter((l) => l.status === 'Qualified').length;
  const convertedLeads = leads.filter((l) => l.status === 'Converted').length;
  const lostLeads = leads.filter((l) => l.status === 'Lost').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // Overdue: pending AND due_at < now
  const overdueFollowUps = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at) < now
  );

  const upcomingFollowUps = followUps
    .filter((f) => f.status === 'pending' && new Date(f.due_at) >= now)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

  // Status breakdown
  const statusCounts = [
    { status: 'New', count: newLeads, color: '#2563eb', bg: '#eff6ff' },
    { status: 'Contacted', count: contactedLeads, color: '#0284c7', bg: '#f0f9ff' },
    { status: 'Qualified', count: qualifiedLeads, color: '#7c3aed', bg: '#f5f3ff' },
    { status: 'Converted', count: convertedLeads, color: '#059669', bg: '#ecfdf5' },
    { status: 'Lost', count: lostLeads, color: '#dc2626', bg: '#fef2f2' }
  ].map((item) => ({
    ...item,
    percentage: totalLeads > 0 ? Math.round((item.count / totalLeads) * 100) : 0
  }));

  // Course interest breakdown
  const courseCounts = COURSES.map((course) => {
    const count = leads.filter((l) => l.course_interest === course).length;
    return {
      course,
      count,
      percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0
    };
  }).filter((c) => c.count > 0);

  // Recent enquiries sorted by date
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const formatRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Executive Command Header */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 60%, #312e81 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255, 255, 255, 0.12)',
                backdropFilter: 'blur(8px)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 600,
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
                color: '#e0e7ff'
              }}
            >
              <div className="live-pulse-dot" />
              Institutional Command Center
            </span>
            <span
              style={{
                background: 'rgba(99, 102, 241, 0.3)',
                padding: '4px 10px',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 600,
                color: '#c7d2fe'
              }}
            >
              Scope: <strong style={{ textTransform: 'capitalize' }}>{currentRole}</strong> Access
            </span>
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
            BrightPath Academy Admissions Intelligence
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: '#cbd5e1' }}>
            Real-time enrollment metrics, student candidate progression, and counselor action queue.
          </p>
        </div>

        {/* Quick Nav Actions */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => onNavigateTab('leads')}
            className="dashboard-quick-action-pill"
            style={{
              background: '#ffffff',
              color: '#1e1b4b',
              border: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <PlusCircle size={15} color="#4f46e5" />
            <span>Manage Enquiries</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('followups')}
            className="dashboard-quick-action-pill"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <Calendar size={15} />
            <span>Task Queue {overdueFollowUps.length > 0 && `(${overdueFollowUps.length})`}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('activities')}
            className="dashboard-quick-action-pill"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              color: '#ffffff',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              backdropFilter: 'blur(8px)'
            }}
          >
            <ActivityIcon size={15} />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* Overdue Urgent Alert Banner */}
      {overdueFollowUps.length > 0 && (
        <div
          role="alert"
          onClick={() => onNavigateTab('followups')}
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '12px',
            padding: '14px 18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            boxShadow: '0 2px 6px rgba(220, 38, 38, 0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#fee2e2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#dc2626'
              }}
            >
              <AlertTriangle size={20} />
            </div>
            <div>
              <strong style={{ color: '#991b1b', fontSize: '0.9rem', display: 'block' }}>
                Action Required: {overdueFollowUps.length} Overdue Follow-up{overdueFollowUps.length > 1 ? 's' : ''}
              </strong>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#b91c1c' }}>
                Prospective students have passed their scheduled callback date. Click to review immediately.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigateTab('followups');
            }}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              padding: '8px 14px',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Review Overdue</span>
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* 5 Interactive Clickable KPI Stat Cards */}
      <div
        className="kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
          gap: '16px'
        }}
      >
        {/* KPI 1: Total Enquiries */}
        <div
          className="dashboard-kpi-card"
          onClick={() => onNavigateTab('leads')}
          title="Click to view all student enquiries"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Enquiries</span>
              <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}>
                <Users size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {totalLeads}
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Active student pipeline</span>
            <span className="card-hover-arrow" style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              Open <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* KPI 2: New Enquiries */}
        <div
          className="dashboard-kpi-card"
          onClick={() => onNavigateTab('leads')}
          title="Click to view uncontacted new leads"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>New Enquiries</span>
              <div style={{ background: '#fefce8', padding: '8px', borderRadius: '8px', color: '#ca8a04' }}>
                <UserPlus size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {newLeads}
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#ca8a04', fontWeight: 500 }}>Awaiting first outreach</span>
            <span className="card-hover-arrow" style={{ fontSize: '0.74rem', color: '#ca8a04', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              Contact <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* KPI 3: Admissions Converted */}
        <div
          className="dashboard-kpi-card"
          onClick={() => onNavigateTab('leads')}
          title="Click to view converted student enrollments"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Admissions Converted</span>
              <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '8px', color: '#059669' }}>
                <Award size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {convertedLeads}
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 500 }}>Enrolled & paid students</span>
            <span className="card-hover-arrow" style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              View <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* KPI 4: Conversion Rate */}
        <div
          className="dashboard-kpi-card"
          onClick={() => onNavigateTab('leads')}
          title="Click to analyze lead conversion pipeline"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Conversion Rate</span>
              <div style={{ background: '#f5f3ff', padding: '8px', borderRadius: '8px', color: '#7c3aed' }}>
                <TrendingUp size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>
              {conversionRate}%
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Converted / Total leads</span>
            <span className="card-hover-arrow" style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              Explore <ArrowRight size={12} />
            </span>
          </div>
        </div>

        {/* KPI 5: Overdue Tasks */}
        <div
          className="dashboard-kpi-card"
          onClick={() => onNavigateTab('followups')}
          style={{
            borderColor: overdueFollowUps.length > 0 ? '#fca5a5' : '#e2e8f0',
            background: overdueFollowUps.length > 0 ? '#fffafa' : '#ffffff'
          }}
          title="Click to manage overdue follow-ups"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: overdueFollowUps.length > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>
                Overdue Tasks
              </span>
              <div
                style={{
                  background: overdueFollowUps.length > 0 ? '#fee2e2' : '#f1f5f9',
                  padding: '8px',
                  borderRadius: '8px',
                  color: overdueFollowUps.length > 0 ? '#dc2626' : '#64748b'
                }}
              >
                <Clock size={18} />
              </div>
            </div>
            <div
              style={{
                fontSize: '1.9rem',
                fontWeight: 800,
                color: overdueFollowUps.length > 0 ? '#dc2626' : '#0f172a',
                letterSpacing: '-0.02em'
              }}
            >
              {overdueFollowUps.length}
            </div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: overdueFollowUps.length > 0 ? '#b91c1c' : '#64748b' }}>
              {overdueFollowUps.length > 0 ? 'Urgent callbacks needed' : 'All tasks up to date'}
            </span>
            <span className="card-hover-arrow" style={{ fontSize: '0.74rem', color: overdueFollowUps.length > 0 ? '#dc2626' : '#4f46e5', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>
              Manage <ArrowRight size={12} />
            </span>
          </div>
        </div>
      </div>

      {/* Two-Column Middle Section: Funnel Stages & Course Demand */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Clickable Pipeline Funnel / Stage Breakdown */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Admissions Pipeline Stages
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Click any stage to filter student leads
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('leads')}
              style={{
                background: '#eff6ff',
                color: '#2563eb',
                border: 'none',
                padding: '5px 10px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <span>View Table</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {statusCounts.map((item) => (
              <div
                key={item.status}
                onClick={() => onNavigateTab('leads')}
                style={{
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #f1f5f9',
                  background: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                className="dashboard-interactive-row"
                title={`Click to view ${item.status} enquiries`}
              >
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          width: '10px',
                          height: '10px',
                          borderRadius: '50%',
                          backgroundColor: item.color
                        }}
                      />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>
                        {item.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: item.bg,
                          color: item.color
                        }}
                      >
                        {item.count} ({item.percentage}%)
                      </span>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.max(item.percentage, item.count > 0 ? 4 : 0)}%`,
                        height: '100%',
                        backgroundColor: item.color,
                        borderRadius: '3px',
                        transition: 'width 0.4s ease'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Clickable Course Demand Breakdown */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Course Demand Breakdown
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Student interest distribution across academy curriculum
              </span>
            </div>
            <span
              style={{
                fontSize: '0.75rem',
                color: '#475569',
                background: '#f1f5f9',
                padding: '4px 8px',
                borderRadius: '6px',
                fontWeight: 600
              }}
            >
              {courseCounts.length} active courses
            </span>
          </div>

          {courseCounts.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
              <BookOpen size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No course enquiries recorded yet.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {courseCounts.map((c) => (
                <div
                  key={c.course}
                  onClick={() => onNavigateTab('leads')}
                  className="dashboard-interactive-row"
                  title={`Click to view students interested in ${c.course}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, display: 'block' }}>
                        {c.course}
                      </span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>
                        {c.percentage}% of overall academy demand
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        background: '#f0fdf4',
                        color: '#15803d',
                        border: '1px solid #bbf7d0',
                        padding: '3px 9px',
                        borderRadius: '12px'
                      }}
                    >
                      {c.count} lead{c.count > 1 ? 's' : ''}
                    </span>
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Two-Column Bottom Section: Clickable Recent Enquiries & Upcoming Follow-ups */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Clickable Recent Enquiries */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Recent Student Enquiries
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Click a student to view and edit details
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('leads')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <span>View all ({totalLeads})</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {recentLeads.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
              <Users size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No student enquiries in database.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => {
                    if (onSelectLead) {
                      onSelectLead(lead);
                    } else {
                      onNavigateTab('leads');
                    }
                  }}
                  className="dashboard-interactive-row"
                  title={`Click to open details for ${lead.full_name}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)',
                        color: '#ffffff',
                        fontWeight: 700,
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      {getInitials(lead.full_name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>
                        {lead.full_name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{lead.course_interest}</span>
                        <span>•</span>
                        <span style={{ color: '#94a3b8' }}>{formatRelativeTime(lead.created_at)}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <StatusBadge status={lead.status} />
                    <ChevronRight size={14} color="#94a3b8" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Clickable Upcoming Follow-up Tasks */}
        <div
          style={{
            background: '#ffffff',
            borderRadius: '14px',
            border: '1px solid #e2e8f0',
            padding: '22px',
            boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                Scheduled Follow-up Queue
              </h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>
                Upcoming counselor calls and student meetings
              </span>
            </div>
            <button
              type="button"
              onClick={() => onNavigateTab('followups')}
              style={{
                background: 'none',
                border: 'none',
                color: '#4f46e5',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              <span>Manage tasks</span>
              <ArrowRight size={14} />
            </button>
          </div>

          {upcomingFollowUps.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
              <Calendar size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No upcoming follow-ups scheduled.</p>
              <button
                type="button"
                onClick={() => onNavigateTab('followups')}
                style={{
                  marginTop: '10px',
                  background: '#f1f5f9',
                  border: '1px solid #e2e8f0',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: '#334155',
                  cursor: 'pointer'
                }}
              >
                + Schedule Follow-up
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingFollowUps.slice(0, 4).map((f) => {
                const dueDate = new Date(f.due_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
                return (
                  <div
                    key={f.id}
                    onClick={() => onNavigateTab('followups')}
                    className="dashboard-interactive-row"
                    title="Click to view in Follow-ups tab"
                  >
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 700 }}>
                          {f.lead?.full_name || 'Student Enquiry'}
                        </span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                          {dueDate}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.4 }}>
                        {f.note}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
