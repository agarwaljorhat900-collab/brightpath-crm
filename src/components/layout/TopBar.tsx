import React from 'react';
import { Search, Plus, Shield, LogIn, LogOut, User } from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onOpenCreateLead: () => void;
  currentRole: UserRole;
  onOpenAuthModal: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  searchQuery,
  setSearchQuery,
  onOpenCreateLead,
  currentRole,
  onOpenAuthModal
}) => {
  const { user, profile, signOut, isSupabaseConnected } = useAuth();

  return (
    <header className="crm-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
        <div className="search-box" style={{ maxWidth: '420px', width: '100%' }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            placeholder="Search student, course, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search records"
          />
        </div>
      </div>

      <div className="topbar-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            backgroundColor: '#f1f5f9',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: '#475569',
            fontWeight: 500
          }}
        >
          <Shield size={14} color="#64748b" />
          <span>Scope:</span>
          <strong style={{ textTransform: 'capitalize', color: '#0f172a' }}>{currentRole}</strong>
        </div>

        {/* Auth Action */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '0.8rem', color: '#334155', fontWeight: 600 }}>
              {profile?.full_name || user.email?.split('@')[0]}
            </span>
            <button
              type="button"
              onClick={() => signOut()}
              title="Sign Out"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 10px',
                background: '#f8fafc',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                fontSize: '0.75rem',
                cursor: 'pointer',
                color: '#64748b'
              }}
            >
              <LogOut size={13} />
              <span>Sign Out</span>
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onOpenAuthModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#1e293b'
            }}
          >
            <LogIn size={14} color="#2563eb" />
            <span>{isSupabaseConnected ? 'Sign In' : 'Auth / Demo'}</span>
          </button>
        )}

        <button
          type="button"
          className="btn-primary"
          onClick={onOpenCreateLead}
          id="btn-add-enquiry"
        >
          <Plus size={16} />
          <span>New Enquiry</span>
        </button>
      </div>
    </header>
  );
};
