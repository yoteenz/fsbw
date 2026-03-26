/**
 * Admin worker roster — ten explicit brand positions for Frontal Slayer / Build-a-Wig (online wig shop).
 * Edit names, hours, pay, contacts here. Careers page and /admin/workers read this list.
 */
export type AdminDashboardWorker = {
  id: string;
  /** Hire name when filled; use PLACEHOLDER until assigned. `/admin/workers` shows `role` as the card title. */
  name: string;
  /** Single position title — shown on careers and admin cards. */
  role: string;
  /** How many seats/openings listed for this role (admin workers + careers can surface this later). */
  openings: number;
  /** Short overview for public careers (“About the role”). */
  aboutTheRole: string;
  /** Education / credentials line for careers and admin. */
  requiredEducation: string;
  jobDuties: string[];
  dailyTasks: string[];
  /** e.g. "MON–FRI 9AM–5PM" or "ROTATING — SEE SCHEDULE" */
  scheduledHours: string;
  /** Display string only (e.g. hourly rate or salary label) */
  pay: string;
  contact?: string;
  notes?: string;
};

/** Ten fixed positions: personal assistant/CS, creative director, accountant, lawyer, graphic designer, photographer, videographer/editor, social planner/manager, MUA, hair stylist. */
export const ADMIN_DASHBOARD_WORKERS: AdminDashboardWorker[] = [
  {
    id: '1',
    name: 'PLACEHOLDER — PERSONAL ASSISTANT',
    role: 'Personal assistant / customer service',
    openings: 1,
    aboutTheRole:
      'You represent Frontal Slayer / Build-a-Wig to shoppers and partners through email, DMs, and tools. You keep orders, returns, and admin Pending queues organized and escalate when policies or legal risk need the owner.',
    requiredEducation:
      'High school diploma or equivalent; 2+ years customer service, e-commerce support, or executive assistance preferred.',
    jobDuties: [
      'First line for customer email, DMs, and order questions for the online shop (Build-a-Wig / Frontal Slayer)',
      'Track and respond to shipping, returns, exchanges, and “where is my order” for wig and custom unit orders',
      'Monitor admin Pending queues: affiliate submissions, reviews, order authorization forms — approve, reject, or escalate per SOP',
      'Route concierge / priority messages to the owner, hair stylist, or lawyer when needed',
      'Keep leadership calendar and internal follow-ups for drops, restocks, and campaign dates',
    ],
    dailyTasks: [
      'Clear or flag pending items in admin; log outcomes',
      'Reply to client threads; document resolutions',
      'Morning checklist: urgent inbox + overnight orders',
    ],
    scheduledHours: 'MON–FRI 9:00 AM – 5:00 PM (flex with owner)',
    pay: '$—/hr — edit in adminWorkersDashboard.ts',
    contact: 'pa@example.com',
    notes: 'Primary front line for shop support + admin Pending; owner signs off on edge cases.',
  },
  {
    id: '2',
    name: 'PLACEHOLDER — CREATIVE DIRECTOR',
    role: 'Creative director',
    openings: 1,
    aboutTheRole:
      'You guard the visual voice of the brand across the site, campaigns, and social. You align photographers, designers, and marketers so every asset matches wig quality and brand standards before it ships.',
    requiredEducation:
      "Bachelor's degree in design, marketing, fashion, or related field; 4+ years creative leadership or brand direction; portfolio required.",
    jobDuties: [
      'Own creative direction for the wig brand across website, paid ads, email, and social',
      'Set visual standards for product presentation (texture, color accuracy, lace/cap details)',
      'Approve campaign concepts, shot lists, and final assets before they go live',
    ],
    dailyTasks: [
      'Review creative queue from design, photo, and video',
      'Align launches with inventory and marketing calendar',
    ],
    scheduledHours: 'MON–FRI 10:00 AM – 6:00 PM (campaign weeks: TBD)',
    pay: 'Salary — see internal sheet',
    contact: 'creative@example.com',
    notes: 'Final creative sign-off with owner.',
  },
  {
    id: '3',
    name: 'PLACEHOLDER — ACCOUNTANT',
    role: 'Accountant',
    openings: 1,
    aboutTheRole:
      'You keep e-commerce books accurate: sales, fees, taxes, and vendor payouts tied to our wig inventory and contractors. You surface cash and margin issues early for leadership.',
    requiredEducation:
      "Associate or bachelor's in accounting or finance; CPA or enrolled agent preferred; experience with Shopify or similar e-commerce accounting.",
    jobDuties: [
      'Bookkeeping for e-commerce revenue, payment processors, refunds, and fees',
      'Sales tax, 1099s, and vendor payouts (hair suppliers, contractors)',
      'Month-end close; reconcile online sales to bank',
    ],
    dailyTasks: [
      'Post daily sales and payment batches',
      'Flag refund/chargeback anomalies',
      'Weekly cash snapshot for owner',
    ],
    scheduledHours: 'MON–FRI 8:00 AM – 4:00 PM (remote OK)',
    pay: 'Salary / firm retainer — edit in adminWorkersDashboard.ts',
    contact: 'accounting@example.com',
  },
  {
    id: '4',
    name: 'PLACEHOLDER — LAWYER',
    role: 'Lawyer',
    openings: 1,
    aboutTheRole:
      'You protect the brand and business with clear terms, contracts, and IP for an online wig retailer. You advise on influencers, vendors, and compliance without slowing launches.',
    requiredEducation:
      'J.D. and active bar membership; experience with e-commerce, retail, or consumer brands preferred.',
    jobDuties: [
      'Terms of service, privacy, and shop policies for online sales',
      'Contracts: influencers, vendors, hair suppliers, contractors',
      'Trademarks / brand IP; content clearance for campaigns',
    ],
    dailyTasks: [
      'Review contracts and policy updates in legal inbox',
      'Track filing and renewal dates',
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
    openings: 1,
    aboutTheRole:
      'You produce on-brand graphics for the site, email, ads, and product pages so units read clearly online. You maintain templates and hand off files that dev and marketing can ship fast.',
    requiredEducation:
      "Associate or bachelor's in graphic design or equivalent; strong Figma/Adobe skills; portfolio with e-commerce or beauty samples.",
    jobDuties: [
      'Web graphics, product tiles, email headers, and ad creatives for wig SKUs and collections',
      'Maintain templates (sale badges, size charts, care cards) and export specs for dev',
      'Resize and package assets for social and paid placements',
    ],
    dailyTasks: [
      'Work tickets from creative director',
      'Export finals with correct naming and archive sources',
    ],
    scheduledHours: 'MON–FRI 9:00 AM – 5:00 PM',
    pay: '$—/hr or project — edit in adminWorkersDashboard.ts',
    contact: 'design@example.com',
  },
  {
    id: '6',
    name: 'PLACEHOLDER — PHOTOGRAPHER',
    role: 'Photographer',
    openings: 1,
    aboutTheRole:
      'You capture wigs and custom units so texture, lace, and color read true on the shop and in campaigns. You partner with creative on shot lists and deliver organized selects.',
    requiredEducation:
      'Professional photography experience; portfolio with product or beauty; studio lighting and color management skills.',
    jobDuties: [
      'Product photography for shop listings: units, lace, density, and color accuracy',
      'Flat lays, on-model shots, and detail macros for custom Build-a-Wig options',
      'Deliver selects and retouch notes to creative director',
    ],
    dailyTasks: [
      'Prep shot lists per SKU / drop',
      'Back up files; basic cull same day',
    ],
    scheduledHours: 'Shoot days + prep (calendar with creative)',
    pay: 'Day rate / $—/hr — edit in adminWorkersDashboard.ts',
    contact: 'photo@example.com',
  },
  {
    id: '7',
    name: 'PLACEHOLDER — VIDEOGRAPHER / EDITOR',
    role: 'Videographer / editor',
    openings: 1,
    aboutTheRole:
      'You film and edit short-form and tutorial content that teaches install, care, and styling while staying on brand. You export platform-ready cuts for social and the site.',
    requiredEducation:
      'Demo reel required; experience with Premiere, DaVinci, or Final Cut; beauty, fashion, or product video preferred.',
    jobDuties: [
      'Film and edit tutorials (install, care, styling), reels, and campaign video for wigs',
      'Color, captions, and brand-safe pacing for TikTok / IG / YouTube',
      'Export 9:16, 1:1, and 16:9 cuts as needed',
    ],
    dailyTasks: [
      'Sync with creative on hooks and shot list',
      'Versioning: draft → notes → final; upload masters to shared drive',
    ],
    scheduledHours: 'Project-based (shoot + edit blocks)',
    pay: 'Day rate / $—/hr — edit in adminWorkersDashboard.ts',
    contact: 'video@example.com',
  },
  {
    id: '8',
    name: 'PLACEHOLDER — SOCIAL MEDIA CONTENT PLANNER / MANAGER',
    role: 'Social media content planner / manager',
    openings: 1,
    aboutTheRole:
      'You plan and publish content around drops and campaigns, manage community touchpoints, and report what performs for a wig brand across social channels.',
    requiredEducation:
      "Bachelor's in marketing, communications, or related; 2+ years social management; analytics and scheduling tools experience.",
    jobDuties: [
      'Content calendar tied to drops, restocks, and paid campaigns',
      'Posting, community management, and UGC for the wig brand',
      'Weekly metrics: reach, saves, clicks, best-performing hooks',
    ],
    dailyTasks: [
      'Schedule posts; monitor DMs and comments for lead handoff to CS',
      'Brief photo/video on trending formats',
    ],
    scheduledHours: 'MON–SUN coverage (core MON–FRI; weekend checks)',
    pay: 'Salary — see internal sheet',
    contact: 'social@example.com',
  },
  {
    id: '9',
    name: 'PLACEHOLDER — MAKEUP ARTIST',
    role: 'Makeup artist',
    openings: 1,
    aboutTheRole:
      'You deliver camera-ready makeup for e-commerce and campaign shoots featuring our units. You follow creative direction, maintain kit hygiene, and keep call times tight.',
    requiredEducation:
      'State cosmetology or makeup certification where required; professional kit; on-set beauty or editorial portfolio.',
    jobDuties: [
      'On-set glam for e-commerce and campaign shoots (models in units)',
      'Looks aligned with creative direction and wardrobe',
      'Sanitation and kit standards',
    ],
    dailyTasks: [
      'Confirm call times and reference boards',
      'Reset kit after each shoot',
    ],
    scheduledHours: 'Call-based (shoots & campaigns)',
    pay: '$—/hr or day rate — edit in adminWorkersDashboard.ts',
    contact: 'mua@example.com',
  },
  {
    id: '10',
    name: 'PLACEHOLDER — HAIR STYLIST',
    role: 'Hair stylist',
    openings: 1,
    aboutTheRole:
      'You style and install wigs for clients and prep units for shoots. You document technical notes in admin so custom Build-a-Wig orders match the client.',
    requiredEducation:
      'Cosmetology license where required; advanced wig construction, customization, and install experience; client-facing professionalism.',
    jobDuties: [
      'Custom wig styling, installs, and consultations (in-person or by appointment per your model)',
      'Prep styled units for photography when scheduled',
      'Document client cap size, texture, and finish notes for custom orders in admin',
    ],
    dailyTasks: [
      'Review appointments and order notes',
      'Sanitize station between clients',
    ],
    scheduledHours: 'Set per location — edit in adminWorkersDashboard.ts',
    pay: '$—/hr + commission — edit in adminWorkersDashboard.ts',
    contact: 'stylist@example.com',
    notes: 'Lead on technical hair + install questions escalated from CS.',
  },
];
