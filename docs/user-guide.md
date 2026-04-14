# CoverVerifi User Guide

Welcome to CoverVerifi, your subcontractor insurance compliance platform. This guide walks you through every feature of the application.

## What is CoverVerifi?

CoverVerifi helps general contractors and their consultants track whether subcontractors have valid insurance. Instead of calling insurance agents manually, CoverVerifi automates the process with email workflows, certificate storage, and a visual dashboard showing who is compliant and who needs attention.

## How to Log In

1. Open CoverVerifi in your web browser
2. Enter your email address and password
3. Click **Sign In**

### Demo Accounts

For testing, you can use these pre-configured accounts:

| Account Type | Email | Password |
|-------------|-------|----------|
| Consultant (Dawn) | dawn@boisecompliance.com | demo123 |
| General Contractor (Mike) | mike@tvbuilders.com | demo123 |
| General Contractor (Sarah) | sarah@eaglerockconst.com | demo123 |

Click any demo account button on the login page to auto-fill the credentials.

## Pages and Features

### Consultant Dashboard

**What it shows:** A bird's-eye view of all your GC clients and their compliance status.

- **Stat cards** at the top show your total GC clients, total subcontractors, overall compliance rate, and number of action items
- **GC Client cards** show each contractor's compliance breakdown with green (compliant), yellow (at risk), and red (non-compliant) counts
- **Action Items** list shows urgent items like expired certificates, upcoming expirations, and ghost policy flags

**What the colors mean:**
- **Green** = All insurance certificates are current and verified
- **Yellow** = A certificate is expiring within 30 days, pending verification, or has a coverage concern
- **Red** = A certificate is expired, lapsed, or missing entirely

**What you can do:**
- Click any GC card to see that contractor's subcontractor list
- Click any action item to go directly to that subcontractor's profile

### GC Dashboard

**What it shows:** Your own subcontractors and their insurance status (for GC users only).

- **Stat cards** show your total subs, compliant count, at-risk count, and non-compliant count
- **Subcontractor table** lists all your subs sorted worst-status-first
- Each row shows the company name, trade, compliance status, and expiration dates

**What you can do:**
- Click **Add Subcontractor** to onboard a new sub
- Click the arrow on any row to see full sub details

### Contractors List

**What it shows:** All your GC clients in a list format (consultant view only).

Each card shows:
- Company name and contact info
- Email, phone, and address
- Number of subcontractors and compliance percentage
- Overall compliance status badge

**What you can do:**
- Click any contractor card to see their full detail view with sub table

### Contractor Detail

**What it shows:** Everything about one GC client.

- Company info, contact details, and compliance requirements (GL minimums, WC requirements)
- Compliance stats bar showing green/yellow/red breakdown
- Full subcontractor table with search and status filters

**What you can do:**
- **Search** by company name or trade
- **Filter** by status (All, Green, Yellow, Red)
- Click **Add Sub** to add a new subcontractor to this GC
- Click any sub row to see their full profile

### Subcontractors List

**What it shows:** Every subcontractor you have access to.

- Searchable, filterable table showing all subs
- Each row shows company name, contact, trade, status, GL/WC expiration dates, and agent name

**What you can do:**
- **Search** by company name, trade, or contact name
- **Filter** by compliance status
- Click any row to see the full subcontractor profile

### Subcontractor Detail

**What it shows:** Complete profile for one subcontractor with four tabs.

#### Overview Tab
- Company info (name, contact, trade, email, phone, address, EIN)
- General Liability certificate card with policy number, carrier, dates, and coverage limits
- Workers Compensation certificate card with the same details
- Insurance agent info
- List of GCs this sub is linked to

#### Certificates Tab
- Detailed view of each certificate with all fields
- Endorsement status (Additional Insured, Waiver of Subrogation, Primary/Noncontributory)
- Ghost policy warnings

#### Documents Tab
- W-9 document on file with tax year and upload date
- Status indicator (Current or Expired)

#### Activity Tab
- Timeline showing when the sub was added, certificates uploaded, and verifications completed

**What you can do:**
- Click **Request Certs** to send an email to the insurance agent requesting new certificates
- Click **Verify** to send a verification request asking the agent to confirm the policy is active
- A confirmation toast appears when emails are sent

### Add Subcontractor (4-Step Wizard)

**Step 1 - Company Info:**
- Enter the company name (required), contact name, trade (required), email, phone, address, EIN, and entity type
- If you're a consultant, select which GC to assign the sub to
- The system checks for duplicates by company name or EIN

**Step 2 - W-9 Upload:**
- Optionally upload the sub's W-9 form (PDF)
- You can skip this step and add it later

**Step 3 - Insurance Agent:**
- Enter the agent's name (required), agency (required), email (required), and phone
- This is the agent who will receive certificate requests

**Step 4 - Review:**
- Review all entered information
- Click **Add Subcontractor** to complete

### Agent Verification Portal

**What it is:** A public page that insurance agents access via email links. No login required.

**How it works:**
1. An agent receives an email with a unique, time-limited link
2. They click the link and see three options:
   - **Upload Certificate** - Upload a new or renewed ACORD 25 certificate PDF
   - **Confirm Policy Active** - Attest that the current policy is in effect
   - **No Longer Agent of Record** - Flag that they no longer represent this subcontractor
3. After submitting, a confirmation page appears

Links expire after 7 days. If an agent clicks an expired link, they see a message asking them to contact you for a new link.

### Notifications

Click the **bell icon** in the top-right corner of the header to see notifications.

Types of notifications:
- Expiration warnings (certificates expiring within 30 days)
- Expired certificate alerts
- Ghost policy detections
- Pending verification reminders
- New certificate uploads

Click **Mark all read** to clear all notification badges. Click any notification to mark it as read.

## Common Workflows

### How to check if a subcontractor is compliant before a payment draw

1. Log in as a GC or Consultant
2. Go to the subcontractors list
3. Look at the status badge next to each sub
4. **Green** = safe to pay, **Yellow** = review first, **Red** = do not pay until resolved
5. Click any non-green sub to see what's wrong

### How to request a new certificate from an agent

1. Go to the subcontractor's detail page
2. Click the **Request Certs** button (blue, top-right)
3. A toast notification confirms the email was sent
4. Check the Notifications panel for the agent's response

### How to verify a policy is still active

1. Go to the subcontractor's detail page
2. Click the **Verify** button (outlined, top-right)
3. The system sends a verification email to the agent with a tokenized link
4. When the agent responds, you'll receive a notification

### How to add a new subcontractor

1. Click **Add Sub** from any page that shows the button
2. Fill in company information (Step 1)
3. Upload W-9 if available (Step 2)
4. Enter insurance agent details (Step 3)
5. Review and submit (Step 4)

## Frequently Asked Questions

**Q: Can subcontractors log in?**
A: Not in this version. Subcontractors interact with the system only through email links.

**Q: Can insurance agents log in?**
A: No. Agents use tokenized email links to upload certificates and confirm policies. No account needed.

**Q: What does "ghost policy" mean?**
A: A ghost policy is a workers' compensation policy with minimal coverage (often $0 payroll) that technically exists but provides no real protection. CoverVerifi flags these for your review.

**Q: Can other GCs see my subcontractors?**
A: No. Each GC can only see their own subcontractors. Even if two GCs share a subcontractor, neither can see the other's data.

**Q: How far in advance does CoverVerifi warn about expiring certificates?**
A: Certificates are flagged as "At Risk" (yellow) when they are within 30 days of expiration.

**Q: What are the default compliance requirements?**
A: General Liability: $1,000,000 per occurrence / $2,000,000 aggregate. Workers Comp: Statutory coverage per Idaho requirements.

## Troubleshooting

**Page won't load or shows a blank screen:**
- Make sure you're using a modern browser (Chrome, Firefox, Safari, Edge)
- Try clearing your browser cache
- Check your internet connection

**Can't log in:**
- Verify you're using the correct email and password
- Passwords are case-sensitive
- Try the demo accounts listed above to confirm the system is working

**Button doesn't respond:**
- Some buttons require an insurance agent to be assigned to the subcontractor
- Check that all required fields are filled in

**Data looks outdated:**
- Refresh the page to load the latest data

## Contact & Support

For help with CoverVerifi, contact:

**Acentra Labs**
Website: [https://acentralabs.com](https://acentralabs.com)
