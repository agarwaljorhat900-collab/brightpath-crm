import { LeadStatus } from '../types';

export const COURSES = [
  'Full Stack Web Development',
  'Data Science & AI',
  'Cloud & DevOps Engineering',
  'Cybersecurity Specialist',
  'UI/UX Design Bootcamp',
  'Mobile App Development (React Native)'
] as const;

export const LEAD_SOURCES = [
  'Website Form',
  'Walk-in',
  'Phone Call',
  'Google Ads',
  'Instagram / Social Media',
  'Student Referral',
  'College Workshop'
] as const;

export const LEAD_STATUSES: LeadStatus[] = [
  'New',
  'Contacted',
  'Qualified',
  'Converted',
  'Lost'
];

export const STATUS_CONFIG: Record<LeadStatus, { label: string; bg: string; text: string; border: string }> = {
  New: {
    label: 'New Enquiry',
    bg: '#eff6ff',
    text: '#1d4ed8',
    border: '#bfdbfe'
  },
  Contacted: {
    label: 'Contacted',
    bg: '#fefce8',
    text: '#a16207',
    border: '#fef08a'
  },
  Qualified: {
    label: 'Qualified',
    bg: '#f5f3ff',
    text: '#6d28d9',
    border: '#ddd6fe'
  },
  Converted: {
    label: 'Converted (Admitted)',
    bg: '#ecfdf5',
    text: '#047857',
    border: '#a7f3d0'
  },
  Lost: {
    label: 'Lost / Dropped',
    bg: '#fef2f2',
    text: '#b91c1c',
    border: '#fecaca'
  }
};
