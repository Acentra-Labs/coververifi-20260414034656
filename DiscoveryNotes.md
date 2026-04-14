# Discovery Brief: CoverVerifi

**Generated:** 20260414034656

---

## App Overview
**App Name:** CoverVerifi
**Alternative Names:** SubShield, CompliTrak, CertifyBase

CoverVerifi is a lightweight SaaS platform that automates subcontractor insurance compliance tracking for general contractors and their consultants. It replaces manual phone calls, scattered spreadsheets, and expensive enterprise platforms with automated email verification workflows, certificate storage, expiration alerts, and a role-based dashboard. Designed specifically for small-to-mid-size general contractors in Idaho (initially) who manage 10–50 subcontractors per project.

## Target Users

**Primary:**
- **Consultant/Administrator (Dawn's role):** Manages the entire system on behalf of one or more GCs. Onboards subcontractors, contacts insurance agents, verifies compliance, and monitors all GC accounts. This role is the system owner with full visibility.
- **General Contractor (GC):** Views their own subcontractors, compliance status, and certificate details. Needs quick mobile-friendly access in the field. Can add new subcontractors but cannot see other GCs' data.

**Secondary:**
- **Insurance Agent:** Receives automated email requests to verify or upload certificates. Interacts via tokenized links — no login required. Can flag that they are no longer the agent of record.
- **Subcontractor:** Minimal interaction with the system. May receive email prompts. Optionally uploads certificates via a link. Does not require a full account.

## Core Problem

General contractors are legally and financially liable for their subcontractors' insurance compliance. When a subcontractor's workers' comp or general liability policy lapses, the GC bears the risk — potentially six-figure audit surcharges, denied claims, or direct liability for workplace injuries (per Idaho Code §72-216).

**Current workaround:** Consultants like Dawn manually call every insurance agent for every subcontractor before every payment draw. With 15–20 subs per job and 20 different agents, this is hours of phone calls repeated monthly. Certificates are stored in OneDrive or spreadsheets with no expiration tracking, no automated alerts, and no verification that policies are actually active (vs. just showing a valid-looking certificate).

**Why existing tools fail:** Enterprise platforms (Avetta, Procore integrations) cost $4,500–$200,000/year and are overbuilt. Budget tools (myCOI, BCS) have slow document review, no real-time monitoring, and outdated UIs. Small GCs are stuck between spreadsheets and software they can't afford or don't need 90% of.

## Platform Recommendation

**Web App (responsive/mobile-friendly) — not native mobile.**

Reasoning:
- The Consultant/Admin performs most work at a desk (data entry, email workflows, certificate review). A full web dashboard is essential.
- GCs need quick field access to check sub compliance status — a responsive web app on their phone covers this without the cost and timeline of a native app.
- Insurance agents and subs interact via email links only — no app needed.
- Native mobile doubles the build scope and maintenance burden. A responsive PWA-capable web app achieves the "pull it up on my phone" need at a fraction of the cost.
- Native mobile can be a Phase 2 add-on once product-market fit is validated.

## Build Type

**web** — Full web application.

Reasoning: This product requires multi-role authentication, automated email workflows, file uploads/storage, role-based dashboards, and tokenized external links. These are far beyond Google Sheets capabilities. The multi-tenant SaaS model (Dawn wants to resell to other consultants) demands a proper web application with user management and data isolation.

## Recommended Tech Stack

**React + Vite + TailwindCSS + shadcn/ui + Supabase**

| Layer | Choice | Reasoning |
|-------|--------|-----------|
| Frontend | React + Vite + TailwindCSS + shadcn/ui | Fast SPA build, polished component library, responsive out of the box |
| Backend/DB | Supabase (Postgres + Auth + Storage + Edge Functions) | Managed auth with role-based access, file storage for certificates/W9s, Row Level Security for multi-tenant data isolation, edge functions for email workflows |
| Email | Resend or SendGrid | Transactional email with templates, delivery tracking, link tracking for agent verification flows |
| PDF Parsing | pdf-lib or Supabase Edge Function + OCR API | Parse ACORD 25 certificates and W9s to auto-populate fields |
| Hosting | Vercel or Netlify (frontend) + Supabase (backend) | Low-cost, scalable, no DevOps overhead |

## Key Requirements

### Account & Authentication
- Email/password authentication for Consultants and GCs [INFERRED: social login not needed for this B2B audience]
- Role-based access: Administrator/Consultant, General Contractor
- Multi-tenant architecture: Consultants manage multiple GCs; each GC sees only their own data
- [INFERRED] Session management with reasonable timeout for security
- [INFERRED] Password reset via email

### Subcontractor Onboarding
- GC or Consultant adds a new subcontractor with: company name, contact info (phone, email), insurance agent name/agency/phone/email
- W9 upload and ingestion: system parses the uploaded W9 (PDF), auto-fills fields (business name, EIN, address), and highlights missing/unreadable fields
- W9 tracking: flag when annual W9 renewal is needed
- If a subcontractor already exists in the system (added by another GC), the system recognizes them and links to existing agent info — but does NOT reveal which other GCs use that sub
- [INFERRED] Duplicate detection by EIN or business name to prevent redundant records

### Insurance Certificate Management
- Store uploaded ACORD 25 certificates (PDF) with parsed metadata
- Track per subcontractor: General Liability policy (number, carrier, agent, effective date, expiration date, per-occurrence limit, aggregate limit) and Workers Comp policy (number, carrier, agent, effective date, expiration date, employers liability limits)
- Track Additional Insured endorsement status per GC (checkbox to require; flag if missing)
- [INFERRED] Track Primary & Noncontributory and Waiver of Subrogation endorsement status
- Ghost policy detection/flagging: if workers comp shows $0 payroll / minimum premium, flag for GC review
- Certificate must be uploaded by the insurance agent (not the subcontractor) to prevent fraud — enforced via the tokenized agent verification workflow
- [INFERRED] Certificate version history — keep prior certificates on file for audit trail

### Automated Email Workflows
- **New sub onboarding:** Auto-email to insurance agent requesting current certificates (GL + WC) for the subcontractor
- **Expiration approaching (30 days):** Auto-email to agent requesting renewed certificate. Notification to Consultant and GC.
- **Verification before payment:** On-demand or scheduled email to agent: "Is this policy still active?" with a tokenized link for yes/no response
- **Lapse detected:** Alert email to Consultant and GC with subcontractor details
- **Agent no longer represents sub:** Agent clicks link to flag they are no longer the agent of record; system alerts Consultant to obtain new agent info
- Email templates customizable per GC (GC logo, company name, contact info)
- [INFERRED] Email delivery tracking: sent, opened, clicked, bounced

### Insurance Agent Interaction (No Login Required)
- Agents receive emails with tokenized, time-limited links
- Link options: Upload new certificate, Confirm policy is active (yes/no), Flag "I no longer represent this subcontractor"
- [INFERRED] Token expiration after 7 days with auto-reminder if not responded
- [INFERRED] Agent response logging for audit trail

### Dashboard & Reporting
- **Consultant dashboard:** Overview of all GCs, all subs, compliance status heat map, upcoming expirations, pending agent responses
- **GC dashboard:** List of their subcontractors with compliance status (green/yellow/red), expiration dates, agent info, policy numbers. Quick-glance view optimized for mobile.
- **Compliance status logic:** Green = all certificates current and verified; Yellow = expiring within 30 days or pending verification; Red = expired, lapsed, or missing
- [INFERRED] Export to PDF/CSV for audit documentation
- [INFERRED] Audit-ready report: list of all subs with certificate dates, verification history, and compliance status for a given date range
- Filterable by GC, by project (if projects are tracked), by compliance status

### Subcontractor Agreement Tracking (Nice-to-Have / Phase 2)
- Annual subcontract agreement: upload signed agreement, track renewal date
- Dawn noted this is "nice to have, not MVP" — include as a tracked field but not a blocking workflow

### Compliance Thresholds (Configurable)
- Default GL minimum: $1,000,000 per occurrence / $2,000,000 aggregate
- Default WC: Statutory (Part A) + Employers Liability per state requirements
- GC can customize thresholds per their requirements
- System flags certificates that don't meet the GC's configured minimums
- [INFERRED] Support for Idaho-specific rules initially; architecture should accommodate multi-state expansion

### Notifications
- In-app notification center for Consultant and GC
- Email notifications for: expiration warnings (30 days), lapse alerts, new certificate uploaded, agent response received, new sub added by GC
- [INFERRED] Configurable notification preferences (email frequency, which events)

## Competitive Landscape

### Direct Competitors

| Product | Pricing | Strengths | Weaknesses | Threat Level |
|---------|---------|-----------|------------|-------------|
| **myCOI Central** | ~$200–400/mo; $30–60/vendor/yr | Affordable entry point, Procore integration, vendor self-service portal | Slow document review (days to weeks), no real-time monitoring, outdated UI, accepts vendor-submitted PDFs (fraud risk) | Medium |
| **BCS** | Free up to 25 vendors; $0.95/vendor/mo self-service | Free tier, AI extraction, good for small GCs starting out | Limited at free tier, full-service has $10K minimum | Medium — closest to CoverVerifi's target market |
| **Certificial** | Free up to 5 vendors | Real-time policy monitoring via AMS integration, 90%+ compliance rates, highest-rated (4.7/5) | Small free tier, less construction-specific | Medium |
| **TrustLayer** | Custom pricing (mid-range) | Modern UI, AI-powered extraction, no vendor login required, 298K+ company network | Opaque fraud detection, smaller support team, no real-time monitoring | Low-Medium |
| **Jones** | Custom per-record/year | Construction & real estate focused, 110K+ vendor network | 24-hour turnaround (not real-time), custom pricing | Low |

### Enterprise Solutions (Not Direct Competitors — Too Expensive/Complex)

| Product | Pricing | Why Not a Fit |
|---------|---------|--------------|
| **Avetta** | Enterprise quote-based; contractors pay $600–2,500/yr/client | Designed for large enterprises, prohibitively expensive, forces contractors to pay, poor UX |
| **Procore** | $4,500–200,000+/yr | Construction PM platform — no native COI module, requires partner integration (myCOI, Jones, etc.) |
| **HCSS** | $60–4,000+/user/yr | Heavy civil focus, no COI tracking capability, not a competitor |
| **Constrafor** | $12,500–35,500/yr | Full subcontractor admin platform, too expensive for small GCs |

### Market Gap / CoverVerifi's Opportunity

Small GCs (5–25 employees, 10–50 subs, $1M–$20M annual revenue) are underserved. They need more than spreadsheets but can't justify $2,000+/year for enterprise platforms. CoverVerifi's differentiators:

1. **Consultant-centric model:** No other tool is built around a consultant managing compliance on behalf of multiple GCs. This is Dawn's business model and a unique angle.
2. **Agent-first verification:** Requiring certificates from agents (not subs) and providing frictionless tokenized links is a fraud-prevention feature most competitors lack.
3. **No sub/agent login required:** Like TrustLayer, but purpose-built for small construction. Agents and subs interact via email links only — zero adoption friction.
4. **Affordable for small GCs:** Target $50–150/month range, undercutting myCOI and far below enterprise options.
5. **Idaho-specific expertise initially:** Deep understanding of Idaho Industrial Commission requirements, sole proprietor exemptions, and local construction practices.

### Suggested Pricing Model [INFERRED]
- **Starter:** $49/mo — 1 GC, up to 25 subcontractors
- **Professional:** $99/mo — up to 5 GCs, up to 100 subcontractors
- **Agency:** $199/mo — unlimited GCs, unlimited subs, white-label email templates
- Per-GC add-on pricing for consultants managing many clients

## UX Considerations

### Primary User Flow (Consultant)
1. **Login** → Consultant dashboard showing all GCs with compliance overview
2. **Select GC** → GC detail view with list of subcontractors, compliance status
3. **Add Subcontractor** → Form: company name, contact info, agent info. Upload W9 (auto-parsed). System checks for existing sub record.
4. **Request Certificates** → One-click sends templated email to insurance agent requesting GL and WC certificates
5. **Agent Responds** → Agent clicks link, uploads certificate or confirms active status. System parses ACORD 25, extracts dates/limits, flags deficiencies.
6. **Monitor** → Dashboard shows red/yellow/green. 30-day expiration warnings auto-trigger emails. Pre-payment verification can be triggered manually or on schedule.

### GC User Flow
1. **Login** → See only their subcontractors with compliance status
2. **Add Sub** → Enter sub info; if sub exists in system, agent info auto-populates
3. **View Status** → At-a-glance compliance for upcoming draw. Red = don't pay until resolved.
4. **Mobile** → Same flow, responsive layout, optimized for quick status checks on job site

### Design Notes
- Clean, professional aesthetic — construction industry, not consumer app
- Color-coded compliance status throughout (green/yellow/red)
- Dashboard-first design — Consultant and GC both land on an actionable overview
- Minimal clicks to perform core actions (add sub, request cert, verify status)
- [INFERRED] Accessible design (WCAG 2.1 AA) — some GC users may be older or less tech-savvy
- [INFERRED] Dark/light mode not needed — keep it simple for v1
- Email templates should look professional and trustworthy (agents receive these from unknown senders)

## Technical Considerations

### Data Model (Core Entities)
- **Consultants** (multi-tenant owners)
- **General Contractors** (belong to a Consultant)
- **Subcontractors** (shared across GCs via junction table)
- **Insurance Agents** (linked to subcontractors)
- **Certificates** (GL and WC, linked to subcontractors, with parsed metadata)
- **W9 Documents** (linked to subcontractors, annual)
- **Verification Requests** (email log with token, status, response)
- **Email Templates** (per GC, customizable)
- [INFERRED] **Audit Log** (all actions tracked for compliance)

### Integrations
- **Email service** (Resend/SendGrid) for transactional emails with tracking
- **PDF parsing** for W9 and ACORD 25 certificate ingestion
- [INFERRED] **Idaho Industrial Commission** database for workers comp registration verification (if API available — needs research)
- No Procore/HCSS integration needed for v1 (target market doesn't use them)

### Security & Compliance
- Row Level Security in Supabase for multi-tenant data isolation
- Tokenized links for agent interactions (time-limited, single-use)
- [INFERRED] SSL/TLS for all data in transit
- [INFERRED] Encrypted file storage for certificates and W9s (contain EIN, business details)
- [INFERRED] Annual data retention policy aligned with construction audit cycles (typically 3–5 years)

### Constraints
- Dawn has no existing domain, hosting, or technical infrastructure
- Dawn has never worked with a software development team — UX must be intuitive, onboarding must be guided
- Cost-efficiency is critical — Supabase free/pro tier + Vercel free tier keeps hosting under $50/month initially
- Email volume: with 20 subs × multiple GCs × monthly verifications, could reach hundreds of emails/month — stay within transactional email provider free tiers initially

## Open Questions

1. **Budget range:** Dawn mentioned "cost efficient" — what is her budget for the initial build and monthly operating costs? This affects scope and timeline.
2. **Scale today:** How many GCs does Dawn currently consult for, and how many total subcontractors across all GCs? This sizes the database and email volume.
3. **Geographic scope:** Is this Idaho-only for now, or does Dawn want multi-state support from day one? Different states have different workers comp rules (e.g., Florida requires all construction workers to carry WC, Idaho exempts sole proprietors).
4. **Branding:** Does Dawn have any logo, color preferences, or brand identity? Or should we propose a visual direction?
5. **Resell model details:** When Dawn says "resell the app" — does she envision other consultants as paying subscribers? White-labeling? This affects multi-tenant architecture depth.
6. **Existing data:** Does Dawn have spreadsheets or OneDrive files with current sub/GC/agent data that need to be migrated into the system?
7. **"Endorsement" reference:** The notes mention "something about endorsement but missed it" — likely referring to Additional Insured endorsements (CG 20 10 / CG 20 37). Confirm with Dawn whether tracking endorsement type is important for v1.
8. **Subcontract agreement:** Dawn said this is "nice to have" — confirm it's out of scope for MVP or if any aspect of it is important for the initial launch.
