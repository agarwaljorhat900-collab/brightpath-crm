import React, { useState } from 'react';
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
  ChevronRight,
  Activity as ActivityIcon,
  PlusCircle,
  Lock,
  IndianRupee,
  BarChart3,
  PieChart,
  TrendingDown
} from 'lucide-react';
import { Lead, FollowUp, UserRole, Profile } from '../../types';
import { StatusBadge } from '../../components/common/StatusBadge';
import { COURSES, LEAD_SOURCES, COURSE_TUITION_MAP } from '../../constants';

interface DashboardViewProps {
  leads: Lead[];
  followUps: FollowUp[];
  profiles?: Profile[];
  currentRole: UserRole;
  onNavigateTab: (tab: string) => void;
  onSelectLead?: (lead: Lead) => void;
}

/* ─────────────────────────────────────────────────────────────
   ADMIN-ONLY CHART: Horizontal Bar Chart (SVG)
   Shows course-wise enquiry count as coloured horizontal bars
───────────────────────────────────────────────────────────────*/
const CourseBarChart: React.FC<{ data: { label: string; value: number; color: string }[] }> = ({ data }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  const chartH = data.length * 44;
  const labelW = 180;
  const barAreaW = 220;
  const totalW = labelW + barAreaW + 60;

  return (
    <svg viewBox={`0 0 ${totalW} ${chartH + 24}`} style={{ width: '100%', height: chartH + 24 }}>
      {/* Grid lines */}
      {[0, 0.25, 0.5, 0.75, 1].map((frac) => {
        const x = labelW + frac * barAreaW;
        return (
          <line
            key={frac}
            x1={x} y1={8} x2={x} y2={chartH + 8}
            stroke="#f1f5f9" strokeWidth="1"
          />
        );
      })}

      {data.map((d, i) => {
        const y = i * 44 + 8;
        const barW = Math.max((d.value / maxVal) * barAreaW, d.value > 0 ? 4 : 0);
        const isHov = hovered === i;
        return (
          <g key={d.label} onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            {/* Label */}
            <text
              x={labelW - 10} y={y + 20}
              textAnchor="end"
              fontSize="11"
              fill={isHov ? '#0f172a' : '#475569'}
              fontWeight={isHov ? '700' : '500'}
              fontFamily="inherit"
            >
              {d.label.length > 22 ? d.label.slice(0, 21) + '…' : d.label}
            </text>

            {/* Background track */}
            <rect x={labelW} y={y + 8} width={barAreaW} height={22} rx="6" fill="#f8fafc" />

            {/* Bar */}
            <rect
              className="chart-bar-rect"
              x={labelW} y={y + 8} width={barW} height={22} rx="6"
              fill={isHov ? d.color : d.color + 'cc'}
            />

            {/* Value label */}
            <text
              x={labelW + barW + 8} y={y + 22}
              fontSize="12" fill={d.color}
              fontWeight="700" fontFamily="inherit"
            >
              {d.value}
            </text>
          </g>
        );
      })}

      {/* X-axis labels */}
      {[0, Math.round(maxVal / 2), maxVal].map((val) => (
        <text
          key={val}
          x={labelW + (val / maxVal) * barAreaW}
          y={chartH + 20}
          textAnchor="middle"
          fontSize="10"
          fill="#94a3b8"
          fontFamily="inherit"
        >
          {val}
        </text>
      ))}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   ADMIN-ONLY CHART: Donut / Pie Chart (SVG)
   Shows lead source distribution as a smooth donut
───────────────────────────────────────────────────────────────*/
const DonutChart: React.FC<{
  segments: { label: string; value: number; color: string }[];
  total: number;
  centerLabel: string;
}> = ({ segments, total, centerLabel }) => {
  const [hovered, setHovered] = useState<number | null>(null);
  const cx = 90; const cy = 90; const r = 70; const innerR = 42;
  const circumference = 2 * Math.PI * r;

  if (total === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '0.85rem' }}>
        No data available
      </div>
    );
  }

  let cumulativeAngle = -90;
  const paths = segments.map((seg, i) => {
    if (seg.value === 0) return null;
    const fraction = seg.value / total;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;

    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const x1 = cx + r * Math.cos(toRad(startAngle));
    const y1 = cy + r * Math.sin(toRad(startAngle));
    const x2 = cx + r * Math.cos(toRad(endAngle));
    const y2 = cy + r * Math.sin(toRad(endAngle));
    const ix1 = cx + innerR * Math.cos(toRad(endAngle));
    const iy1 = cy + innerR * Math.sin(toRad(endAngle));
    const ix2 = cx + innerR * Math.cos(toRad(startAngle));
    const iy2 = cy + innerR * Math.sin(toRad(startAngle));
    const largeArc = angle > 180 ? 1 : 0;

    const d = [
      `M ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2}`,
      `L ${ix1} ${iy1}`,
      `A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2}`,
      'Z'
    ].join(' ');

    return { d, color: seg.color, index: i };
  }).filter(Boolean) as { d: string; color: string; index: number }[];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 180 180" style={{ width: '160px', height: '160px', flexShrink: 0 }}>
        {paths.map((p) => (
          <path
            key={p.index}
            d={p.d}
            fill={hovered === p.index ? p.color : p.color + 'cc'}
            stroke="#fff"
            strokeWidth="2"
            style={{
              cursor: 'pointer',
              transform: hovered === p.index ? `scale(1.04)` : 'scale(1)',
              transformOrigin: `${cx}px ${cy}px`,
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={() => setHovered(p.index)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
        {/* Center text */}
        <text x={cx} y={cy - 6} textAnchor="middle" fontSize="20" fontWeight="800" fill="#0f172a" fontFamily="inherit">
          {total}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="inherit">
          {centerLabel}
        </text>
      </svg>

      {/* Legend */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '7px', flex: 1, minWidth: '120px' }}>
        {segments.filter((s) => s.value > 0).map((seg, i) => (
          <div
            key={seg.label}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '4px 6px',
              borderRadius: '6px',
              background: hovered === segments.indexOf(seg) ? '#f8fafc' : 'transparent',
              cursor: 'pointer',
              transition: 'background 0.15s'
            }}
            onMouseEnter={() => setHovered(segments.indexOf(seg))}
            onMouseLeave={() => setHovered(null)}
          >
            <span style={{ width: '10px', height: '10px', borderRadius: '3px', background: seg.color, flexShrink: 0 }} />
            <span style={{ fontSize: '0.78rem', color: '#334155', flex: 1 }}>{seg.label}</span>
            <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#0f172a' }}>{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────
   ADMIN-ONLY CHART: 7-Day Enquiry Trend Line Chart (SVG)
───────────────────────────────────────────────────────────────*/
const TrendLineChart: React.FC<{ leads: Lead[] }> = ({ leads }) => {
  const [hoveredPt, setHoveredPt] = useState<number | null>(null);

  const days: { label: string; date: string; count: number }[] = [];
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const count = leads.filter((l) => l.created_at.split('T')[0] === dateStr).length;
    days.push({
      label: d.toLocaleDateString(undefined, { weekday: 'short' }),
      date: dateStr,
      count
    });
  }

  const maxCount = Math.max(...days.map((d) => d.count), 1);
  const W = 420; const H = 100; const PAD = 20;
  const plotW = W - PAD * 2; const plotH = H - PAD * 2;

  const pts = days.map((d, i) => ({
    x: PAD + (i / (days.length - 1)) * plotW,
    y: PAD + plotH - (d.count / maxCount) * plotH,
    count: d.count,
    label: d.label
  }));

  const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  const areaD = `${pathD} L ${pts[pts.length - 1].x} ${PAD + plotH} L ${pts[0].x} ${PAD + plotH} Z`;

  return (
    <svg viewBox={`0 0 ${W} ${H + 30}`} style={{ width: '100%', height: H + 30 }}>
      {/* Gradient fill */}
      <defs>
        <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {/* Gridlines */}
      {[0, 0.5, 1].map((frac) => {
        const y = PAD + plotH - frac * plotH;
        return (
          <g key={frac}>
            <line x1={PAD} y1={y} x2={PAD + plotW} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="inherit">
              {Math.round(frac * maxCount)}
            </text>
          </g>
        );
      })}

      {/* Area fill */}
      <path d={areaD} fill="url(#trendGrad)" />

      {/* Line */}
      <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

      {/* Data points */}
      {pts.map((p, i) => (
        <g key={i} onMouseEnter={() => setHoveredPt(i)} onMouseLeave={() => setHoveredPt(null)}>
          <circle
            cx={p.x} cy={p.y} r={hoveredPt === i ? 7 : 4}
            fill={hoveredPt === i ? '#6366f1' : '#fff'}
            stroke="#6366f1" strokeWidth="2"
            style={{ cursor: 'pointer', transition: 'all 0.15s' }}
          />
          {/* Tooltip */}
          {hoveredPt === i && (
            <g>
              <rect x={p.x - 18} y={p.y - 26} width="36" height="20" rx="4" fill="#0f172a" />
              <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700" fontFamily="inherit">
                {p.count}
              </text>
            </g>
          )}
          {/* Day label */}
          <text x={p.x} y={H + 22} textAnchor="middle" fontSize="10" fill="#64748b" fontFamily="inherit">
            {p.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   ADMIN-ONLY CHART: Revenue Potential Bar Chart (SVG)
   Estimated pipeline revenue if all leads in each stage convert
───────────────────────────────────────────────────────────────*/
const RevenueBarChart: React.FC<{ leads: Lead[] }> = ({ leads }) => {
  const [hovered, setHovered] = useState<number | null>(null);

  const courseRevenue = COURSES.map((course) => {
    const courseLeads = leads.filter(
      (l) => l.course_interest === course && l.status !== 'Lost'
    );
    const tuition = COURSE_TUITION_MAP[course] || 40000;
    return {
      label: course,
      shortLabel: course.replace('Development', 'Dev').replace('Engineering', 'Eng').replace(' Bootcamp', '').replace('Mobile App ', 'Mobile '),
      value: courseLeads.length * tuition,
      count: courseLeads.length
    };
  }).filter((c) => c.count > 0);

  const maxVal = Math.max(...courseRevenue.map((c) => c.value), 1);
  const W = 400; const H = 140; const barCount = courseRevenue.length;
  const PAD = 20; const plotW = W - PAD * 2; const plotH = H - PAD;
  const barW = barCount > 0 ? Math.min((plotW / barCount) * 0.6, 50) : 40;
  const barGap = barCount > 0 ? plotW / barCount : 60;

  const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

  const formatINR = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  if (courseRevenue.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: '#94a3b8', padding: '40px 0', fontSize: '0.85rem' }}>
        No active pipeline data
      </div>
    );
  }

  return (
    <svg viewBox={`0 0 ${W} ${H + 50}`} style={{ width: '100%', height: H + 50 }}>
      {/* Gridlines */}
      {[0, 0.5, 1].map((frac) => {
        const y = PAD + plotH - frac * plotH;
        return (
          <g key={frac}>
            <line x1={PAD} y1={y} x2={PAD + plotW} y2={y} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
            <text x={PAD - 4} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8" fontFamily="inherit">
              {formatINR(frac * maxVal)}
            </text>
          </g>
        );
      })}

      {courseRevenue.map((c, i) => {
        const barH = (c.value / maxVal) * plotH;
        const x = PAD + i * barGap + (barGap - barW) / 2;
        const y = PAD + plotH - barH;
        const color = COLORS[i % COLORS.length];
        const isHov = hovered === i;

        return (
          <g
            key={c.label}
            onMouseEnter={() => setHovered(i)}
            onMouseLeave={() => setHovered(null)}
            style={{ cursor: 'pointer' }}
          >
            {/* Bar */}
            <rect
              x={x} y={y} width={barW} height={Math.max(barH, 2)} rx="6"
              fill={isHov ? color : color + 'bb'}
              style={{ transition: 'fill 0.15s' }}
            />

            {/* Tooltip on hover */}
            {isHov && (
              <g>
                <rect x={x - 10} y={y - 36} width={barW + 20} height={28} rx="5" fill="#0f172a" />
                <text x={x + barW / 2} y={y - 22} textAnchor="middle" fontSize="10" fill="#fff" fontWeight="700" fontFamily="inherit">
                  {formatINR(c.value)}
                </text>
                <text x={x + barW / 2} y={y - 10} textAnchor="middle" fontSize="9" fill="#94a3b8" fontFamily="inherit">
                  {c.count} lead{c.count > 1 ? 's' : ''}
                </text>
              </g>
            )}

            {/* X-axis label */}
            <text
              x={x + barW / 2} y={PAD + plotH + 16}
              textAnchor="middle" fontSize="9" fill={isHov ? '#0f172a' : '#64748b'}
              fontWeight={isHov ? '700' : '400'}
              fontFamily="inherit"
            >
              {c.shortLabel.length > 12 ? c.shortLabel.slice(0, 11) + '…' : c.shortLabel}
            </text>
          </g>
        );
      })}
    </svg>
  );
};

/* ─────────────────────────────────────────────────────────────
   MAIN DASHBOARD VIEW
───────────────────────────────────────────────────────────────*/
export const DashboardView: React.FC<DashboardViewProps> = ({
  leads,
  followUps,
  profiles = [],
  currentRole,
  onNavigateTab,
  onSelectLead
}) => {
  const now = new Date();
  const isAdmin = currentRole === 'admin';

  // Core KPI metrics
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === 'New').length;
  const contactedLeads = leads.filter((l) => l.status === 'Contacted').length;
  const qualifiedLeads = leads.filter((l) => l.status === 'Qualified').length;
  const convertedLeads = leads.filter((l) => l.status === 'Converted').length;
  const lostLeads = leads.filter((l) => l.status === 'Lost').length;
  const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : '0.0';

  // Admin-only: estimated total revenue potential
  const totalRevenuePotential = isAdmin
    ? leads
        .filter((l) => l.status !== 'Lost')
        .reduce((sum, l) => sum + (COURSE_TUITION_MAP[l.course_interest] || 40000), 0)
    : 0;

  const formatINR = (val: number) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${(val / 1000).toFixed(0)}K`;
  };

  // Overdue & upcoming
  const overdueFollowUps = followUps.filter(
    (f) => f.status === 'pending' && new Date(f.due_at) < now
  );
  const upcomingFollowUps = followUps
    .filter((f) => f.status === 'pending' && new Date(f.due_at) >= now)
    .sort((a, b) => new Date(a.due_at).getTime() - new Date(b.due_at).getTime());

  // Pipeline funnel stages
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

  // Course interest breakdown (for all users)
  const courseCounts = COURSES.map((course) => {
    const count = leads.filter((l) => l.course_interest === course).length;
    return { course, count, percentage: totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0 };
  }).filter((c) => c.count > 0);

  // Admin-only chart data: source distribution for donut
  const sourceSegmentColors = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6'];
  const sourceSegments = LEAD_SOURCES.map((src, i) => ({
    label: src,
    value: leads.filter((l) => l.source === src).length,
    color: sourceSegmentColors[i % sourceSegmentColors.length]
  })).filter((s) => s.value > 0);

  // Admin-only: staff performance (leads per counsellor)
  const staffPerformance = profiles
    .filter((p) => p.role === 'counsellor' || p.role === 'manager')
    .map((p) => ({
      name: p.full_name,
      role: p.role,
      assigned: leads.filter((l) => l.assigned_to === p.id).length,
      converted: leads.filter((l) => l.assigned_to === p.id && l.status === 'Converted').length
    }))
    .sort((a, b) => b.assigned - a.assigned);

  // Recent enquiries
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

  const getInitials = (name: string) =>
    name.split(' ').map((p) => p[0]).filter(Boolean).slice(0, 2).join('').toUpperCase();

  return (
    <div className="dashboard-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ── Executive Command Header ── */}
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
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
                padding: '4px 10px', borderRadius: '20px',
                fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.04em',
                textTransform: 'uppercase', color: '#e0e7ff'
              }}
            >
              <div className="live-pulse-dot" />
              Institutional Command Center
            </span>
            <span
              style={{
                background: 'rgba(99,102,241,0.3)', padding: '4px 10px', borderRadius: '20px',
                fontSize: '0.72rem', fontWeight: 600, color: '#c7d2fe'
              }}
            >
              Scope: <strong style={{ textTransform: 'capitalize' }}>{currentRole}</strong> Access
            </span>
            {isAdmin && (
              <span className="admin-badge-pill">
                <Lock size={10} />
                Admin Analytics Enabled
              </span>
            )}
          </div>

          <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#ffffff' }}>
            BrightPath Academy Admissions Intelligence
          </h1>
          <p style={{ margin: '6px 0 0 0', fontSize: '0.875rem', color: '#cbd5e1' }}>
            Real-time enrollment metrics, student candidate progression, and counselor action queue.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => onNavigateTab('leads')} className="dashboard-quick-action-pill"
            style={{ background: '#ffffff', color: '#1e1b4b', border: 'none', fontWeight: 700, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <PlusCircle size={15} color="#4f46e5" />
            <span>Manage Enquiries</span>
          </button>
          <button type="button" onClick={() => onNavigateTab('followups')} className="dashboard-quick-action-pill"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
            <Calendar size={15} />
            <span>Task Queue {overdueFollowUps.length > 0 && `(${overdueFollowUps.length})`}</span>
          </button>
          <button type="button" onClick={() => onNavigateTab('activities')} className="dashboard-quick-action-pill"
            style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
            <ActivityIcon size={15} />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>

      {/* ── Overdue Alert Banner ── */}
      {overdueFollowUps.length > 0 && (
        <div
          role="alert"
          onClick={() => onNavigateTab('followups')}
          style={{
            backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '12px',
            padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: '12px', cursor: 'pointer', transition: 'all 0.18s ease',
            boxShadow: '0 2px 6px rgba(220,38,38,0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: '#fee2e2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dc2626' }}>
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
          <button type="button" onClick={(e) => { e.stopPropagation(); onNavigateTab('followups'); }}
            style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Review Overdue</span><ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* ── 5 KPI Cards ── */}
      <div className="kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>

        {/* Total Enquiries */}
        <div className="dashboard-kpi-card" onClick={() => onNavigateTab('leads')} title="Click to view all student enquiries">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Total Enquiries</span>
              <div style={{ background: '#eff6ff', padding: '8px', borderRadius: '8px', color: '#2563eb' }}><Users size={18} /></div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{totalLeads}</div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Active student pipeline</span>
            <span className="card-hover-arrow" style={{ fontSize: '0.74rem', color: '#2563eb', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>Open <ArrowRight size={12} /></span>
          </div>
        </div>

        {/* New Enquiries */}
        <div className="dashboard-kpi-card" onClick={() => onNavigateTab('leads')} title="Click to view new leads">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>New Enquiries</span>
              <div style={{ background: '#fefce8', padding: '8px', borderRadius: '8px', color: '#ca8a04' }}><UserPlus size={18} /></div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{newLeads}</div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#ca8a04', fontWeight: 500 }}>Awaiting first outreach</span>
            <span className="card-hover-arrow" style={{ fontSize: '0.74rem', color: '#ca8a04', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>Contact <ArrowRight size={12} /></span>
          </div>
        </div>

        {/* Admissions Converted */}
        <div className="dashboard-kpi-card" onClick={() => onNavigateTab('leads')} title="Click to view converted admissions">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Admissions Converted</span>
              <div style={{ background: '#ecfdf5', padding: '8px', borderRadius: '8px', color: '#059669' }}><Award size={18} /></div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{convertedLeads}</div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 500 }}>Enrolled & paid students</span>
            <span className="card-hover-arrow" style={{ fontSize: '0.74rem', color: '#059669', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>View <ArrowRight size={12} /></span>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="dashboard-kpi-card" onClick={() => onNavigateTab('leads')} title="Click to analyze pipeline">
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 600 }}>Conversion Rate</span>
              <div style={{ background: '#f5f3ff', padding: '8px', borderRadius: '8px', color: '#7c3aed' }}><TrendingUp size={18} /></div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.02em' }}>{conversionRate}%</div>
          </div>
          <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.74rem', color: '#64748b' }}>Converted / Total leads</span>
            <span className="card-hover-arrow" style={{ fontSize: '0.74rem', color: '#7c3aed', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '3px' }}>Explore <ArrowRight size={12} /></span>
          </div>
        </div>

        {/* Overdue Tasks */}
        <div
          className="dashboard-kpi-card"
          onClick={() => onNavigateTab('followups')}
          style={{ borderColor: overdueFollowUps.length > 0 ? '#fca5a5' : '#e2e8f0', background: overdueFollowUps.length > 0 ? '#fffafa' : '#ffffff' }}
          title="Click to manage overdue follow-ups"
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={{ fontSize: '0.8rem', color: overdueFollowUps.length > 0 ? '#dc2626' : '#64748b', fontWeight: 600 }}>Overdue Tasks</span>
              <div style={{ background: overdueFollowUps.length > 0 ? '#fee2e2' : '#f1f5f9', padding: '8px', borderRadius: '8px', color: overdueFollowUps.length > 0 ? '#dc2626' : '#64748b' }}>
                <Clock size={18} />
              </div>
            </div>
            <div style={{ fontSize: '1.9rem', fontWeight: 800, color: overdueFollowUps.length > 0 ? '#dc2626' : '#0f172a', letterSpacing: '-0.02em' }}>
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

      {/* ── ADMIN-ONLY ANALYTICS SECTION ── */}
      {isAdmin ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Admin section header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, #e2e8f0, transparent)' }} />
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
                color: '#e0e7ff', padding: '8px 18px', borderRadius: '20px',
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.04em',
                whiteSpace: 'nowrap'
              }}
            >
              <Lock size={12} />
              Administrator Analytics &mdash; Confidential
              <BarChart3 size={13} />
            </div>
            <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to left, #e2e8f0, transparent)' }} />
          </div>

          {/* Revenue Potential KPI */}
          <div
            style={{
              background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
              borderRadius: '14px',
              padding: '20px 24px',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 8px 24px -4px rgba(79,70,229,0.2)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <IndianRupee size={18} color="#a5b4fc" />
                <span style={{ fontSize: '0.8rem', color: '#a5b4fc', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Estimated Tuition Revenue Potential
                </span>
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                {formatINR(totalRevenuePotential)}
              </div>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#94a3b8' }}>
                Based on {leads.filter((l) => l.status !== 'Lost').length} active leads in pipeline × estimated course fees
              </p>
            </div>
            <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#86efac' }}>
                  {formatINR(convertedLeads * 46000)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Fees Realised</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>
                  {formatINR((qualifiedLeads + contactedLeads) * 46000)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>In-Pipeline Value</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>
                  {formatINR(lostLeads * 46000)}
                </div>
                <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>Revenue Lost</div>
              </div>
            </div>
          </div>

          {/* Three-column chart row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

            {/* Chart 1: 7-Day Enquiry Trend */}
            <div className="admin-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    7-Day Enquiry Trend
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Daily new student enquiries this week</span>
                </div>
                <TrendingUp size={18} color="#6366f1" />
              </div>
              <TrendLineChart leads={leads} />
            </div>

            {/* Chart 2: Enquiry Source Donut */}
            <div className="admin-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Enquiry Source Mix
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Where students discover BrightPath</span>
                </div>
                <PieChart size={18} color="#0ea5e9" />
              </div>
              <DonutChart segments={sourceSegments} total={totalLeads} centerLabel="Leads" />
            </div>

            {/* Chart 3: Revenue by Course Bar */}
            <div className="admin-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Course Revenue Potential
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Estimated pipeline value per programme</span>
                </div>
                <IndianRupee size={18} color="#10b981" />
              </div>
              <RevenueBarChart leads={leads} />
            </div>
          </div>

          {/* Two-column: Course bar chart + Staff Performance Table */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

            {/* Chart 4: Course Demand Horizontal Bars */}
            <div className="admin-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Programme Demand Analysis
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Enquiry volume per academy course</span>
                </div>
                <BarChart3 size={18} color="#8b5cf6" />
              </div>
              <CourseBarChart
                data={COURSES.map((course, i) => ({
                  label: course,
                  value: leads.filter((l) => l.course_interest === course).length,
                  color: ['#6366f1','#0ea5e9','#10b981','#f59e0b','#8b5cf6','#ec4899'][i % 6]
                }))}
              />
            </div>

            {/* Chart 5: Staff Performance Leaderboard */}
            <div className="admin-chart-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Counsellor Performance Board
                  </h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748b' }}>Leads assigned vs admissions closed</span>
                </div>
                <TrendingDown size={18} color="#f59e0b" />
              </div>

              {staffPerformance.length === 0 ? (
                <div style={{ padding: '32px', textAlign: 'center', color: '#94a3b8' }}>
                  <Users size={28} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.4 }} />
                  <p style={{ margin: 0, fontSize: '0.84rem' }}>No counsellor profiles found.</p>
                  <p style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>Ensure staff accounts are set up in Supabase.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {/* Table header */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 70px', gap: '8px', padding: '0 4px 8px', borderBottom: '1px solid #f1f5f9' }}>
                    {['Counsellor', 'Role', 'Leads', 'Closed'].map((h) => (
                      <span key={h} style={{ fontSize: '0.72rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
                    ))}
                  </div>
                  {staffPerformance.slice(0, 6).map((s, i) => {
                    const rate = s.assigned > 0 ? Math.round((s.converted / s.assigned) * 100) : 0;
                    return (
                      <div
                        key={s.name}
                        style={{ display: 'grid', gridTemplateColumns: '1fr 60px 70px 70px', gap: '8px', padding: '8px', borderRadius: '8px', background: i === 0 ? '#f8fafc' : 'transparent', alignItems: 'center' }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{
                            width: '28px', height: '28px', borderRadius: '50%',
                            background: `linear-gradient(135deg, ${['#6366f1','#0ea5e9','#10b981','#f59e0b','#8b5cf6','#ec4899'][i % 6]} 0%, #0f172a 100%)`,
                            color: '#fff', fontSize: '0.68rem', fontWeight: 700,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
                          }}>
                            {getInitials(s.name)}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0f172a' }}>{s.name}</div>
                            {i === 0 && <div style={{ fontSize: '0.68rem', color: '#10b981', fontWeight: 600 }}>⭐ Top Performer</div>}
                          </div>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'capitalize' }}>{s.role}</span>
                        <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0f172a' }}>{s.assigned}</span>
                        <div>
                          <span style={{ fontSize: '0.84rem', fontWeight: 700, color: '#059669' }}>{s.converted}</span>
                          <span style={{ fontSize: '0.72rem', color: '#94a3b8', marginLeft: '4px' }}>({rate}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Loss analysis footer */}
              {lostLeads > 0 && (
                <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', borderRadius: '8px', padding: '10px 12px' }}>
                  <TrendingDown size={14} color="#dc2626" />
                  <span style={{ fontSize: '0.78rem', color: '#b91c1c' }}>
                    <strong>{lostLeads}</strong> lead{lostLeads > 1 ? 's' : ''} marked Lost — {formatINR(lostLeads * 46000)} potential revenue not realised.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* ── NON-ADMIN: show locked analytics teaser ── */
        <div className="confidential-watermark" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '32px' }}>
          <Lock size={30} color="#94a3b8" />
          <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 600, color: '#475569' }}>
            Advanced Analytics — Administrator Access Only
          </p>
          <p style={{ margin: 0, fontSize: '0.8rem', color: '#94a3b8', textAlign: 'center', maxWidth: '380px' }}>
            Revenue intelligence, programme demand graphs, 7-day trend analysis, source mix, and counsellor performance data are restricted to the Academy Administrator role.
          </p>
        </div>
      )}

      {/* ── Pipeline + Course (all roles) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>

        {/* Clickable Pipeline Funnel */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Admissions Pipeline Stages</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Click any stage to filter student leads</span>
            </div>
            <button type="button" onClick={() => onNavigateTab('leads')}
              style={{ background: '#eff6ff', color: '#2563eb', border: 'none', padding: '5px 10px', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span>View Table</span><ArrowRight size={12} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {statusCounts.map((item) => (
              <div key={item.status} onClick={() => onNavigateTab('leads')} className="dashboard-interactive-row" title={`Click to view ${item.status} enquiries`}>
                <div style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: item.color }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#1e293b' }}>{item.status}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '10px', backgroundColor: item.bg, color: item.color }}>
                        {item.count} ({item.percentage}%)
                      </span>
                      <ChevronRight size={14} color="#94a3b8" />
                    </div>
                  </div>
                  <div style={{ width: '100%', height: '6px', background: '#f1f5f9', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.max(item.percentage, item.count > 0 ? 4 : 0)}%`, height: '100%', backgroundColor: item.color, borderRadius: '3px', transition: 'width 0.4s ease' }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Course Demand */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Course Demand Breakdown</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Student interest distribution across curriculum</span>
            </div>
            <span style={{ fontSize: '0.75rem', color: '#475569', background: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', fontWeight: 600 }}>
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
                <div key={c.course} onClick={() => onNavigateTab('leads')} className="dashboard-interactive-row" title={`Click to view students interested in ${c.course}`}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <BookOpen size={16} />
                    </div>
                    <div>
                      <span style={{ fontSize: '0.85rem', color: '#0f172a', fontWeight: 600, display: 'block' }}>{c.course}</span>
                      <span style={{ fontSize: '0.74rem', color: '#64748b' }}>{c.percentage}% of overall demand</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, background: '#f0fdf4', color: '#15803d', border: '1px solid #bbf7d0', padding: '3px 9px', borderRadius: '12px' }}>
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

      {/* ── Recent Enquiries & Upcoming Follow-ups (all roles) ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>

        {/* Clickable Recent Enquiries */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Recent Student Enquiries</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Click a student to view and edit details</span>
            </div>
            <button type="button" onClick={() => onNavigateTab('leads')}
              style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <span>View all ({totalLeads})</span><ArrowRight size={14} />
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
                  onClick={() => { if (onSelectLead) { onSelectLead(lead); } else { onNavigateTab('leads'); } }}
                  className="dashboard-interactive-row"
                  title={`Click to open details for ${lead.full_name}`}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1 0%, #4338ca 100%)', color: '#ffffff', fontWeight: 700, fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {getInitials(lead.full_name)}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '0.875rem', color: '#0f172a' }}>{lead.full_name}</div>
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

        {/* Clickable Upcoming Follow-ups */}
        <div style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', padding: '22px', boxShadow: '0 1px 3px rgba(15,23,42,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h2 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>Scheduled Follow-up Queue</h2>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Upcoming counselor calls and student meetings</span>
            </div>
            <button type="button" onClick={() => onNavigateTab('followups')}
              style={{ background: 'none', border: 'none', color: '#4f46e5', fontSize: '0.8rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <span>Manage tasks</span><ArrowRight size={14} />
            </button>
          </div>
          {upcomingFollowUps.length === 0 ? (
            <div style={{ padding: '36px', textAlign: 'center', color: '#94a3b8' }}>
              <Calendar size={32} style={{ margin: '0 auto 8px', display: 'block', opacity: 0.5 }} />
              <p style={{ margin: 0, fontSize: '0.85rem' }}>No upcoming follow-ups scheduled.</p>
              <button type="button" onClick={() => onNavigateTab('followups')}
                style={{ marginTop: '10px', background: '#f1f5f9', border: '1px solid #e2e8f0', padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 600, color: '#334155', cursor: 'pointer' }}>
                + Schedule Follow-up
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {upcomingFollowUps.slice(0, 4).map((f) => {
                const dueDate = new Date(f.due_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={f.id} onClick={() => onNavigateTab('followups')} className="dashboard-interactive-row" title="Click to view in Follow-ups tab">
                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                        <span style={{ fontSize: '0.85rem', color: '#4f46e5', fontWeight: 700 }}>{f.lead?.full_name || 'Student Enquiry'}</span>
                        <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 500, background: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0' }}>{dueDate}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.8rem', color: '#334155', lineHeight: 1.4 }}>{f.note}</p>
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
