# BrightPath CRM — Master Implementation Plan

> **Project Stack:** React 19 + TypeScript + Vite + Supabase (PostgreSQL / Auth / RLS) + Vercel  
> **Target Business Domain:** BrightPath Academy (Educational Coaching Institute)  
> **Key User Roles:** Administrator, Manager, Counsellor  
> **Reference Document:** `BrightPath_CRM_Full_Master_Build_Prompt.docx`

---

## 1. System Architecture Overview

```
Browser (React 19 + TypeScript + Vite)
 ├── Presentation Layer:
 │    ├── src/components/layout/     # Sidebar, TopBar, Mobile Nav
 │    ├── src/components/common/     # StatusBadge, ConfigWarning, ErrorBoundary, Dialogs
 │    └── src/features/
 │         ├── dashboard/            # KPI Cards, Status & Source Breakdown, Overdue Alerts
 │         ├── leads/                # Enquiry CRUD, Multi-Filters, Drawer, Status Modals
 │         ├── followups/            # Scheduler, Overdue Engine, Completion Toggles
 │         └── activities/           # Chronological Audit Feed & Actor Mapping
 ├── Auth & State Management:
 │    ├── src/context/AuthContext.tsx# Supabase Auth Session, Profile Hydration, Role Reflection
 │    └── src/types/index.ts         # Strongly Typed Domain Models
 └── Service / Data Access Layer:
      ├── src/lib/supabaseClient.ts  # Singleton Client with Env Validation & Offline Fallback
      └── src/services/              # Typed PostgREST queries (leads, followups, activities, profiles)
              │
              ▼ (HTTPS / Public Anon Key)
Supabase Platform
 ├── Supabase Auth (auth.users)
 └── PostgreSQL Database
      ├── Tables: profiles, leads, follow_ups, activities
      ├── Triggers: handle_new_user (auth profile creation), update_timestamp
      └── Row Level Security (RLS Policies for Admin, Manager, Counsellor)
              │
              ▼ (Automated CI/CD)
Vercel Cloud Hosting (Production Deployment)
```

---

## 2. The 5-Stage Feature Delivery Protocol

Every feature phase follows this strict quality cycle:
$$\text{Develop} \longrightarrow \text{Test (Static/Build)} \longrightarrow \text{Verify (Functional)} \longrightarrow \text{Deploy / Staging Check} \longrightarrow \text{Re-Test (Post-Deployment)}$$

1. **Develop**: Implement modular, strongly typed code adhering to domain requirements.
2. **Test (Static & Build)**: Run `npm run typecheck` and `npm run build` to ensure zero compilation or lint errors.
3. **Verify (Functional)**: Manually verify all acceptance criteria and edge cases in the running app.
4. **Deploy / Staging Check**: Commit the working milestone cleanly to Git and ensure production build is deployable.
5. **Re-Test (Post-Deployment)**: Run end-to-end regression tests on the integrated build before moving to the next feature.

---

## 3. Database Schema Specification

### Tables & Relationships:
* **`profiles`**:
  * `id`: `uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE`
  * `full_name`: `text NOT NULL`
  * `role`: `text NOT NULL CHECK (role IN ('admin', 'manager', 'counsellor')) DEFAULT 'counsellor'`
  * `created_at`, `updated_at`: `timestamptz DEFAULT now()`
* **`leads`**:
  * `id`: `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  * `full_name`: `text NOT NULL`
  * `email`: `text NULL`
  * `phone`: `text NOT NULL`
  * `course_interest`: `text NOT NULL`
  * `source`: `text NOT NULL`
  * `status`: `text NOT NULL CHECK (status IN ('New', 'Contacted', 'Qualified', 'Converted', 'Lost')) DEFAULT 'New'`
  * `lost_reason`: `text NULL`
  * `assigned_to`: `uuid REFERENCES profiles(id) ON DELETE SET NULL`
  * `created_by`: `uuid REFERENCES profiles(id) ON DELETE SET NULL`
  * `notes`: `text NULL`
  * `created_at`, `updated_at`: `timestamptz DEFAULT now()`
* **`follow_ups`**:
  * `id`: `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  * `lead_id`: `uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE`
  * `assigned_to`: `uuid REFERENCES profiles(id) ON DELETE SET NULL`
  * `due_at`: `timestamptz NOT NULL`
  * `note`: `text NOT NULL`
  * `status`: `text NOT NULL CHECK (status IN ('pending', 'completed', 'cancelled')) DEFAULT 'pending'`
  * `completed_at`: `timestamptz NULL`
  * `created_by`: `uuid REFERENCES profiles(id) ON DELETE SET NULL`
  * `created_at`: `timestamptz DEFAULT now()`
* **`activities`**:
  * `id`: `uuid PRIMARY KEY DEFAULT gen_random_uuid()`
  * `lead_id`: `uuid NOT NULL REFERENCES leads(id) ON DELETE CASCADE`
  * `actor_id`: `uuid REFERENCES profiles(id) ON DELETE SET NULL`
  * `activity_type`: `text NOT NULL`
  * `description`: `text NOT NULL`
  * `metadata`: `jsonb NULL DEFAULT '{}'::jsonb`
  * `created_at`: `timestamptz DEFAULT now()`

---

## 4. Phased Implementation Roadmap & Execution Checklist

- [x] **Phase 1: Workspace Hygiene & Git Baseline**
  - [x] Stage existing modular TypeScript code, views, and configuration.
  - [x] Run static checks (`npm run typecheck`, `npm run build`).
  - [x] Commit working baseline: `git commit -m "feat: establish modular TypeScript architecture"`.
  - [x] *Acceptance Criteria*: `git status` reports working tree clean; production build succeeds.

- [x] **Phase 2: Database Design & Supabase Schema**
  - [x] Create `supabase/migrations/20261115000000_init_schema.sql` containing tables, check constraints, indexes, triggers, and RLS policies.
  - [x] Create `supabase/seed.sql` with realistic educational sample records.
  - [x] Document execution steps for Supabase SQL Editor.
  * *Acceptance Criteria*: SQL executes cleanly in Supabase; all 4 tables exist with RLS enabled; RLS prevents cross-role data leaks.

- [x] **Phase 3: Supabase Client & Service Abstraction Layer**
  - [x] Update `src/lib/supabaseClient.ts` with explicit connection diagnostics.
  - [x] Create `src/services/leadsService.ts` (CRUD, status mutators).
  - [x] Create `src/services/followUpsService.ts` (scheduler, completion toggles).
  - [x] Create `src/services/activitiesService.ts` (audit timeline fetcher).
  - [x] Create `src/services/profileService.ts` (counsellor assignment list).
  * *Acceptance Criteria*: All database operations are cleanly encapsulated in typed service files; UI components make no raw database calls.

- [x] **Phase 4: Authentication & User Role Lifecycle**
  - [x] Create `src/context/AuthContext.tsx` with session listener (`onAuthStateChange`).
  - [x] Build `src/components/auth/LoginView.tsx` / `AuthModal.tsx` for email/password sign-in and sign-up.
  - [x] Hydrate active user profile and enforce role-based access without client-side role escalation.
  - [x] Document Admin Bootstrap Procedure via Supabase SQL.
  * *Acceptance Criteria*: Users can log in/out; session persists across browser refresh; correct role permissions are loaded.

- [x] **Phase 5: Student Enquiry (Lead) Management System**
  - [x] Connect `LeadsView` to `leadService.ts` for live PostgreSQL persistence.
  - [x] Implement Create Enquiry modal with input sanitization and UUID validation.
  - [x] Implement real-time search and multi-filtering (Status, Source, Counsellor).
  - [x] Implement stage transitions (`New` -> `Contacted` -> `Qualified` -> `Converted` / `Lost` with mandatory lost reason).
  - [x] Verify automatic audit logging in `activities` upon lead creation and status changes.
  * *Acceptance Criteria*: Creating and editing enquiries persists in Supabase; counsellors cannot view unassigned enquiries.

- [x] **Phase 6: Follow-Up Scheduling & Overdue Engine**
  - [x] Connect `FollowUpsView` to `followUpService.ts` with live PostgreSQL mutations.
  - [x] Implement follow-up scheduler modal with quick time presets (+2h, Tomorrow, In 2 Days, Next Week).
  - [x] Build real-time overdue engine with relative overdue badges (`Overdue by X days/hours`).
  - [x] Implement completion toggle with `completed_at` timestamp synchronization.
  - [x] Enable direct navigation from follow-up cards to enquiry detail records.
  * *Acceptance Criteria*: Overdue badge dynamically alerts user; completed follow-ups do not show as overdue; persistence verified.

- [ ] **Phase 7: Activity Log & Audit Trail**
  - [ ] Connect `ActivitiesView` to `activitiesService.ts`.
  - [ ] Display chronological activity timeline with actor attribution and time-ago formatting.
  - [ ] Map activity types to descriptive icons and deep-links to associated enquiries.
  * *Acceptance Criteria*: Every enquiry and follow-up mutation produces a visible audit record; RLS scoping is respected.

- [ ] **Phase 8: Real-Time Analytics Dashboard & Metric Reconciliation**
  - [ ] Connect `DashboardView` to live Supabase queries.
  - [ ] Compute verified KPIs: Total Accessible Enquiries, New Enquiries, Converted Admissions, Conversion Rate (%), Overdue Follow-ups.
  - [ ] Display Enquiries by Status and Enquiries by Source distribution cards.
  - [ ] Ensure displayed metrics reconcile exactly with records shown in list views.
  * *Acceptance Criteria*: KPIs accurately reflect database state; conversion rate calculation handles division by zero safely.

- [ ] **Phase 9: UI Polish, Responsiveness & Accessibility Hardening**
  - [ ] Add mobile slide-over navigation drawer for screens `< 768px`.
  - [ ] Add visible keyboard focus rings and `Esc` key handling for modals.
  - [ ] Implement `ErrorBoundary` to gracefully catch and report network/runtime failures.
  - [ ] Ensure WCAG AA contrast compliance across all status badges and buttons.
  * *Acceptance Criteria*: Responsive layout verified on mobile, tablet, and desktop viewports; no UI regressions.

- [ ] **Phase 10: Testing Checklist & Handover Documentation**
  - [ ] Run full test matrix: static build, lint, auth lifecycle, lead CRUD, RLS isolation, responsive checks.
  - [ ] Complete `README.md` with prerequisites, installation, environment setup, SQL migration guide, and production limitations.
  * *Acceptance Criteria*: `README.md` provides complete standalone onboarding instructions; full test suite passes.

- [ ] **Phase 11: Vercel Production Deployment & Live Verification**
  - [ ] Verify production build bundle in `dist/`.
  - [ ] Push clean `main` branch to GitHub repository.
  - [ ] Guide user through Vercel project import and environment variable configuration (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
  - [ ] Execute smoke test on live Vercel URL (Sign in -> Create enquiry -> Schedule follow-up -> Verify dashboard).
  * *Acceptance Criteria*: Application is live on public HTTPS URL with real Supabase persistence verified.
