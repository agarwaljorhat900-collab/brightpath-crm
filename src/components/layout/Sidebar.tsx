import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarCheck,
  History,
  GraduationCap,
  ShieldCheck,
  UserCheck,
  Database
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  leadsCount: number;
  overdueCount: number;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  userName: string;
  onOpenAuth: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  leadsCount,
  overdueCount,
  currentRole,
  setCurrentRole,
  userName,
  onOpenAuth
}) => {
  const { isSupabaseConnected, user } = useAuth();

  return (
    <aside className="crm-sidebar">
      {/* Brand Header */}
      <div className="brand-header">
        <div className="brand-icon">
          <GraduationCap size={22} color="#ffffff" />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span className="brand-title">BrightPath</span>
          <span style={{ fontSize: '0.7rem', color: '#94a3b8', letterSpacing: '0.05em' }}>
            ACADEMY CRM
          </span>
        </div>
        <span
          className="brand-badge"
          style={{
            background: isSupabaseConnected ? '#065f46' : '#312e81',
            color: isSupabaseConnected ? '#a7f3d0' : '#a5b4fc'
          }}
          title={isSupabaseConnected ? 'Connected to Supabase PostgreSQL' : 'Local Workshop Prototype'}
        >
          {isSupabaseConnected ? 'CLOUD' : 'DEMO'}
        </span>
      </div>

      {/* Navigation */}
      <nav className="nav-section">
        <div className="nav-label">Main Navigation</div>

        <button
          type="button"
          className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`}
          onClick={() => setActiveTab('leads')}
        >
          <Users size={18} />
          <span>Student Enquiries</span>
          <span className="badge">{leadsCount}</span>
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'followups' ? 'active' : ''}`}
          onClick={() => setActiveTab('followups')}
        >
          <CalendarCheck size={18} />
          <span>Follow-ups</span>
          {overdueCount > 0 && (
            <span
              className="badge"
              style={{ backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 700 }}
              title={`${overdueCount} overdue`}
            >
              {overdueCount}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`nav-item ${activeTab === 'activities' ? 'active' : ''}`}
          onClick={() => setActiveTab('activities')}
        >
          <History size={18} />
          <span>Activity Log</span>
        </button>
      </nav>

      {/* Workshop Role Simulator & User Profile */}
      <div style={{ marginTop: 'auto', padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        {!user && (
          <div style={{ marginBottom: '12px' }}>
            <label
              htmlFor="role-simulator"
              style={{
                fontSize: '0.68rem',
                color: '#94a3b8',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                display: 'block',
                marginBottom: '4px'
              }}
            >
              Role Simulator (Workshop)
            </label>
            <select
              id="role-simulator"
              value={currentRole}
              onChange={(e) => setCurrentRole(e.target.value as UserRole)}
              style={{
                width: '100%',
                backgroundColor: '#1e293b',
                color: '#f8fafc',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '6px 8px',
                fontSize: '0.8rem',
                cursor: 'pointer'
              }}
            >
              <option value="admin">Administrator (Full Access)</option>
              <option value="manager">Manager (Team Oversight)</option>
              <option value="counsellor">Counsellor (Assigned Only)</option>
            </select>
          </div>
        )}

        <div
          className="user-profile"
          onClick={onOpenAuth}
          style={{ cursor: 'pointer' }}
          title="Click to manage account / sign in"
        >
          <div className="user-avatar">
            {currentRole === 'admin' ? (
              <ShieldCheck size={16} />
            ) : (
              <UserCheck size={16} />
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{userName}</span>
            <span className="user-role" style={{ textTransform: 'capitalize' }}>
              {currentRole} {user ? '(Cloud User)' : '(Demo)'}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};
