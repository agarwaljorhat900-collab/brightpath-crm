import React from 'react';
import {
  Users,
  UserPlus,
  Award,
  TrendingUp,
  AlertTriangle,
  Clock,
  ArrowRight,
  BookOpen
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
  onNavigateTab
}) => {
  const now = new Date();

  // Metrics definition from Master Spec Section 15
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New').length;
  const convertedLeads = leads.filter((l) => l.status === 'Converted').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // Overdue: pending AND due_at < now
  const overdueFollowUps = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at) < now
  );

  const upcomingFollowUps = followUps
    .filter((f) => f.status === 'pending' && new Date(f.due_at) >= now)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

  // Status breakdown
  const statusCounts = Object.keys(STATUS_CONFIG).map((status) => {
    const count = leads.filter((l) => l.status === status).length;
    const percentage = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
    return { status, count, percentage };
  });

  // Course interest breakdown
  const courseCounts = COURSES.map((course) => {
    const count = leads.filter((l) => l.course_interest === course).length;
    return { course, count };
  }).filter((c) => c.count > 0);

  // Recent enquiries
  const recentLeads = [...leads]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Academy Overview
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Live metrics and student pipeline performance for BrightPath Academy.
          </p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <span
            style={{
              fontSize: '0.75rem',
              backgroundColor: '#e2e8f0',
              padding: '4px 8px',
              borderRadius: '4px',
              color: '#334155'
            }}
          >
            Scope: <strong style={{ textTransform: 'capitalize' }}>{currentRole}</strong> view
          </span>
        </div>
      </div>

      {/* Overdue Alert Banner */}
      {overdueFollowUps.length > 0 && (
        <div
          role="alert"
          style={{
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <AlertTriangle size={20} color="#dc2626" />
            <div>
              <strong style={{ color: '#991b1b', fontSize: '0.875rem' }}>
                Action Required: {overdueFollowUps.length} Overdue Follow-up{overdueFollowUps.length > 1 ? 's' : ''}
              </strong>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#b91c1c' }}>
                Prospective students are waiting for a counselor response.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('followups')}
            style={{
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Review Overdue
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div
        className="kpi-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px'
        }}
      >
        <div className="kpi-card" style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Total Enquiries</span>
            <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>{totalLeads}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Accessible in current role</span>
        </div>

        <div className="kpi-card" style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>New Enquiries</span>
            <div style={{ background: '#fefce8', padding: '8px', borderRadius: '8px', color: '#ca8a04' }}>
              <UserPlus size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>{newLeads}</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Awaiting initial contact</span>
        </div>

        <div className="kpi-card" style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Admissions Converted</span>
            <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '8px', color: '#059669' }}>
              <Award size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>{convertedLeads}</div>
          <span style={{ fontSize: '0.72rem', color: '#059669' }}>Enrolled students</span>
        </div>

        <div className="kpi-card" style={{ background: '#ffffff', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 500 }}>Conversion Rate</span>
            <div style={{ background: '#f5f3ff', padding: '8px', borderRadius: '8px', color: '#7c3aed' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: '#0f172a' }}>{conversionRate}%</div>
          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Converted / Total × 100</span>
        </div>

        <div
          className="kpi-card"
          style={{
            background: overdueFollowUps.length > 0 ? '#fff5f5' : '#ffffff',
            padding: '16px',
            borderRadius: '10px',
            border: `1px solid ${overdueFollowUps.length > 0 ? '#fecaca' : '#e2e8f0'}`
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: overdueFollowUps.length > 0 ? '#b91c1c' : '#64748b', fontWeight: 500 }}>
              Overdue Follow-ups
            </span>
            <div style={{ background: overdueFollowUps.length > 0 ? '#fee2e2' : '#f1f5f9', padding: '8px', borderRadius: '8px', color: overdueFollowUps.length > 0 ? '#dc2626' : '#64748b' }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 700, color: overdueFollowUps.length > 0 ? '#dc2626' : '#0f172a' }}>
            {overdueFollowUps.length}
          </div>
          <span style={{ fontSize: '0.72rem', color: overdueFollowUps.length > 0 ? '#b91c1c' : '#64748b' }}>
            Pending past due date
          </span>
        </div>
      </div>

      {/* Two-Column Distribution & Upcoming */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Pipeline Distribution */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
            Enquiries by Status
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {statusCounts.map((item) => (
              <div key={item.status}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '4px' }}>
                  <span style={{ color: '#334155', fontWeight: 500 }}>{item.status}</span>
                  <span style={{ color: '#64748b' }}>
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div
                    style={{
                      width: `${item.percentage}%`,
                      height: '100%',
                      background: STATUS_CONFIG[item.status as keyof typeof STATUS_CONFIG]?.text || '#2563eb',
                      borderRadius: '4px'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Popular Course Interests */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: '0 0 16px 0' }}>
            Course Demand Breakdown
          </h2>
          {courseCounts.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No enquiry data yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {courseCounts.map((c) => (
                <div
                  key={c.course}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    background: '#f8fafc',
                    border: '1px solid #f1f5f9'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <BookOpen size={16} color="#64748b" />
                    <span style={{ fontSize: '0.85rem', color: '#1e293b', fontWeight: 500 }}>
                      {c.course}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      background: '#e0f2fe',
                      color: '#0369a1',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}
                  >
                    {c.count} leads
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Enquiries & Upcoming Follow-ups */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '20px'
        }}
      >
        {/* Recent Enquiries */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Recent Enquiries
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('leads')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              View all <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #f1f5f9'
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: '#0f172a' }}>
                    {lead.full_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    {lead.course_interest} • {lead.source}
                  </div>
                </div>
                <StatusBadge status={lead.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
              Upcoming Follow-ups
            </h2>
            <button
              type="button"
              onClick={() => onNavigateTab('followups')}
              style={{
                background: 'none',
                border: 'none',
                color: '#2563eb',
                fontSize: '0.8rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer'
              }}
            >
              Manage <ArrowRight size={14} />
            </button>
          </div>

          {upcomingFollowUps.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>No upcoming follow-ups scheduled.</p>
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
                    style={{
                      padding: '10px 12px',
                      borderRadius: '6px',
                      border: '1px solid #f1f5f9',
                      background: '#f8fafc'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#2563eb', fontWeight: 600, marginBottom: '2px' }}>
                      <span>{f.lead?.full_name || 'Enquiry'}</span>
                      <span style={{ color: '#64748b', fontWeight: 400 }}>{dueDate}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155' }}>{f.note}</p>
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
