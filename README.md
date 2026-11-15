# BrightPath CRM — Full Master Student & Workshop Guide

> **Production-grade, security-conscious CRM for educational coaching institutes.**  
> Built with React 19, TypeScript, Vite, Supabase (PostgreSQL, GoTrue Auth & Row Level Security), and deployed on Vercel.

---

## 1. Project Overview & Business Context

**BrightPath Academy** is a modern career coaching institute offering programs in Full Stack Web Development, Data Science & AI, Cloud & DevOps, Cybersecurity, and UI/UX Design.

Before BrightPath CRM, student enquiries originating from website forms, Google Ads, phone calls, walk-ins, and campus seminars were recorded across disjointed spreadsheets and chat messages. This caused:
- Dropped student enquiries and untracked follow-up calls
- Ambiguous counsellor ownership
- Zero management visibility into admission conversion rates

### User Roles & Permissions
* **Administrator:** Complete oversight of pipeline, counselor assignments, and system-wide settings. Protected from client-side privilege escalation.
* **Manager:** Team pipeline oversight, lead distribution, and overdue follow-up monitoring.
* **Counsellor:** Works directly on assigned or created student enquiries, schedules consultations, logs interaction notes, and advances admission stages.

---

## 2. Architecture & Tech Stack

```
Browser Client (React 19 + TypeScript + Vite)
  │
  ├── src/types/               # Domain interfaces (Lead, FollowUp, Activity, Profile)
  ├── src/lib/supabaseClient.ts# Singleton Supabase client with runtime .env validation
  ├── src/services/            # Typed PostgREST queries (leads, follow-ups, activities)
  ├── src/context/AuthContext  # Session management & role scoping
  ├── src/features/
  │   ├── dashboard/           # Live KPI cards, course breakdown, overdue alerts
  │   ├── leads/               # Enquiry CRUD, search, multi-filters, detail drawer, status updates
  │   └── followups/           # Scheduler, overdue logic, completion toggles
  └── src/components/          # Layout, StatusBadges, Modal, ConfigWarning
  │
  ▼
Supabase Backend
  ├── GoTrue Authentication (JWT Session)
  ├── PostgreSQL Database (profiles, leads, follow_ups, activities)
  └── Row Level Security (RLS) & Triggers (least-privilege enforcement)
```

---

## 3. Getting Started Locally

### Prerequisites
* **Node.js:** v18.0.0 or higher
* **npm:** v9.0.0 or higher
* **Git**

### Installation
```bash
# 1. Clone the repository
git clone https://github.com/agarwaljorhat900-collab/brightpath-crm.git
cd brightpath-crm

# 2. Install dependencies
npm install

# 3. Create local environment file
cp .env.example .env

# 4. Start local development server
npm run dev
```

The application will start at `http://localhost:5173`. If Supabase credentials are not configured yet, the app runs in **Demo Mode** with realistic student records and a role selector to test Administrator, Manager, and Counsellor views.

---

## 4. Supabase Setup & Database Migrations

### Step 1: Create Supabase Project
1. Go to [supabase.com](https://supabase.com) and create a free project.
2. Note your **Project URL** and **anon (public)** key from `Project Settings > API`.

### Step 2: Configure Environment Variables
Open your local `.env` and configure:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-actual-anon-public-key
```

### Step 3: Run SQL Schema Migration
1. Open the **SQL Editor** in your Supabase dashboard.
2. Copy and execute the contents of [`supabase/migrations/20261115000000_init_schema.sql`](file:///c:/Users/mehul/OneDrive/Desktop/brightpath-crm/supabase/migrations/20261115000000_init_schema.sql).
3. This creates all 4 tables (`profiles`, `leads`, `follow_ups`, `activities`), indexes, foreign keys, triggers, and enables Row Level Security (RLS) with role-based policies.

### Step 4: Admin Role Bootstrap
1. In the CRM frontend, click **Sign In** and switch to **Register** to create your owner account.
2. Go to the Supabase SQL Editor and execute [`supabase/admin_bootstrap.sql`](file:///c:/Users/mehul/OneDrive/Desktop/brightpath-crm/supabase/admin_bootstrap.sql) with your email address to elevate your user to `admin`.

### Step 5: (Optional) Educational Seed Data
Execute [`supabase/seed.sql`](file:///c:/Users/mehul/OneDrive/Desktop/brightpath-crm/supabase/seed.sql) in the Supabase SQL editor to populate realistic student enquiries, upcoming reminders, and overdue follow-ups.

---

## 5. Verification & Testing Checklist

| Test Item | Verification Method | Status |
| :--- | :--- | :--- |
| **Static Build** | `npm run build` (`tsc --noEmit && vite build`) | **PASS** |
| **Code Linting** | `npm run lint` (`eslint .`) | **PASS** |
| **Missing Env Handling** | Loads gracefully with `ConfigWarning` banner in demo mode | **PASS** |
| **Role Scoping** | Counsellors only see assigned/created leads; Managers/Admins see team pipeline | **PASS** |
| **Overdue Logic** | Only highlights items where `status = pending` AND `due_at < now` | **PASS** |
| **Lost Reason Rule** | Marking a lead as `Lost` prompts for a mandatory reason before saving | **PASS** |
| **Activity Timeline** | Changes in lead status and follow-ups automatically create audit entries | **PASS** |
| **KPI Accuracy** | Conversion Rate (%) guards against division by zero and reconciles with list data | **PASS** |

---

## 6. Vercel Deployment Procedure

1. Push your latest code to GitHub:
   ```bash
   git add .
   git commit -m "feat: complete BrightPath CRM implementation"
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com) and click **Add New > Project**.
3. Import the `brightpath-crm` repository.
4. Framework Preset: **Vite** (auto-detected).
5. Add your Production Environment Variables in the Vercel dashboard:
   * `VITE_SUPABASE_URL`
   * `VITE_SUPABASE_ANON_KEY`
6. Click **Deploy**. Vercel will run `npm run build` and output the production site.
7. SPA routing rewrites are configured in [`vercel.json`](file:///c:/Users/mehul/OneDrive/Desktop/brightpath-crm/vercel.json).

---

## 7. Limitations & Production Considerations

* **Security & RLS:** In this workshop setup, Supabase client calls use public anon keys with RLS enforcement. In an enterprise rollout, consider adding an audit log trigger directly at the database level for tamper-proof logging.
* **Privilege Escalation:** Profiles table has RLS restricting users from updating their own `role` column. Role changes must be performed by an Administrator or via direct SQL.
* **Email & Notifications:** Outbound WhatsApp/SMS/Email notifications are out of scope for the MVP. In a future phase, add Supabase Edge Functions with Twilio/Resend webhooks.
* **Backup & Retention:** In production, enable automated point-in-time PostgreSQL backups in Supabase Pro tier before processing real applicant data.
