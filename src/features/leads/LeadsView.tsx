import React, { useState } from 'react';
import {
  Search,
  Filter,
  Plus,
  Phone,
  Mail,
  User,
  BookOpen,
  Calendar,
  X,
  ExternalLink,
  RotateCcw,
  AlertCircle
} from 'lucide-react';
import { Lead, LeadStatus, Profile, FollowUp, Activity, UserRole } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { COURSES, LEAD_SOURCES, LEAD_STATUSES } from '../../constants';

interface LeadsViewProps {
  leads: Lead[];
  profiles: Profile[];
  followUps: FollowUp[];
  activities: Activity[];
  currentRole: UserRole;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onUpdateLeadStatus: (leadId: string, newStatus: LeadStatus, lostReason?: string) => void;
  onCreateLead: (leadData: Omit<Lead, 'id' | 'created_at'>) => void;
  onScheduleFollowUp: (leadId: string, dueAt: string, note: string) => void;
  selectedLeadId?: string | null;
  onClearSelectedLead?: () => void;
}

export const LeadsView: React.FC<LeadsViewProps> = ({
  leads,
  profiles,
  followUps,
  activities,
  currentRole,
  searchQuery,
  setSearchQuery,
  onUpdateLeadStatus,
  onCreateLead,
  onScheduleFollowUp,
  selectedLeadId,
  onClearSelectedLead
}) => {
  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [courseFilter, setCourseFilter] = useState<string>('All');

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  // Sync selectedLead when selectedLeadId changes from external navigation (Dashboard, etc.)
  React.useEffect(() => {
    if (selectedLeadId) {
      const match = leads.find((l) => l.id === selectedLeadId);
      if (match) {
        setSelectedLead(match);
      }
    }
  }, [selectedLeadId, leads]);

  const handleCloseDetail = () => {
    setSelectedLead(null);
    onClearSelectedLead?.();
  };
  const [lostReasonModalLead, setLostReasonModalLead] = useState<Lead | null>(null);
  const [lostReasonInput, setLostReasonInput] = useState('');
  const [isFollowUpModalOpen, setIsFollowUpModalOpen] = useState(false);

  // Follow-up form state
  const [followUpDueAt, setFollowUpDueAt] = useState('');
  const [followUpNote, setFollowUpNote] = useState('');

  // Form State for new lead
  const [formName, setFormName] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formCourse, setFormCourse] = useState<string>(COURSES[0]);
  const [formSource, setFormSource] = useState<string>(LEAD_SOURCES[0]);
  const [formAssignee, setFormAssignee] = useState<string>(profiles[0]?.id || '');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Reset Filters
  const handleResetFilters = () => {
    setStatusFilter('All');
    setSourceFilter('All');
    setCourseFilter('All');
    setSearchQuery('');
  };

  // Filter computation
  const filteredLeads = leads.filter((lead) => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      lead.full_name.toLowerCase().includes(q) ||
      (lead.email && lead.email.toLowerCase().includes(q)) ||
      lead.phone.toLowerCase().includes(q) ||
      lead.course_interest.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'All' || lead.status === statusFilter;
    const matchesSource = sourceFilter === 'All' || lead.source === sourceFilter;
    const matchesCourse = courseFilter === 'All' || lead.course_interest === courseFilter;

    return matchesSearch && matchesStatus && matchesSource && matchesCourse;
  });

  // Validate and submit new lead
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!formName.trim()) {
      errors.name = 'Student full name is required';
    }
    if (!formPhone.trim()) {
      errors.phone = 'Contact phone number is required';
    }
    if (formEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formEmail.trim())) {
      errors.email = 'Please provide a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    onCreateLead({
      full_name: formName.trim(),
      phone: formPhone.trim(),
      email: formEmail.trim() || null,
      course_interest: formCourse,
      source: formSource,
      status: 'New',
      assigned_to: formAssignee || null,
      notes: formNotes.trim() || null
    });

    // Reset form
    setFormName('');
    setFormPhone('');
    setFormEmail('');
    setFormNotes('');
    setFormErrors({});
    setIsCreateOpen(false);
  };

  const handleStatusChangeClick = (lead: Lead, newStatus: LeadStatus) => {
    if (newStatus === 'Lost') {
      setLostReasonModalLead(lead);
      setLostReasonInput('');
    } else {
      onUpdateLeadStatus(lead.id, newStatus);
      if (selectedLead?.id === lead.id) {
        setSelectedLead({ ...lead, status: newStatus });
      }
    }
  };

  const handleConfirmLost = () => {
    if (lostReasonModalLead) {
      onUpdateLeadStatus(lostReasonModalLead.id, 'Lost', lostReasonInput.trim() || 'No reason provided');
      if (selectedLead?.id === lostReasonModalLead.id) {
        setSelectedLead({ ...lostReasonModalLead, status: 'Lost', lost_reason: lostReasonInput.trim() });
      }
      setLostReasonModalLead(null);
      setLostReasonInput('');
    }
  };

  const handleCreateFollowUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !followUpDueAt || !followUpNote.trim()) return;

    onScheduleFollowUp(selectedLead.id, followUpDueAt, followUpNote.trim());
    setFollowUpDueAt('');
    setFollowUpNote('');
    setIsFollowUpModalOpen(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header and Actions */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="page-title" style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
            Student Enquiries
          </h1>
          <p className="page-subtitle" style={{ fontSize: '0.875rem', color: '#64748b', marginTop: '4px' }}>
            Track and manage prospective students from inquiry to admission.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={() => setIsCreateOpen(true)}
        >
          <Plus size={16} />
          <span>Add New Enquiry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '10px',
          border: '1px solid #e2e8f0',
          padding: '16px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          alignItems: 'center'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', fontSize: '0.85rem' }}>
          <Filter size={16} />
          <span style={{ fontWeight: 600 }}>Filter by:</span>
        </div>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          aria-label="Filter by Status"
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            background: '#ffffff'
          }}
        >
          <option value="All">All Statuses</option>
          {LEAD_STATUSES.map((st) => (
            <option key={st} value={st}>
              {st}
            </option>
          ))}
        </select>

        {/* Source Filter */}
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          aria-label="Filter by Source"
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            background: '#ffffff'
          }}
        >
          <option value="All">All Sources</option>
          {LEAD_SOURCES.map((src) => (
            <option key={src} value={src}>
              {src}
            </option>
          ))}
        </select>

        {/* Course Filter */}
        <select
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          aria-label="Filter by Course"
          style={{
            padding: '6px 12px',
            borderRadius: '6px',
            border: '1px solid #cbd5e1',
            fontSize: '0.85rem',
            background: '#ffffff',
            maxWidth: '220px'
          }}
        >
          <option value="All">All Courses</option>
          {COURSES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        {/* Reset */}
        {(statusFilter !== 'All' || sourceFilter !== 'All' || courseFilter !== 'All' || searchQuery) && (
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 12px',
              borderRadius: '6px',
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#475569',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <RotateCcw size={14} />
            <span>Reset Filters</span>
          </button>
        )}

        <div style={{ marginLeft: 'auto', fontSize: '0.8rem', color: '#64748b' }}>
          Showing <strong>{filteredLeads.length}</strong> of {leads.length} enquiries
        </div>
      </div>

      {/* Leads Table / Responsive List */}
      <div style={{ background: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        {filteredLeads.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <AlertCircle size={36} color="#94a3b8" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ margin: '0 0 6px 0', color: '#1e293b', fontSize: '1.1rem' }}>No Enquiries Found</h3>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.875rem' }}>
              No student records matched your search or active filters.
            </p>
            <button
              type="button"
              onClick={handleResetFilters}
              style={{
                marginTop: '16px',
                padding: '6px 16px',
                background: '#2563eb',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '12px 16px' }}>Student Name</th>
                  <th style={{ padding: '12px 16px' }}>Course Interest</th>
                  <th style={{ padding: '12px 16px' }}>Source</th>
                  <th style={{ padding: '12px 16px' }}>Contact</th>
                  <th style={{ padding: '12px 16px' }}>Status</th>
                  <th style={{ padding: '12px 16px' }}>Assigned To</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => {
                  const assigneeProfile = profiles.find((p) => p.id === lead.assigned_to) || lead.assignee;
                  return (
                    <tr
                      key={lead.id}
                      style={{
                        borderBottom: '1px solid #f1f5f9',
                        transition: 'background-color 0.15s'
                      }}
                      className="table-row-hover"
                    >
                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ fontWeight: 600, color: '#0f172a' }}>{lead.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          Added {new Date(lead.created_at).toLocaleDateString()}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <span style={{ color: '#334155', fontWeight: 500 }}>{lead.course_interest}</span>
                      </td>

                      <td style={{ padding: '14px 16px', color: '#64748b' }}>
                        {lead.source}
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', fontSize: '0.8rem' }}>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#0f172a' }}>
                            <Phone size={12} color="#64748b" /> {lead.phone}
                          </span>
                          {lead.email && (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#64748b' }}>
                              <Mail size={12} color="#64748b" /> {lead.email}
                            </span>
                          )}
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <StatusBadge status={lead.status} />
                          {/* Quick status selector */}
                          <select
                            value={lead.status}
                            onChange={(e) => handleStatusChangeClick(lead, e.target.value as LeadStatus)}
                            aria-label={`Change status for ${lead.full_name}`}
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              border: '1px solid #e2e8f0',
                              backgroundColor: '#ffffff',
                              color: '#475569',
                              cursor: 'pointer'
                            }}
                          >
                            {LEAD_STATUSES.map((st) => (
                              <option key={st} value={st}>
                                {st}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      <td style={{ padding: '14px 16px', color: '#475569' }}>
                        {assigneeProfile ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem' }}>
                            <User size={14} color="#64748b" />
                            {assigneeProfile.full_name}
                          </span>
                        ) : (
                          <span style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '0.8rem' }}>Unassigned</span>
                        )}
                      </td>

                      <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                        <button
                          type="button"
                          onClick={() => setSelectedLead(lead)}
                          style={{
                            padding: '6px 12px',
                            background: '#eff6ff',
                            color: '#2563eb',
                            border: '1px solid #bfdbfe',
                            borderRadius: '6px',
                            fontSize: '0.78rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <span>Details</span>
                          <ExternalLink size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* CREATE LEAD MODAL */}
      {isCreateOpen && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>New Student Enquiry</h2>
              <button type="button" onClick={() => setIsCreateOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Student Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Aarav Sharma"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${formErrors.name ? '#ef4444' : '#cbd5e1'}`, fontSize: '0.875rem' }}
                />
                {formErrors.name && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', margin: 0 }}>{formErrors.name}</p>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. +91 98765 43210"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${formErrors.phone ? '#ef4444' : '#cbd5e1'}`, fontSize: '0.875rem' }}
                  />
                  {formErrors.phone && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', margin: 0 }}>{formErrors.phone}</p>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: `1px solid ${formErrors.email ? '#ef4444' : '#cbd5e1'}`, fontSize: '0.875rem' }}
                  />
                  {formErrors.email && <p style={{ color: '#ef4444', fontSize: '0.75rem', marginTop: '4px', margin: 0 }}>{formErrors.email}</p>}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Course Interest *
                </label>
                <select
                  value={formCourse}
                  onChange={(e) => setFormCourse(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                >
                  {COURSES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Lead Source *
                  </label>
                  <select
                    value={formSource}
                    onChange={(e) => setFormSource(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                  >
                    {LEAD_SOURCES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                    Assign Counsellor
                  </label>
                  <select
                    value={formAssignee}
                    onChange={(e) => setFormAssignee(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', background: '#fff' }}
                  >
                    <option value="">Unassigned</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.role})</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                  Counselor Notes / Inquiries
                </label>
                <textarea
                  rows={3}
                  placeholder="Record initial questions, batch preferences, or prior education..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 20px' }}
                >
                  Save Enquiry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* LEAD DETAIL DRAWER / MODAL */}
      {selectedLead && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{selectedLead.full_name}</h2>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Enquiry ID: {selectedLead.id}</span>
              </div>
              <button type="button" onClick={handleCloseDetail} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Status and Action banner */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', display: 'block' }}>Current Status:</span>
                  <StatusBadge status={selectedLead.status} />
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsFollowUpModalOpen(true);
                    }}
                    style={{
                      padding: '6px 12px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    <Calendar size={14} /> Schedule Follow-up
                  </button>
                </div>
              </div>

              {selectedLead.lost_reason && (
                <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 14px', fontSize: '0.85rem', color: '#991b1b' }}>
                  <strong>Lost Reason:</strong> {selectedLead.lost_reason}
                </div>
              )}

              {/* Core Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', fontSize: '0.875rem' }}>
                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Course of Interest:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedLead.course_interest}</div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Lead Source:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedLead.source}</div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Phone Number:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedLead.phone}</div>
                </div>

                <div>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Email:</span>
                  <div style={{ fontWeight: 600, color: '#0f172a' }}>{selectedLead.email || 'None provided'}</div>
                </div>

                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: '#64748b', fontSize: '0.75rem' }}>Initial Notes:</span>
                  <div style={{ background: '#f8fafc', padding: '10px', borderRadius: '6px', marginTop: '4px', color: '#334155' }}>
                    {selectedLead.notes || 'No extra notes recorded.'}
                  </div>
                </div>
              </div>

              {/* Related Follow-ups */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 10px 0', color: '#0f172a' }}>
                  Scheduled Follow-ups
                </h3>
                {followUps.filter((f) => f.lead_id === selectedLead.id).length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No follow-ups recorded for this enquiry.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {followUps
                      .filter((f) => f.lead_id === selectedLead.id)
                      .map((f) => (
                        <div
                          key={f.id}
                          style={{
                            padding: '8px 12px',
                            borderRadius: '6px',
                            border: '1px solid #e2e8f0',
                            background: f.status === 'completed' ? '#f8fafc' : '#ffffff',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.85rem', fontWeight: 500, color: '#0f172a' }}>{f.note}</span>
                            <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>
                              Due: {new Date(f.due_at).toLocaleString()}
                            </span>
                          </div>
                          <span
                            style={{
                              fontSize: '0.75rem',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                              background: f.status === 'completed' ? '#dcfce7' : '#fef9c3',
                              color: f.status === 'completed' ? '#15803d' : '#854d0e'
                            }}
                          >
                            {f.status}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Related Activities */}
              <div>
                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, margin: '0 0 10px 0', color: '#0f172a' }}>
                  Activity Timeline
                </h3>
                {activities.filter((a) => a.lead_id === selectedLead.id).length === 0 ? (
                  <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No logged activity.</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {activities
                      .filter((a) => a.lead_id === selectedLead.id)
                      .map((a) => (
                        <div key={a.id} style={{ fontSize: '0.8rem', padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
                          <span style={{ color: '#0f172a' }}>{a.description}</span>
                          <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.72rem' }}>
                            {new Date(a.created_at).toLocaleString()}
                          </span>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* LOST REASON MODAL */}
      {lostReasonModalLead && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '440px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#991b1b', fontSize: '1.1rem' }}>Mark Enquiry as Lost</h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.85rem' }}>
              Per BrightPath CRM standards, please record why <strong>{lostReasonModalLead.full_name}</strong> is dropping out.
            </p>

            <textarea
              rows={3}
              placeholder="e.g. Enrolled in another institute, fee constraint, semester exams..."
              value={lostReasonInput}
              onChange={(e) => setLostReasonInput(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem', marginBottom: '16px' }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setLostReasonModalLead(null)}
                style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmLost}
                style={{ padding: '8px 16px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}
              >
                Confirm Lost
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SCHEDULE FOLLOW UP MODAL */}
      {isFollowUpModalOpen && selectedLead && (
        <div className="modal-backdrop" style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100, padding: '16px' }}>
          <div style={{ background: '#ffffff', borderRadius: '12px', width: '100%', maxWidth: '460px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 8px 0', color: '#0f172a', fontSize: '1.1rem' }}>Schedule Follow-up Call / Meeting</h3>
            <p style={{ margin: '0 0 16px 0', color: '#64748b', fontSize: '0.85rem' }}>
              Add a reminder for <strong>{selectedLead.full_name}</strong>.
            </p>

            <form onSubmit={handleCreateFollowUpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Due Date and Time *
                </label>
                <input
                  type="datetime-local"
                  required
                  value={followUpDueAt}
                  onChange={(e) => setFollowUpDueAt(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                  Note / Agenda *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Call to discuss course fee installment plan and lab timings"
                  value={followUpNote}
                  onChange={(e) => setFollowUpNote(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.875rem' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setIsFollowUpModalOpen(false)}
                  style={{ padding: '8px 14px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ padding: '8px 16px' }}
                >
                  Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
