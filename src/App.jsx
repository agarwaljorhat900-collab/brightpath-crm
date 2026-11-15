import { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Kanban,
  CheckSquare,
  MessageSquare,
  TrendingUp,
  DollarSign,
  Plus,
  Search,
  Bell,
  Phone,
  Mail,
  Building2,
  Sparkles,
  ArrowUpRight,
  ChevronRight,
  X,
  Briefcase,
  CheckCircle2,
  Clock,
  Award,
  Send,
  Filter
} from 'lucide-react';
import './App.css';

const INITIAL_LEADS = [
  {
    id: 1,
    name: 'Sarah Jenkins',
    company: 'Apex Digital Inc.',
    email: 'sarah.j@apexdigital.com',
    phone: '+1 (555) 234-8901',
    value: 28500,
    stage: 'Qualified',
    priority: 'High',
    avatar: 'SJ'
  },
  {
    id: 2,
    name: 'Marcus Chen',
    company: 'Quantum Dynamics',
    email: 'm.chen@quantumdynamics.io',
    phone: '+1 (555) 872-1142',
    value: 45000,
    stage: 'Proposal',
    priority: 'High',
    avatar: 'MC'
  },
  {
    id: 3,
    name: 'Elena Rostova',
    company: 'Vanguard Retail Labs',
    email: 'elena@vanguardretail.com',
    phone: '+1 (555) 639-4409',
    value: 16000,
    stage: 'New',
    priority: 'Medium',
    avatar: 'ER'
  },
  {
    id: 4,
    name: 'Devon Patel',
    company: 'CloudMatrix Global',
    email: 'devon.patel@cloudmatrix.org',
    phone: '+1 (555) 901-3321',
    value: 62000,
    stage: 'Negotiation',
    priority: 'High',
    avatar: 'DP'
  },
  {
    id: 5,
    name: 'Chloe Bennett',
    company: 'HyperScale Logistics',
    email: 'c.bennett@hyperscale.co',
    phone: '+1 (555) 412-7890',
    value: 34000,
    stage: 'Won',
    priority: 'Low',
    avatar: 'CB'
  },
  {
    id: 6,
    name: 'Liam Vance',
    company: 'Horizon BioTech',
    email: 'liam.vance@horizonbio.com',
    phone: '+1 (555) 304-9821',
    value: 51000,
    stage: 'Won',
    priority: 'High',
    avatar: 'LV'
  }
];

const INITIAL_CONVERSATIONS = [
  {
    id: 1,
    contact: 'Sarah Jenkins',
    company: 'Apex Digital Inc.',
    avatar: 'SJ',
    lastMessage: 'We reviewed the proposal and the executive board wants to proceed with tier 2.',
    time: '12m ago',
    unread: true,
    messages: [
      { sender: 'Sarah Jenkins', text: 'Hi Mehul, thanks for sending over the preliminary scope.', time: '10:15 AM' },
      { sender: 'You', text: 'Glad to hear! Did the security and compliance team have any questions on data retention?', time: '10:22 AM' },
      { sender: 'Sarah Jenkins', text: 'We reviewed the proposal and the executive board wants to proceed with tier 2.', time: '10:48 AM' }
    ]
  },
  {
    id: 2,
    contact: 'Marcus Chen',
    company: 'Quantum Dynamics',
    avatar: 'MC',
    lastMessage: 'Can we schedule a 30-min technical architecture walkthrough this Thursday?',
    time: '1h ago',
    unread: false,
    messages: [
      { sender: 'Marcus Chen', text: 'Our engineering lead wants to look over the REST APIs and Webhook endpoints.', time: 'Yesterday' },
      { sender: 'Marcus Chen', text: 'Can we schedule a 30-min technical architecture walkthrough this Thursday?', time: '1h ago' }
    ]
  },
  {
    id: 3,
    contact: 'Devon Patel',
    company: 'CloudMatrix Global',
    avatar: 'DP',
    lastMessage: 'Contract sent to our legal department for final review.',
    time: '3h ago',
    unread: false,
    messages: [
      { sender: 'Devon Patel', text: 'Contract sent to our legal department for final review.', time: '3h ago' }
    ]
  }
];

const INITIAL_TASKS = [
  { id: 1, text: 'Send updated enterprise contract proposal to Marcus Chen', due: 'Today, 4:00 PM', priority: 'High', completed: false },
  { id: 2, text: 'Schedule product demo with Elena Rostova (Vanguard)', due: 'Tomorrow, 11:30 AM', priority: 'Medium', completed: false },
  { id: 3, text: 'Follow up on executive signoff with Devon Patel', due: 'Nov 12', priority: 'High', completed: true },
  { id: 4, text: 'Prepare Q4 sales pipeline presentation for stakeholders', due: 'Nov 14', priority: 'Low', completed: false }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [leads, setLeads] = useState(INITIAL_LEADS);
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [conversations, setConversations] = useState(INITIAL_CONVERSATIONS);
  const [selectedConvId, setSelectedConvId] = useState(1);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newLead, setNewLead] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    value: '',
    stage: 'New',
    priority: 'Medium'
  });

  // KPI Calculations
  const totalPipeline = leads.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
  const wonDeals = leads.filter(l => l.stage === 'Won');
  const wonValue = wonDeals.reduce((acc, curr) => acc + Number(curr.value || 0), 0);
  const activeDealsCount = leads.filter(l => l.stage !== 'Won').length;
  const winRate = leads.length > 0 ? ((wonDeals.length / leads.length) * 100).toFixed(1) : 0;

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchesSearch =
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === 'All' || lead.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  const handleCreateLead = (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) return;

    const initials = newLead.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2) || 'LD';

    const created = {
      ...newLead,
      id: Date.now(),
      value: Number(newLead.value) || 0,
      avatar: initials
    };

    setLeads([created, ...leads]);
    setNewLead({
      name: '',
      company: '',
      email: '',
      phone: '',
      value: '',
      stage: 'New',
      priority: 'Medium'
    });
    setIsModalOpen(false);
  };

  const advanceStage = (id) => {
    const stages = ['New', 'Qualified', 'Proposal', 'Negotiation', 'Won'];
    setLeads(leads.map(lead => {
      if (lead.id === id) {
        const nextIndex = (stages.indexOf(lead.stage) + 1) % stages.length;
        return { ...lead, stage: stages[nextIndex] };
      }
      return lead;
    }));
  };

  const toggleTask = (id) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    setConversations(conversations.map(c => {
      if (c.id === selectedConvId) {
        return {
          ...c,
          lastMessage: replyText,
          time: 'Just now',
          unread: false,
          messages: [...c.messages, { sender: 'You', text: replyText, time: 'Just now' }]
        };
      }
      return c;
    }));
    setReplyText('');
  };

  const currentConv = conversations.find(c => c.id === selectedConvId) || conversations[0];

  return (
    <div className="crm-container">
      {/* Sidebar Navigation */}
      <aside className="crm-sidebar">
        <div className="brand-header">
          <div className="brand-icon">
            <Sparkles size={20} />
          </div>
          <span className="brand-title">BrightPath</span>
          <span className="brand-badge">CRM</span>
        </div>

        <nav className="nav-section">
          <div className="nav-label">Main Menu</div>
          <button
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'leads' ? 'active' : ''}`}
            onClick={() => setActiveTab('leads')}
          >
            <Users size={18} />
            <span>Leads & Contacts</span>
            <span className="badge">{leads.length}</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'pipeline' ? 'active' : ''}`}
            onClick={() => setActiveTab('pipeline')}
          >
            <Kanban size={18} />
            <span>Pipeline Board</span>
          </button>
          <button
            className={`nav-item ${activeTab === 'conversations' ? 'active' : ''}`}
            onClick={() => setActiveTab('conversations')}
          >
            <MessageSquare size={18} />
            <span>Conversations</span>
            <span className="badge" style={{ background: '#4f46e5', color: '#fff' }}>
              {conversations.filter(c => c.unread).length}
            </span>
          </button>
          <button
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <CheckSquare size={18} />
            <span>Tasks</span>
            <span className="badge">{tasks.filter(t => !t.completed).length}</span>
          </button>
        </nav>

        <div className="user-profile">
          <div className="user-avatar">MA</div>
          <div className="user-info">
            <span className="user-name">Mehul Agarwal</span>
            <span className="user-role">Sales Director</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="crm-main">
        {/* Top Header */}
        <header className="crm-topbar">
          <div className="search-box">
            <Search size={16} color="#64748b" />
            <input
              type="text"
              placeholder="Search leads, deals, or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="topbar-actions">
            <button className="btn-icon" title="Notifications">
              <Bell size={18} />
              <span className="dot"></span>
            </button>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              <span>Add Lead</span>
            </button>
          </div>
        </header>

        {/* Dynamic Views */}
        <div className="crm-content">
          {/* DASHBOARD VIEW */}
          {activeTab === 'dashboard' && (
            <>
              <div className="page-header">
                <div>
                  <h1 className="page-title">Executive Overview</h1>
                  <p className="page-subtitle">Welcome back! Here is how your sales pipeline is performing today.</p>
                </div>
                <button className="btn-secondary" onClick={() => setActiveTab('pipeline')}>
                  <span>View Full Pipeline</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* KPI Cards */}
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Total Pipeline</span>
                    <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                      <DollarSign size={20} />
                    </div>
                  </div>
                  <div className="stat-value">${totalPipeline.toLocaleString()}</div>
                  <div className="stat-footer">
                    <span className="stat-growth"><ArrowUpRight size={14} /> +18.4%</span>
                    <span>vs last month</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Active Opportunities</span>
                    <div className="stat-icon" style={{ background: '#f0fdf4', color: '#16a34a' }}>
                      <Briefcase size={20} />
                    </div>
                  </div>
                  <div className="stat-value">{activeDealsCount}</div>
                  <div className="stat-footer">
                    <span className="stat-growth"><ArrowUpRight size={14} /> +6 deals</span>
                    <span>in active stages</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Revenue Closed (Won)</span>
                    <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                      <Award size={20} />
                    </div>
                  </div>
                  <div className="stat-value">${wonValue.toLocaleString()}</div>
                  <div className="stat-footer">
                    <span className="stat-growth"><ArrowUpRight size={14} /> +24.1%</span>
                    <span>target reached</span>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-header">
                    <span className="stat-label">Win Conversion Rate</span>
                    <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                      <TrendingUp size={20} />
                    </div>
                  </div>
                  <div className="stat-value">{winRate}%</div>
                  <div className="stat-footer">
                    <span className="stat-growth"><ArrowUpRight size={14} /> +3.2%</span>
                    <span>industry avg 21%</span>
                  </div>
                </div>
              </div>

              {/* Quick Leads Table */}
              <div className="card-section">
                <div className="card-header">
                  <span className="card-title">Recent High-Value Leads</span>
                  <button className="btn-secondary" onClick={() => setActiveTab('leads')}>View All</button>
                </div>
                <table className="crm-table">
                  <thead>
                    <tr>
                      <th>Lead Contact</th>
                      <th>Stage</th>
                      <th>Deal Value</th>
                      <th>Priority</th>
                      <th>Quick Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.slice(0, 4).map(lead => (
                      <tr key={lead.id}>
                        <td>
                          <div className="lead-name-cell">
                            <div className="lead-avatar">{lead.avatar}</div>
                            <div className="lead-meta">
                              <span className="lead-title">{lead.name}</span>
                              <span className="lead-company">{lead.company}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`badge-status badge-${lead.stage.toLowerCase()}`}>
                            {lead.stage}
                          </span>
                        </td>
                        <td><strong>${lead.value.toLocaleString()}</strong></td>
                        <td>
                          <span style={{
                            color: lead.priority === 'High' ? '#dc2626' : '#475569',
                            fontWeight: 600
                          }}>
                            {lead.priority}
                          </span>
                        </td>
                        <td>
                          <button
                            className="btn-secondary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => advanceStage(lead.id)}
                          >
                            Advance Stage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* LEADS & CONTACTS VIEW */}
          {activeTab === 'leads' && (
            <div className="card-section">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Leads & Contact Directory</h2>
                  <p className="page-subtitle">Track and manage every sales touchpoint and interaction.</p>
                </div>

                <div className="card-filter">
                  <Filter size={16} color="#64748b" />
                  <select
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                    style={{ padding: '0.45rem 0.85rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                  >
                    <option value="All">All Stages</option>
                    <option value="New">New</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Proposal">Proposal</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Won">Won</option>
                  </select>
                  <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                    <Plus size={16} /> Add Lead
                  </button>
                </div>
              </div>

              <table className="crm-table">
                <thead>
                  <tr>
                    <th>Prospect</th>
                    <th>Contact Info</th>
                    <th>Stage</th>
                    <th>Deal Size</th>
                    <th>Priority</th>
                    <th>Stage Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeads.map(lead => (
                    <tr key={lead.id}>
                      <td>
                        <div className="lead-name-cell">
                          <div className="lead-avatar">{lead.avatar}</div>
                          <div className="lead-meta">
                            <span className="lead-title">{lead.name}</span>
                            <span className="lead-company"><Building2 size={12} style={{ display: 'inline', marginRight: 4 }} />{lead.company}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, fontSize: '0.8rem', color: '#64748b' }}>
                          <span><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />{lead.email}</span>
                          <span><Phone size={12} style={{ display: 'inline', marginRight: 4 }} />{lead.phone}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`badge-status badge-${lead.stage.toLowerCase()}`}>
                          {lead.stage}
                        </span>
                      </td>
                      <td>
                        <strong style={{ fontSize: '0.95rem' }}>${lead.value.toLocaleString()}</strong>
                      </td>
                      <td>
                        <span style={{
                          color: lead.priority === 'High' ? '#dc2626' : lead.priority === 'Medium' ? '#d97706' : '#16a34a',
                          fontWeight: 700
                        }}>
                          {lead.priority}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-secondary"
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          onClick={() => advanceStage(lead.id)}
                        >
                          Next Step →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* KANBAN PIPELINE VIEW */}
          {activeTab === 'pipeline' && (
            <div>
              <div className="page-header" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h1 className="page-title">Sales Pipeline Board</h1>
                  <p className="page-subtitle">Click "Next Stage →" on any card to move deals forward.</p>
                </div>
                <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
                  <Plus size={16} /> New Deal
                </button>
              </div>

              <div className="kanban-board">
                {['New', 'Qualified', 'Proposal', 'Won'].map(colStage => {
                  const stageLeads = leads.filter(l => l.stage === colStage);
                  const stageSum = stageLeads.reduce((a, b) => a + Number(b.value || 0), 0);

                  return (
                    <div className="kanban-column" key={colStage}>
                      <div className="kanban-col-header">
                        <span>{colStage.toUpperCase()}</span>
                        <span className="kanban-count">{stageLeads.length} · ${stageSum.toLocaleString()}</span>
                      </div>

                      {stageLeads.map(lead => (
                        <div className="kanban-card" key={lead.id}>
                          <span className="kanban-card-title">{lead.name}</span>
                          <span className="kanban-card-company">{lead.company}</span>
                          <div className="kanban-card-footer">
                            <span className="deal-val">${lead.value.toLocaleString()}</span>
                            <button
                              className="btn-secondary"
                              style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                              onClick={() => advanceStage(lead.id)}
                            >
                              Next →
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CONVERSATIONS VIEW */}
          {activeTab === 'conversations' && (
            <div className="card-section" style={{ height: '620px', display: 'flex', flexDirection: 'column' }}>
              <div className="card-header">
                <div>
                  <h2 className="card-title">Client Conversations & Messages</h2>
                  <p className="page-subtitle">Unified inbox for customer emails, proposals, and live chat logs.</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, minHeight: 0 }}>
                {/* Conversation List */}
                <div style={{ borderRight: '1px solid #e2e8f0', overflowY: 'auto' }}>
                  {conversations.map(conv => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedConvId(conv.id)}
                      style={{
                        padding: '1rem',
                        borderBottom: '1px solid #f1f5f9',
                        cursor: 'pointer',
                        background: selectedConvId === conv.id ? '#eef2ff' : 'transparent',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'center'
                      }}
                    >
                      <div className="lead-avatar" style={{ background: '#4f46e5', color: '#fff' }}>
                        {conv.avatar}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 700, fontSize: '0.85rem' }}>{conv.contact}</span>
                          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{conv.time}</span>
                        </div>
                        <p style={{
                          fontSize: '0.75rem',
                          color: '#64748b',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: 2
                        }}>
                          {conv.lastMessage}
                        </p>
                      </div>
                      {conv.unread && (
                        <div style={{ width: 8, height: 8, background: '#4f46e5', borderRadius: '50%' }}></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Chat Details */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                  <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{currentConv.contact}</div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{currentConv.company}</div>
                  </div>

                  <div style={{ flex: 1, padding: '1.25rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                    {currentConv.messages.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          alignSelf: m.sender === 'You' ? 'flex-end' : 'flex-start',
                          maxWidth: '70%',
                          background: m.sender === 'You' ? '#4f46e5' : '#f1f5f9',
                          color: m.sender === 'You' ? '#ffffff' : '#0f172a',
                          padding: '0.75rem 1rem',
                          borderRadius: '12px',
                          fontSize: '0.875rem'
                        }}
                      >
                        <div>{m.text}</div>
                        <div style={{
                          fontSize: '0.65rem',
                          marginTop: 4,
                          textAlign: 'right',
                          color: m.sender === 'You' ? 'rgba(255,255,255,0.7)' : '#94a3b8'
                        }}>
                          {m.time}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={handleSendReply} style={{ padding: '1rem', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder={`Reply to ${currentConv.contact}...`}
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      style={{
                        flex: 1,
                        padding: '0.65rem 1rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '8px',
                        outline: 'none',
                        fontSize: '0.875rem'
                      }}
                    />
                    <button type="submit" className="btn-primary" style={{ padding: '0.65rem 1rem' }}>
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* TASKS VIEW */}
          {activeTab === 'tasks' && (
            <div className="card-section">
              <div className="card-header">
                <div>
                  <h2 className="card-title">Sales Follow-ups & Action Items</h2>
                  <p className="page-subtitle">Keep high-priority opportunities progressing to closed won.</p>
                </div>
              </div>

              <div style={{ padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {tasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => toggleTask(task.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '1rem',
                      background: task.completed ? '#f8fafc' : '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={22} color="#10b981" />
                    ) : (
                      <Clock size={22} color="#94a3b8" />
                    )}
                    <div style={{ flex: 1 }}>
                      <p style={{
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        textDecoration: task.completed ? 'line-through' : 'none',
                        color: task.completed ? '#94a3b8' : '#0f172a'
                      }}>
                        {task.text}
                      </p>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Due: {task.due}</span>
                    </div>
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      color: task.priority === 'High' ? '#dc2626' : '#2563eb',
                      background: task.priority === 'High' ? '#fef2f2' : '#eff6ff',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px'
                    }}>
                      {task.priority}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Add Lead Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Create New CRM Opportunity</h3>
              <button className="btn-icon" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateLead}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Contact Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rachel Adams"
                    value={newLead.name}
                    onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Company / Organization</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apex Global Corp"
                    value={newLead.company}
                    onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Work Email</label>
                    <input
                      type="email"
                      placeholder="rachel@apex.com"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number</label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                  <div className="form-group">
                    <label>Estimated Value ($)</label>
                    <input
                      type="number"
                      placeholder="35000"
                      value={newLead.value}
                      onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label>Pipeline Stage</label>
                    <select
                      value={newLead.stage}
                      onChange={(e) => setNewLead({ ...newLead, stage: e.target.value })}
                    >
                      <option value="New">New</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Proposal">Proposal</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Won">Won</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Opportunity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
