# Approved Features: CoverVerifi

### MUST HAVE (7 features)

1. **Authentication & Role-Based Routing**: Supabase Auth login with role-based route protection. Consultants land on multi-GC admin dashboard; GCs land on their scoped sub portal. Gating mechanism for every other feature.
2. **Consultant Multi-GC Admin Dashboard**: Portfolio overview showing all GC clients as compliance-scored cards (green/yellow/red), action items queue (expired certs, unresponded verifications >7 days, new subs without insurance), and portfolio-level stats. First thing Dawn sees after login.
3. **GC Subcontractor Compliance Table**: Sortable, filterable data table with per-row GL + WC compliance status badges, expiration countdowns, agent info, and search. Default sort: worst-status first. The view GCs check before every payment draw.
4. **Subcontractor Management & Add Wizard**: 4-step wizard (Company → W-9 → Agent → Review) with duplicate detection by company name/EIN, multi-GC linking via junction table, W-9 PDF upload (manual data entry, no OCR), and agent assignment.
5. **Subcontractor Detail View**: Full profile with tabbed sections (Overview, Certificates, W-9 & Documents, Activity). Shows company info, insurance policies with coverage limits, compliance timeline, agent info, and action buttons for cert requests/reminders.
6. **Compliance Status Engine & Visual System**: Shared utility module computing real-time status per sub from certificate expirations, coverage limits, and GC requirements. Powers traffic-light badges, expiration countdowns, compliance percentages, and action items across all views.
7. **Agent Verification Portal (Public)**: No-auth page at `/verify/:token` where insurance agents upload certificates, confirm active policies, or flag they're no longer the agent of record. Mobile-first, 60px touch targets, zero adoption friction.

### NICE TO HAVE (12 features)

1. **Email Workflow UI & Template Previewer**: Read-only preview of all email templates with merge field interpolation. Mock "Send" logs to `email_log`. Already built in prototype.
2. **Notification Center & Activity Feed**: Slide-out panel from bell icon showing system events chronologically — certs uploaded, verifications received, expirations approaching. Badge count on bell.
3. **Compliance Summary Charts**: Donut chart (compliance distribution), bar chart (expirations by GC), coverage breakdown. Uses recharts via shadcn/ui Chart.
4. **Bulk CSV Subcontractor Import**: Upload CSV, preview in editable table, validate, highlight errors, bulk-insert. Critical for Dawn's spreadsheet migration.
5. **Exportable Compliance Report**: Per-GC downloadable CSV or printable HTML with full sub compliance data. Audit readiness.
6. **Global Search (Cmd+K)**: Omnibar search across subs, GCs, agents, certificates using cmdk/shadcn Command.
7. **GC Client Management Page**: Sortable list of all GC clients with inline edit, archive, compliance requirements config. Already built as `ContractorsList.jsx`.
8. **Document Version History**: Chronological list of all certificate versions per coverage type within sub detail. Audit trail for 3+ years.
9. **Subcontractor Self-Service Portal**: Tokenized link for subs to upload W-9s/certs and view their compliance status (without revealing GC names).
10. **Draw Readiness View**: Pre-payment compliance checklist with one-click "Verify All" batch emails. Already built as `PaymentDraw.jsx`.
11. **Annual W-9 Renewal Reminders**: Flag W-9s older than 12 months with status badge and "Request Updated W-9" button.
12. **Configurable Notification Preferences**: Per-user toggles for which events trigger emails and digest frequency (immediate/daily/weekly).

### FUTURE (15 features)

1. **Real Email Engine (Resend/SendGrid)**: Full transactional email with templates, SPF/DKIM, delivery tracking. Deferred: requires domain setup and deliverability testing.
2. **W-9 OCR & AI Parsing**: Auto-extract W-9 fields from PDF. Deferred: requires backend AI pipeline.
3. **ACORD Certificate OCR**: Parse ACORD 25/27 certificates for auto-population. Deferred: varied carrier formats.
4. **Scheduled Expiration Monitoring (Cron)**: Daily automated scan with 30/14/7/1 day warning cadence. Deferred: depends on real email engine.
5. **Multi-Tenant Row-Level Security**: Supabase RLS policies for full data isolation between consultants. Deferred: prototype is single-tenant.
6. **Idaho IIC Workers' Comp Verification**: Real-time WC status verification via Idaho Industrial Commission. Deferred: API availability unknown.
7. **Ghost Policy Detection & Flagging**: Automated ghost policy indicators (low premiums, known carriers). Deferred: requires domain expertise rules.
8. **Payment Draw + ERP Integration**: QuickBooks/accounting sync with compliance-gated draw approval. Deferred: requires ERP context.
9. **SaaS Billing (Stripe)**: Subscription management with tiered pricing. Deferred: post-validation concern.
10. **API Integrations (Procore, HCSS, QuickBooks)**: Bi-directional sync with construction PM platforms. Deferred: requires API agreements.
11. **Mobile Native App (React Native / PWA)**: Native push notifications, offline viewing, camera upload. Deferred: responsive web covers 90% of cases.
12. **Consultant White-Label & Resale**: Custom branding, domain mapping, multi-consultant permissions. Deferred: requires theming engine.
13. **Subcontract Agreement Tracking**: Upload/track annual subcontract agreements. Deferred: explicitly deprioritized by Dawn.
14. **Multi-State Compliance Rules Engine**: Configurable rules per state (WC requirements, exemptions). Deferred: Idaho-only at launch.
15. **Additional Insured & Endorsement Workflow**: Track waiver of subrogation, primary/noncontributory, per-project aggregate. Deferred: open question in discovery.

### IMPLEMENTATION NOTES

**Dependencies:**
- Feature 1 (Auth) is a hard prerequisite for Features 2-5
- Feature 6 (Compliance Engine) is a shared utility consumed by Features 2, 3, and 5 — build alongside Auth
- Feature 7 (Agent Portal) is fully independent — can be built in parallel with everything else
- Features 3 and 5 share `StatusBadge`, `DataTable`, and `ComplianceBadge` components

**Build Order (5-Day Sprint):**
- Day 1: Supabase setup, schema migration (13 tables), Auth + Compliance Engine + shared components
- Day 2: GC Sub Table + Sub Detail View + Supabase query hooks
- Day 3: Add Sub Wizard + Agent Verification Portal + Supabase Storage
- Day 4: Consultant Dashboard + GC Portal scoping
- Day 5: Responsive polish, loading/empty states, end-to-end flow testing

**Key Packages:** `@supabase/supabase-js`, `@supabase/ssr`, `@tanstack/react-table`, `@tanstack/react-query`, `react-hook-form`, `@hookform/resolvers`, `zod`, `react-dropzone`, `date-fns`, `sonner`, `lucide-react`

**Assumptions:**
1. Single-tenant prototype (Dawn only) — multi-tenant RLS is FUTURE
2. Mock email sending — buttons log to `email_log` + toast, no real delivery
3. Manual certificate metadata entry — no OCR/parsing in MVP
4. Idaho-only compliance rules hardcoded ($1M GL, statutory WC)
5. Existing prototype has 11 pages + 8 components ready for Supabase migration

---

Full decomposition updated in `/TEST/claude/claude-opus-4-6/FEATURES.md`. Added NICE TO HAVE #12 (Configurable Notification Preferences) to close the gap with the brief's notification requirements. All other features confirmed aligned — 7 MUST HAVE, 12 NICE TO HAVE, 15 FUTURE, 13-table data model, 5-day build plan.
