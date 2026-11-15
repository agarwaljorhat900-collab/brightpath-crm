import { useState, useMemo, useEffect, useCallback } from 'react';
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
  const [profiles] = useState(MOCK_PROFILES);

  // Load from live Supabase if connected
  const refreshLiveSupabaseData = useCallback(async () => {
    if (!isSupabaseConnected) return;

    try {
      const [leadsRes, followUpsRes, activitiesRes] = await Promise.all([
        leadService.fetchLeads(),
        followUpService.fetchFollowUps(),
        activityService.fetchActivities()
      ]);

      if (leadsRes.data && leadsRes.data.length > 0) {
        setLeads(leadsRes.data);
      }
      if (followUpsRes.data && followUpsRes.data.length > 0) {
        setFollowUps(followUpsRes.data);
      }
      if (activitiesRes.data && activitiesRes.data.length > 0) {
        setActivities(activitiesRes.data);
      }
    } catch (err) {
      console.warn('Could not fetch from live Supabase:', err);
    }
  }, [isSupabaseConnected]);

  useEffect(() => {
    refreshLiveSupabaseData();
  }, [refreshLiveSupabaseData]);

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

    // Live Supabase persist if configured
    if (isSupabaseConnected) {
      const { data: dbLead } = await leadService.createLead({
        ...leadData,
        created_by: activeUserId
      });
      if (dbLead) {
        await activityService.logActivity({
          lead_id: dbLead.id,
          actor_id: activeUserId,
          activity_type: 'lead_created',
          description: `New enquiry registered for ${dbLead.full_name} (${dbLead.course_interest}) via ${dbLead.source}`
        });
        refreshLiveSupabaseData();
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
    if (isSupabaseConnected) {
      await leadService.updateLeadStatus(leadId, newStatus, lostReason);
      await activityService.logActivity({
        lead_id: leadId,
        actor_id: activeUserId,
        activity_type: 'status_changed',
        description
      });
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
    if (isSupabaseConnected) {
      await followUpService.createFollowUp({
        lead_id: leadId,
        assigned_to: targetLead.assigned_to || activeUserId,
        due_at: new Date(dueAt).toISOString(),
        note,
        status: 'pending',
        created_by: activeUserId
      });
      await activityService.logActivity({
        lead_id: leadId,
        actor_id: activeUserId,
        activity_type: 'follow_up_scheduled',
        description: `Follow-up scheduled for ${new Date(dueAt).toLocaleString()}: "${note}"`
      });
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

      if (isSupabaseConnected) {
        await followUpService.updateFollowUpStatus(followUpId, nextStatus);
        await activityService.logActivity({
          lead_id: followUpItem.lead_id,
          actor_id: activeUserId,
          activity_type: 'follow_up_completed',
          description
        });
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
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      {/* Main View Area */}
      <main className="crm-main">
        <TopBar
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenCreateLead={handleQuickAddEnquiry}
          currentRole={currentRole}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
        />

        <ConfigWarning />

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
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
}
