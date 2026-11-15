import React, { useState } from 'react';
import { Database, AlertTriangle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { checkSupabaseConfig } from '../../lib/supabaseClient';

export const ConfigWarning: React.FC = () => {
  const status = checkSupabaseConfig();
  const [isExpanded, setIsExpanded] = useState(false);

  if (status.isConfigured) {
    return null;
  }

  return (
    <div
      role="alert"
      style={{
        background: '#fffbeb',
        borderBottom: '1px solid #fef3c7',
        borderLeft: '4px solid #f59e0b',
        padding: '10px 24px',
        fontSize: '0.825rem',
        color: '#92400e'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={18} color="#d97706" />
          <span>
            <strong>Supabase Offline / Demo Mode:</strong> {status.message}{' '}
            <em>(Currently operating with local student data).</em>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              background: 'none',
              border: 'none',
              color: '#b45309',
              fontWeight: 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <span>{isExpanded ? 'Hide Setup Instructions' : 'How to Connect Supabase'}</span>
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          style={{
            marginTop: '12px',
            padding: '12px 16px',
            background: '#ffffff',
            borderRadius: '6px',
            border: '1px solid #fde68a',
            color: '#1e293b',
            fontSize: '0.8rem'
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: '8px', color: '#0f172a' }}>
            Quick 3-Step Supabase Connection Guide:
          </div>
          <ol style={{ margin: 0, paddingLeft: '20px', lineHeight: 1.6 }}>
            <li>
              Log in to{' '}
              <a href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>
                supabase.com <ExternalLink size={11} style={{ display: 'inline' }} />
              </a>{' '}
              and create a project for <strong>BrightPath CRM</strong>.
            </li>
            <li>
              Open <strong>Project Settings &gt; API</strong>, and copy your <strong>Project URL</strong> and <strong>anon (public)</strong> API key.
            </li>
            <li>
              Create a local <code>.env</code> file in your project root with:
              <pre
                style={{
                  background: '#0f172a',
                  color: '#e2e8f0',
                  padding: '8px 12px',
                  borderRadius: '6px',
                  margin: '6px 0',
                  fontSize: '0.75rem',
                  overflowX: 'auto'
                }}
              >
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
              </pre>
            </li>
            <li>Run the migration in <code>supabase/migrations/20261115000000_init_schema.sql</code> inside the Supabase SQL Editor.</li>
          </ol>
        </div>
      )}
    </div>
  );
};
