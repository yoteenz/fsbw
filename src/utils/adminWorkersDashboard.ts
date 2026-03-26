/**
 * Admin worker roster — edit this file to update names, roles, hours, pay, and tasks.
 * Dashboard WORKERS card builds summary metrics in `admin/dashboard/page.tsx` from this roster.
 * Full duties, daily tasks, hours, pay lines, contacts, and notes are on `/admin/workers` only.
 */
export type AdminDashboardWorker = {
  id: string;
  /** Hire name when filled; use PLACEHOLDER until assigned. `/admin/workers` shows `role` as the card title. */
  name: string;
  /** Job position for your brand — primary heading on the workers page. */
  role: string;
  jobDuties: string[];
  dailyTasks: string[];
  /** e.g. "MON–FRI 9AM–5PM" or "ROTATING — SEE SCHEDULE" */
  scheduledHours: string;
  /** Display string only (e.g. hourly rate or salary label) */
  pay: string;
  contact?: string;
  notes?: string;
};

/** Brand roster: replace PLACEHOLDER names, pay, contacts, and hours with your real team. */
export const ADMIN_DASHBOARD_WORKERS: AdminDashboardWorker[] = [
  {
    id: '1',
    name: 'PLACEHOLDER — PERSONAL ASSISTANT',
    role: 'Personal assistant / customer service',
    jobDuties: [
      'Calendar, travel, and executive inbox for leadership',
      'Coordinate shoots, events, and client VIP visits',
      'Track action items across creative, legal, and ops',
      'Admin PENDING tab: approve or queue affiliate items, reviews, order forms, and other pending items per SOP',
      'Priority / concierge messages: read, respond, and escalate to owner, stylist, or legal when needed',
      'Customer service: respond to client emails, DMs, and written support; document outcomes in admin',
    ],
    dailyTasks: [
      'Morning brief + priority list for owner',
      'Work PENDING queues (affiliate, reviews, forms, messages) — clear or flag for approval',
      'Reply to client email and support threads; route urgent installs or disputes to hair stylist or lawyer',
      'Confirm same-day meetings and call times',
      'File expenses and receipts to accountant',
    ],
    scheduledHours: 'MON–FRI 9:00 AM – 5:00 PM (flex with owner)',
    pay: '$—/hr — edit in adminWorkersDashboard.ts',
    contact: 'pa@example.com',
    notes: 'Primary front line for admin Pending + inbox; owner signs off on edge cases.',
  },
  {
    id: '2',
    name: 'PLACEHOLDER — CREATIVE DIRECTOR',
    role: 'Creative director',
    jobDuties: [
      'Own visual voice: campaigns, site, packaging, and in-store',
      'Approve graphic, photo, and video output before publish',
      'Brief photographers, designers, and social on brand standards',
    ],
    dailyTasks: [
      'Review drafts in shared queue',
      'Sign off on color, type, and layout vs brand guide',
      'Sync with marketing on launches and drops',
    ],
    scheduledHours: 'MON–FRI 10:00 AM – 6:00 PM (shoot weeks: TBD)',
    pay: 'Salary — see internal sheet',
    contact: 'creative@example.com',
    notes: 'Final say on creative with owner.',
  },
  {
    id: '3',
    name: 'PLACEHOLDER — ACCOUNTANT',
    role: 'Accountant',
    jobDuties: [
      'Bookkeeping, payroll, and month-end close',
      'Sales tax, 1099s, and vendor payments',
      'Reconcile Shopify/admin revenue with bank',
    ],
    dailyTasks: [
      'Post daily sales and fees',
      'Flag anomalies in refunds and chargebacks',
      'Weekly cash-flow snapshot for owner',
    ],
    scheduledHours: 'MON–FRI 8:00 AM – 4:00 PM (remote OK)',
    pay: 'Salary / firm retainer — edit in adminWorkersDashboard.ts',
    contact: 'accounting@example.com',
  },
  {
    id: '4',
    name: 'PLACEHOLDER — LAWYER',
    role: 'Lawyer',
    jobDuties: [
      'Contracts: talent, vendors, leases, and partnerships',
      'IP, trademarks, and content clearance',
      'Employment policies and compliance',
    ],
    dailyTasks: [
      'Review contracts in “legal” inbox',
      'Track filing and renewal dates',
      'Ad-hoc counsel on disputes and terms',
    ],
    scheduledHours: 'As retained — scheduled calls & turnaround SLAs',
    pay: 'Retainer + hourly — edit in adminWorkersDashboard.ts',
    contact: 'legal@example.com',
    notes: 'Outside counsel OK; keep conflicts list current.',
  },
  {
    id: '5',
    name: 'PLACEHOLDER — GRAPHIC DESIGNER',
    role: 'Graphic designer',
    jobDuties: [
      'Web, email, ads, and print for Frontal Slayer / Build-a-Wig',
      'Maintain templates and asset library',
      'Resize and export for social specs',
    ],
    dailyTasks: [
      'Pick up tickets from creative director queue',
      'Export finals for dev and social',
      'Archive source files with naming convention',
    ],
    scheduledHours: 'MON–FRI 9:00 AM – 5:00 PM',
    pay: '$—/hr or project — edit in adminWorkersDashboard.ts',
    contact: 'design@example.com',
  },
  {
    id: '6',
    name: 'PLACEHOLDER — PHOTOGRAPHER',
    role: 'Photographer',
    jobDuties: [
      'Product, lifestyle, and campaign stills',
      'Studio and on-location lighting setup',
      'Deliver selects + retouch notes to creative director',
    ],
    dailyTasks: [
      'Prep shot lists and props per shoot',
      'Back up cards; basic cull same day',
      'Hand off RAWs / finals per brand spec',
    ],
    scheduledHours: 'Shoot-based + prep days (calendar with creative)',
    pay: 'Day rate / $—/hr — edit in adminWorkersDashboard.ts',
    contact: 'photo@example.com',
  },
  {
    id: '7',
    name: 'PLACEHOLDER — VIDEOGRAPHER / EDITOR',
    role: 'Videographer / editor',
    jobDuties: [
      'Film campaigns, tutorials, and social reels',
      'Edit color, sound, and captions to brand',
      'Export platform-specific cuts (9:16, 1:1, 16:9)',
    ],
    dailyTasks: [
      'Sync with creative on storyboard',
      'Versioning: draft → notes → final',
      'Upload masters + project files to shared drive',
    ],
    scheduledHours: 'Project-based (prep/edit blocks as scheduled)',
    pay: 'Day rate / $—/hr — edit in adminWorkersDashboard.ts',
    contact: 'video@example.com',
  },
  {
    id: '8',
    name: 'PLACEHOLDER — SOCIAL MEDIA PLANNER / MANAGER',
    role: 'Social media content planner / manager',
    jobDuties: [
      'Content calendar aligned with drops and campaigns',
      'Posting, community management, and UGC coordination',
      'Analytics weekly: reach, saves, clicks, and best hooks',
    ],
    dailyTasks: [
      'Schedule posts; monitor DMs and comments',
      'Brief photo/video on trending formats',
      'Pull weekly metrics report for leadership',
    ],
    scheduledHours: 'MON–SUN coverage (core hours MON–FRI; weekend checks)',
    pay: 'Salary — see internal sheet',
    contact: 'social@example.com',
  },
  {
    id: '9',
    name: 'PLACEHOLDER — MAKEUP ARTIST',
    role: 'Makeup artist',
    jobDuties: [
      'On-set glam for shoots, shows, and VIP clients',
      'Align looks with creative direction and wardrobe',
      'Sanitation and kit restock standards',
    ],
    dailyTasks: [
      'Confirm call times and mood boards',
      'Patch tests / skin notes for sensitive clients',
      'Clean brushes and inventory after each job',
    ],
    scheduledHours: 'Call-based (shoots & events)',
    pay: '$—/hr or day rate — edit in adminWorkersDashboard.ts',
    contact: 'mua@example.com',
  },
  {
    id: '10',
    name: 'PLACEHOLDER — HAIR STYLIST',
    role: 'Hair stylist',
    jobDuties: [
      'Wig styling, installs, and client consultations',
      'Prep units for photography and events',
      'Train assistants on brand finish and texture',
    ],
    dailyTasks: [
      'Review day’s appointments and cap sizes',
      'Sanitize stations; reset for next client',
      'Log custom notes in admin for orders',
    ],
    scheduledHours: 'TUE–SAT 10:00 AM – 7:00 PM (adjust per location)',
    pay: '$—/hr + commission — edit in adminWorkersDashboard.ts',
    contact: 'stylist@example.com',
    notes: 'Key holder if applicable.',
  },
];
