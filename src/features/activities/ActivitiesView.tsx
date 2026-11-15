import React from 'react';
import { History, User, Clock, ArrowRight } from 'lucide-react';
import { Activity, Lead } from '../../types';

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
  const sortedActivities = [...activities].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
          Activity Log & Audit Trail
        </h1>
        <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
          Historical record of lead creation, admissions, status updates, and counselor follow-ups.
        </p>
      </div>

      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', padding: '20px' }}>
        {sortedActivities.length === 0 ? (
          <div style={{ padding: '36px 12px', textAlign: 'center', color: '#64748b' }}>
            <History size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.1rem' }}>No Activities Recorded</h3>
            <p style={{ margin: 0, fontSize: '0.875rem' }}>Audit entries will appear as students are added and updated.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {sortedActivities.map((act) => {
              const relatedLead = leads.find((l) => l.id === act.lead_id);
              return (
                <div
                  key={act.id}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderRadius: '8px',
                    border: '1px solid #f1f5f9',
                    background: '#f8fafc',
                    gap: '12px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.9rem', color: '#0f172a', fontWeight: 500 }}>
                      {act.description}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '6px', fontSize: '0.75rem', color: '#64748b' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={12} /> {new Date(act.created_at).toLocaleString()}
                      </span>
                      {act.actor && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <User size={12} /> by {act.actor.full_name}
                        </span>
                      )}
                    </div>
                  </div>

                  {relatedLead && (
                    <button
                      type="button"
                      onClick={() => onSelectLead(relatedLead)}
                      style={{
                        padding: '4px 10px',
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        fontSize: '0.75rem',
                        color: '#2563eb',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span>{relatedLead.full_name}</span>
                      <ArrowRight size={12} />
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
