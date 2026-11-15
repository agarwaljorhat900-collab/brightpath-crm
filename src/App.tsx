import { useState, useMemo, useEffect, useCallback } from 'react';
import { Lock, ShieldCheck, ArrowRight, Eye } from 'lucide-react';
import { Sidebar } from './components/layout/Sidebar';
import { TopBar } from './components/layout/TopBar';
import { ConfigWarning } from './components/common/ConfigWarning';
import { AuthModal } from './components/auth/AuthModal';
import { DashboardView } from './features/dashboard/DashboardView';
import { LeadsView } from './features/leads/LeadsView';
import { FollowUpsView } from './features/followups/FollowUpsView';
import { ActivitiesView } from './features/activities/ActivitiesView';
import { useAuth } from './context/AuthContext';
import { leadService } from './services/leadService';
import { followUpService } from './services/followUpService';
import { activityService } from './services/activityService';
import { profileService } from './services/profileService';
import {
  MOCK_LEADS,
  MOCK_FOLLOW_UPS,
  MOCK_ACTIVITIES,
  MOCK_PROFILES
} from './services/mockData';
import { Lead, FollowUp, Activity, UserRole, LeadStatus, FollowUpStatus } from './types';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [isGuestDemoMode, setIsGuestDemoMode] = useState(false);

  const {
    user,
    profile,
    role: currentRole,
    setDemoRole,
    isSupabaseConnected
  } = useAuth();

  // Core Data State
  const [leads, setLeads] = useState<Lead[]>(MOCK_LEADS);
  const [followUps, setFollowUps] = useState<FollowUp[]>(MOCK_FOLLOW_UPS);
  const [activities, setActivities] = useState<Activity[]>(MOCK_ACTIVITIES);
  const [profiles, setProfiles] = useState(MOCK_PROFILES);

  // UUID helper
  const isValidUUID = (val?: string | null): boolean => {
    if (!val) return false;
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(val);
  };

  // Load from live Supabase if connected
  const refreshLiveSupabaseData = useCallback(async () => {
    if (!isSupabaseConnected) return;

    try {
      const [leadsRes, followUpsRes, activitiesRes, profilesRes] = await Promise.all([
        leadService.fetchLeads(),
        followUpService.fetchFollowUps(),
        activityService.fetchActivities(),
        profileService.fetchProfiles()
      ]);

      if (user && leadsRes.data !== null) {
        setLeads(leadsRes.data);
      }
      if (user && followUpsRes.data !== null) {
        setFollowUps(followUpsRes.data);
      }
      if (user && activitiesRes.data !== null) {
        setActivities(activitiesRes.data);
      }
      if (profilesRes.data && profilesRes.data.length > 0) {
        setProfiles(profilesRes.data);
      }
    } catch (err) {
      console.warn('Could not fetch from live Supabase:', err);
    }
  }, [isSupabaseConnected, user]);

  useEffect(() => {
    if (user) {
      refreshLiveSupabaseData();
    } else if (isGuestDemoMode) {
      setLeads(MOCK_LEADS);
      setFollowUps(MOCK_FOLLOW_UPS);
      setActivities(MOCK_ACTIVITIES);
      setProfiles(MOCK_PROFILES);
    }
  }, [user, isGuestDemoMode, refreshLiveSupabaseData]);

  // Current active user name & id
  const activeUserId = user?.id || (currentRole === 'admin' ? 'p-1' : currentRole === 'manager' ? 'p-2' : 'p-3');
  const activeUserName = profile?.full_name || (currentRole === 'admin' ? 'Mehul Agarwal' : currentRole === 'manager' ? 'Rohit Sharma' : 'Pooja Nair');

  // Role Scoping (Section 12 & 15 of Master Spec)
  // Counsellors only access leads assigned to them or created by them.
  // Managers and Admins access team-wide data.
  const accessibleLeads = useMemo(() => {
    if (currentRole === 'admin' || currentRole === 'manager') {
      return leads;
    }
    return leads.filter(
      (l) => l.assigned_to === activeUserId || l.created_by === activeUserId
    );
  }, [leads, currentRole, activeUserId]);

  const accessibleFollowUps = useMemo(() => {
    const accessibleLeadIds = new Set(accessibleLeads.map((l) => l.id));
    return followUps.filter((f) => accessibleLeadIds.has(f.lead_id));
  }, [followUps, accessibleLeads]);

  const accessibleActivities = useMemo(() => {
    const accessibleLeadIds = new Set(accessibleLeads.map((l) => l.id));
    return activities.filter((a) => accessibleLeadIds.has(a.lead_id));
  }, [activities, accessibleLeads]);

  // Overdue follow-up count (pending AND due_at < now)
  const overdueCount = useMemo(() => {
    const now = new Date();
    return accessibleFollowUps.filter(
      (f) => f.status === 'pending' && new Date(f.due_at) < now
    ).length;
  }, [accessibleFollowUps]);

  // Actions & Mutators
  const handleCreateLead = async (leadData: Omit<Lead, 'id' | 'created_at'>) => {
    const localId = `l-${Date.now()}`;
    const newLead: Lead = {
      ...leadData,
      id: localId,
      created_at: new Date().toISOString(),
      created_by: activeUserId,
      assignee: profiles.find((p) => p.id === leadData.assigned_to) || null
    };

    // Optimistic local update
    setLeads((prev) => [newLead, ...prev]);

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      lead_id: localId,
      actor_id: activeUserId,
      activity_type: 'lead_created',
      description: `New enquiry registered for ${newLead.full_name} (${newLead.course_interest}) via ${newLead.source}`,
      created_at: new Date().toISOString(),
      actor: { id: activeUserId, full_name: activeUserName, role: currentRole }
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Live Supabase persist if configured and user is signed in
    if (isSupabaseConnected && user) {
      const dbPayload = {
        full_name: leadData.full_name,
        phone: leadData.phone,
        email: leadData.email || null,
        course_interest: leadData.course_interest,
        source: leadData.source,
        status: leadData.status,
        notes: leadData.notes || null,
        assigned_to: isValidUUID(leadData.assigned_to) ? leadData.assigned_to : user.id,
        created_by: user.id
      };

      const { data: dbLead, error } = await leadService.createLead(dbPayload);
      if (dbLead) {
        setLeads((prev) => [dbLead, ...prev.filter((l) => l.id !== localId)]);
        await activityService.logActivity({
          lead_id: dbLead.id,
          actor_id: user.id,
          activity_type: 'lead_created',
          description: `New enquiry registered for ${dbLead.full_name} (${dbLead.course_interest}) via ${dbLead.source}`
        });
        refreshLiveSupabaseData();
      } else if (error) {
        console.error('Supabase lead insertion error:', error.message);
      }
    }
  };

  const handleUpdateLeadStatus = async (leadId: string, newStatus: LeadStatus, lostReason?: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    setLeads((prev) =>
      prev.map((l) =>
        l.id === leadId
          ? {
              ...l,
              status: newStatus,
              lost_reason: newStatus === 'Lost' ? (lostReason ?? l.lost_reason) : null,
              updated_at: new Date().toISOString()
            }
          : l
      )
    );

    const description =
      newStatus === 'Lost'
        ? `Status updated to Lost. Reason: ${lostReason || 'Not specified'}`
        : newStatus === 'Converted'
        ? `Enquiry Converted! Student ${targetLead.full_name} enrolled in ${targetLead.course_interest}.`
        : `Status changed from ${targetLead.status} to ${newStatus}`;

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      lead_id: leadId,
      actor_id: activeUserId,
      activity_type: 'status_changed',
      description,
      created_at: new Date().toISOString(),
      actor: { id: activeUserId, full_name: activeUserName, role: currentRole }
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Live Supabase update
    if (isSupabaseConnected && user && isValidUUID(leadId)) {
      await leadService.updateLeadStatus(leadId, newStatus, lostReason);
      await activityService.logActivity({
        lead_id: leadId,
        actor_id: user.id,
        activity_type: 'status_changed',
        description
      });
      refreshLiveSupabaseData();
    }
  };

  const handleScheduleFollowUp = async (leadId: string, dueAt: string, note: string) => {
    const targetLead = leads.find((l) => l.id === leadId);
    if (!targetLead) return;

    const newFollowUp: FollowUp = {
      id: `f-${Date.now()}`,
      lead_id: leadId,
      assigned_to: targetLead.assigned_to || activeUserId,
      due_at: new Date(dueAt).toISOString(),
      note,
      status: 'pending',
      created_by: activeUserId,
      created_at: new Date().toISOString(),
      lead: targetLead,
      assignee: { id: activeUserId, full_name: activeUserName, role: currentRole }
    };

    setFollowUps((prev) => [newFollowUp, ...prev]);

    const newActivity: Activity = {
      id: `act-${Date.now()}`,
      lead_id: leadId,
      actor_id: activeUserId,
      activity_type: 'follow_up_scheduled',
      description: `Follow-up scheduled for ${new Date(dueAt).toLocaleString()}: "${note}"`,
      created_at: new Date().toISOString(),
      actor: { id: activeUserId, full_name: activeUserName, role: currentRole }
    };
    setActivities((prev) => [newActivity, ...prev]);

    // Live Supabase persist
    if (isSupabaseConnected && user && isValidUUID(leadId)) {
      const followUpPayload = {
        lead_id: leadId,
        assigned_to: isValidUUID(targetLead.assigned_to) ? targetLead.assigned_to : user.id,
        due_at: new Date(dueAt).toISOString(),
        note,
        status: 'pending' as FollowUpStatus,
        created_by: user.id
      };
      const { data: dbFollowUp } = await followUpService.createFollowUp(followUpPayload);
      if (dbFollowUp) {
        setFollowUps((prev) => [dbFollowUp, ...prev.filter((f) => f.id !== newFollowUp.id)]);
      }
      await activityService.logActivity({
        lead_id: leadId,
        actor_id: user.id,
        activity_type: 'follow_up_scheduled',
        description: `Follow-up scheduled for ${new Date(dueAt).toLocaleString()}: "${note}"`
      });
      refreshLiveSupabaseData();
    }
  };

  const handleToggleFollowUpStatus = async (followUpId: string, currentStatus: FollowUpStatus) => {
    const nextStatus: FollowUpStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const completedAt = nextStatus === 'completed' ? new Date().toISOString() : null;

    setFollowUps((prev) =>
      prev.map((f) =>
        f.id === followUpId
          ? {
              ...f,
              status: nextStatus,
              completed_at: completedAt
            }
          : f
      )
    );

    const followUpItem = followUps.find((f) => f.id === followUpId);
    if (followUpItem) {
      const description =
        nextStatus === 'completed'
          ? `Follow-up marked completed: "${followUpItem.note}"`
          : `Follow-up reopened: "${followUpItem.note}"`;

      const newActivity: Activity = {
        id: `act-${Date.now()}`,
        lead_id: followUpItem.lead_id,
        actor_id: activeUserId,
        activity_type: 'follow_up_completed',
        description,
        created_at: new Date().toISOString(),
        actor: { id: activeUserId, full_name: activeUserName, role: currentRole }
      };
      setActivities((prev) => [newActivity, ...prev]);

      if (isSupabaseConnected && user && isValidUUID(followUpId)) {
        await followUpService.updateFollowUpStatus(followUpId, nextStatus);
        await activityService.logActivity({
          lead_id: followUpItem.lead_id,
          actor_id: user.id,
          activity_type: 'follow_up_completed',
          description
        });
        refreshLiveSupabaseData();
      }
    }
  };

  const handleQuickAddEnquiry = () => {
    setActiveTab('leads');
    const addBtn = document.getElementById('btn-add-enquiry');
    if (addBtn) {
      addBtn.click();
    }
  };

  const handleSelectLeadFromAnywhere = (_lead: Lead) => {
    setActiveTab('leads');
  };

  return (
    <div className="crm-container">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        leadsCount={accessibleLeads.length}
        overdueCount={overdueCount}
        currentRole={currentRole}
        setCurrentRole={setDemoRole}
        userName={activeUserName}
        onOpenAuth={() => {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }}
      />

      {/* Main View Area */}
      <main className="crm-main">
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCreateLead={handleQuickAddEnquiry}
          currentRole={currentRole}
          onOpenAuthModal={() => {
            setAuthModalMode('signin');
            setIsAuthModalOpen(true);
          }}
        />

        <ConfigWarning />

        {/* Private Staff Portal Gate when unauthenticated and live Supabase connected */}
        {!user && isSupabaseConnected && !isGuestDemoMode ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 'calc(100vh - 120px)',
              padding: '24px'
            }}
          >
            <div
              style={{
                background: '#ffffff',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                padding: '44px 36px',
                maxWidth: '480px',
                width: '100%',
                textAlign: 'center',
                boxShadow: '0 20px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)'
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
                  color: '#ffffff',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '20px',
                  boxShadow: '0 8px 20px -4px rgba(79, 70, 229, 0.35)'
                }}
              >
                <Lock size={28} />
              </div>

              <h2 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#0f172a', margin: '0 0 10px' }}>
                Private Staff Portal
              </h2>

              <p style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 28px' }}>
                BrightPath Academy CRM contains confidential student admission enquiries. Please sign in with your staff credentials to access your leads and follow-ups.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signin');
                    setIsAuthModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '8px',
                    background: '#4f46e5',
                    color: '#ffffff',
                    fontWeight: 600,
                    fontSize: '0.925rem',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                >
                  <span>Sign In with Staff Account</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setAuthModalMode('signup');
                    setIsAuthModalOpen(true);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '8px',
                    background: '#ffffff',
                    color: '#334155',
                    fontWeight: 600,
                    fontSize: '0.925rem',
                    border: '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  Register New Counsellor Account
                </button>
              </div>

              <div style={{ marginTop: '24px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setIsGuestDemoMode(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94a3b8',
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  Explore in Workshop Demo Mode (Mock Records)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {isGuestDemoMode && !user && (
              <div
                style={{
                  background: '#f8fafc',
                  borderBottom: '1px solid #e2e8f0',
                  padding: '8px 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  color: '#475569'
                }}
              >
                <span>
                  <strong>Demo Mode Active:</strong> You are previewing with sample student data.
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthModalMode('signin');
                      setIsAuthModalOpen(true);
                    }}
                    style={{
                      background: '#4f46e5',
                      color: '#ffffff',
                      border: 'none',
                      padding: '4px 10px',
                      borderRadius: '5px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Sign In to Live Database
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsGuestDemoMode(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#64748b',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      textDecoration: 'underline'
                    }}
                  >
                    Return to Private Lock Screen
                  </button>
                </div>
              </div>
            )}

            <div className="crm-content" style={{ padding: '24px 32px' }}>
              {activeTab === 'dashboard' && (
                <DashboardView
                  leads={accessibleLeads}
                  followUps={accessibleFollowUps}
                  currentRole={currentRole}
                  onNavigateTab={setActiveTab}
                  onSelectLead={handleSelectLeadFromAnywhere}
                />
              )}

              {activeTab === 'leads' && (
                <LeadsView
                  leads={accessibleLeads}
                  profiles={profiles}
                  followUps={accessibleFollowUps}
                  activities={accessibleActivities}
                  currentRole={currentRole}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  onUpdateLeadStatus={handleUpdateLeadStatus}
                  onCreateLead={handleCreateLead}
                  onScheduleFollowUp={handleScheduleFollowUp}
                />
              )}

              {activeTab === 'followups' && (
                <FollowUpsView
                  followUps={accessibleFollowUps}
                  leads={accessibleLeads}
                  onToggleFollowUpStatus={handleToggleFollowUpStatus}
                  onSelectLead={handleSelectLeadFromAnywhere}
                  onScheduleFollowUp={handleScheduleFollowUp}
                />
              )}

              {activeTab === 'activities' && (
                <ActivitiesView
                  activities={accessibleActivities}
                  leads={accessibleLeads}
                  onSelectLead={handleSelectLeadFromAnywhere}
                />
              )}
            </div>
          </>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </div>
  );
}
