/*
 * One registry for homepage cards and Next case navigation.
 * Paths are relative to the site root, including when hosted in a subdirectory.
 * Array order controls both views. Large cards are shown before small cards.
 * Copy is taken verbatim from each case's heading, header tags, lede and Timeline.
 */
window.PORTFOLIO_CASES = [
  {
    slug: 'loan-platform',
    url: 'cases/loan-platform/',
    title: 'Turning three vibe-coded versions into one loan platform',
    summary: 'A loan management platform for an Australian private lender. Over about four weeks I restructured the product, redesigned its main workflows and laid out the structure the team still builds on.',
    meta: 'Jul–Aug 2026, about 4\u00a0weeks',
    tags: ['Fintech', 'B2B', 'Web app'],
    image: 'cases/loan-platform/images/thumbnail.webp',
    size: 'large',
    side: 'right',
    published: true
  },
  {
    slug: 'release-groups',
    url: 'cases/release-groups/',
    title: 'Rolling out updates to client devices in stages',
    summary: "A new part of HS-Soft's internal device console. HS-Soft makes POS and self-checkout software for bakeries, cafés and restaurants. I turned the CTO's idea of release groups into a tool that lets support send a version to the right devices, follow the rollout and stop it.",
    meta: 'Dec 2025, about a month',
    tags: ['Internal tools', 'B2B', 'Web app'],
    image: 'cases/release-groups/images/hero.webp',
    size: 'large',
    side: 'right',
    published: true
  },
  {
    slug: 'property-documents',
    url: 'cases/property-documents/',
    title: 'One request for every document a property sale needs',
    summary: 'A platform where Australian sellers and agents order the legal documents needed to list a property, and staff collect them. In about four weeks I turned a pile of AI-written briefs into one simple model and designed the customer, agent and manager apps around it.',
    meta: 'Aug–Sep 2026, about 4\u00a0weeks',
    tags: ['Legal tech', 'B2B', 'Web app'],
    image: 'cases/property-documents/images/hero.webp',
    size: 'large',
    side: 'right',
    published: true
  },
  {
    slug: 'wawi-audit',
    url: 'cases/wawi-audit/',
    title: 'Auditing order creation in a bakery ERP',
    summary: 'WaWiAssist is HS-Soft’s order management system for bakeries. I used PostHog analytics and a short stakeholder survey to choose which tasks to audit, then studied session recordings and heatmaps of order creation. I proposed changes to navigation, the customer filter and search.',
    meta: 'Late 2025, about 2 months',
    tags: ['B2B', 'ERP', 'UX audit'],
    image: 'cases/wawi-audit/images/thumbnail.webp?v=thumb-ea1454817962',
    size: 'large',
    side: 'right',
    published: true
  },
  {
    slug: 'receipt-search',
    url: 'cases/receipt-search/',
    title: 'Searching receipts without hitting the table limit',
    summary: 'CashAssist Web is HS-Soft’s back-office application for managing cash registers and reviewing sales data. I worked on receipt search in its analytics module, where users find receipts, review their details and export results.',
    meta: 'June 2026',
    tags: ['B2B', 'Retail analytics', 'Data search'],
    image: 'cases/receipt-search/images/hero.webp',
    size: 'small',
    side: 'right',
    published: true
  },
  {
    slug: 'async-task-service',
    url: 'cases/async-task-service/',
    title: "Monitoring background tasks in one dashboard",
    summary: "Async Task Service runs background jobs such as CSV imports and report generation. I redesigned its monitoring dashboard for HS-Soft’s operations and engineering teams, adapting the supplied prototype to the company’s UX patterns and refining task filtering, status labels and access to task details.",
    meta: '',
    tags: ['B2B', 'Developer tools', 'Task monitoring'],
    image: 'cases/async-task-service/images/hero.webp?v=thumb-968b81026c77',
    size: 'small',
    side: 'right',
    published: true
  },
  {
      "slug": "wizmenu",
      "url": "cases/wizmenu/",
      "title": "Designing WizMenu for owners and guests",
      "summary": "WizMenu lets restaurants manage a digital menu that guests open by scanning a QR code. I designed the admin panel and reworked the guest menu, focusing on everyday editing, reviewing changes before publication, and navigation through sections and categories.",
      "meta": "",
      "tags": [
          "B2B",
          "Restaurant software",
          "QR menus"
      ],
      "image": "cases/wizmenu/images/hero.webp",
      "size": "small",
      "side": "right",
      "published": true
  }
];

// Small-card layout fixtures. Keep hidden on the finished homepage.
// Enable these three entries to preview a row without inventing any case copy.
window.PORTFOLIO_CASES.push(
  ...window.PORTFOLIO_CASES.slice(0, 3).map(entry => ({
    ...entry,
    slug: entry.slug + '-small-preview',
    size: 'small',
    published: false
  }))
);
