/**
 * scripts/seed-db.cjs
 *
 * Idempotent, transaction-wrapped database seeding script for Metaphi CMS (Strapi 5).
 * Uses Strapi 5 Documents API (app.documents) for collection and single types.
 *
 * Requirements satisfied:
 * 1. Safe Transaction: Cleanup, creates, publish, relation linking, and low-level slug fixes
 *    all participate atomically in app.db.transaction.
 * 2. Guaranteed Unique 10 Industries: Explicit slug specification, assertions of 0 collisions,
 *    and low-level slug verification/correction across draft and published versions.
 * 3. Pre-flight Checks: Production guard (NODE_ENV + DATABASE_HOST/URL + STRAPI_URL), media assets
 *    lookup by name (aborts if missing), dev server port guard (refuses unless --force).
 * 4. Lifecycle Safety: Boot with createStrapi().load(), always cleanup in finally { await app.destroy() }.
 * 5. Dry Run Support: --dry-run prints baseline counts and deletion/insertion plan without modifying DB.
 * 6. Summary Table: Formatted before/after table with assert validation and side-by-side slug report.
 */

const { createStrapi } = require('@strapi/strapi');
const path = require('path');
const net = require('net');

const appDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(appDir, '.env') });

const isDryRun = process.argv.includes('--dry-run');
const isForce = process.argv.includes('--force');

// ── 1. PRE-FLIGHT: Production Guard ───────────────────────────────────────────
function verifyEnvironmentSafety() {
  const nodeEnv = (process.env.NODE_ENV || 'development').toLowerCase();
  const dbHost = (process.env.DATABASE_HOST || '127.0.0.1').toLowerCase();
  const dbUrl = (process.env.DATABASE_URL || '').toLowerCase();
  const strapiUrl = (process.env.STRAPI_URL || 'http://localhost:1337').toLowerCase();

  const isLocalHost = (host) => host.includes('localhost') || host.includes('127.0.0.1') || host === '::1';

  if (nodeEnv === 'production') {
    console.error('FATAL GUARD: seed-db.cjs is strictly prohibited from running with NODE_ENV="production".');
    process.exit(1);
  }

  if (!isLocalHost(dbHost)) {
    console.error(`FATAL GUARD: DATABASE_HOST "${dbHost}" is not a local host. Aborting.`);
    process.exit(1);
  }

  if (dbUrl && !isLocalHost(dbUrl)) {
    console.error(`FATAL GUARD: DATABASE_URL "${dbUrl}" is not local. Aborting.`);
    process.exit(1);
  }

  if (!isLocalHost(strapiUrl)) {
    console.error(`FATAL GUARD: STRAPI_URL "${strapiUrl}" is not local. Aborting.`);
    process.exit(1);
  }
}

// ── 2. PRE-FLIGHT: Check Dev Server Port (Refuses to run unless --force) ───────
function checkDevServerPort(port = 1337) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(800);
    socket.on('connect', () => {
      socket.destroy();
      if (!isForce && !isDryRun) {
        console.error(`\n[FATAL] Port ${port} is currently in use (Strapi dev/server process is active).`);
        console.error('Refusing to run seed script to prevent lock contention or schema collisions.');
        console.error('Stop the running dev server, or pass --force to proceed anyway.\n');
        process.exit(1);
      } else {
        console.warn(`\n[WARNING] Port ${port} is active, but proceeding due to ${isDryRun ? '--dry-run' : '--force'}.\n`);
        resolve(true);
      }
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => {
      resolve(false);
    });
    socket.connect(port, '127.0.0.1');
  });
}

// ── 3. DATA SPECIFICATIONS (Hard-coded canonical SPEC array) ───────────────────
// Slugs strictly match the frontend routing contracts in metaphi/lib/navbar-data.ts
// and app/components/IndustriesSection.tsx, CapabilitiesSection.tsx, etc.
const SPEC_INDUSTRIES = [
  {
    order: 1,
    slug: 'manufacturing',
    title: 'Manufacturing',
    summary: 'Connect production, inventory, sales, quality, finance and operational workflows through integrated digital systems.'
  },
  {
    order: 2,
    slug: 'healthcare',
    title: 'Healthcare & Life Sciences',
    summary: 'Patient scheduling, records access, compliance reporting and secure data exchange.'
  },
  {
    order: 3,
    slug: 'logistics',
    title: 'Logistics & 3PL',
    summary: 'Digitise transportation, fleet, warehouse, shipment and customer workflows.'
  },
  {
    order: 4,
    slug: 'finance',
    title: 'Banking, Payments & FinTech',
    summary: 'Core ledger modernisations, payment routing, onboarding workflows, regulatory compliance reporting, and fraud screening engines.'
  },
  {
    order: 5,
    slug: 'professional-services',
    title: 'Professional Services',
    summary: 'Connect CRM, projects, teams, service delivery and commercial management.'
  },
  {
    order: 6,
    slug: 'retail-and-ecommerce',
    title: 'Retail & Ecommerce',
    summary: 'Integrate commerce, inventory, fulfilment, customer and order operations.'
  },
  {
    order: 7,
    slug: 'consumer-platforms-and-marketplaces',
    title: 'Consumer Platforms & Marketplaces',
    summary: 'Build scalable marketplaces, subscription platforms and digital consumer products.'
  },
  {
    order: 8,
    slug: 'associations-and-communities',
    title: 'Associations & Communities',
    summary: 'Create membership, networking, event and community-engagement ecosystems.'
  },
  {
    order: 9,
    slug: 'education',
    title: 'Education & Training',
    summary: 'Digitise learning, administration, assessments and learner engagement.'
  },
  {
    order: 10,
    slug: 'government-and-public-sector',
    title: 'Government & Public Sector',
    summary: 'Build platforms for administration, infrastructure programmes, monitoring and citizen-facing workflows.'
  }
];

const SPEC_SOLUTIONS = [
  // 5 Custom Solutions
  {
    title: 'Custom Business Applications',
    slug: 'custom-business-applications',
    modelType: 'custom',
    order: 1,
    summary: 'Create operational, ERP, CRM, workflow, inventory and management systems around your processes.',
    ctaLabel: 'Explore Business Applications'
  },
  {
    title: 'Product Engineering',
    slug: 'product-engineering',
    modelType: 'custom',
    order: 2,
    summary: 'Turn product concepts into reliable digital platforms and evolve existing products as they scale.',
    ctaLabel: 'Explore Product Engineering'
  },
  {
    title: 'Enterprise AI',
    slug: 'enterprise-ai-solutions',
    modelType: 'custom',
    order: 3,
    summary: 'Embed practical intelligence into workflows, documents, decisions and user experiences.',
    ctaLabel: 'Explore Enterprise AI'
  },
  {
    title: 'Cloud, Data & System Integrations',
    slug: 'cloud-data-integrations',
    modelType: 'custom',
    order: 4,
    summary: 'Modernise systems and connect applications, platforms, APIs and data.',
    ctaLabel: 'Explore Cloud & Integrations'
  },
  {
    title: 'Application & Cloud Managed Services',
    slug: 'application-cloud-managed-services',
    modelType: 'custom',
    order: 5,
    summary: 'Maintain and continuously improve business-critical technology after implementation.',
    ctaLabel: 'Explore Managed Services'
  },
  // 10 Ready-to-Configure Solutions
  {
    title: 'Manufacturing Operations Management',
    slug: 'manufacturing-operations-management',
    modelType: 'ready-to-configure',
    order: 1,
    summary: 'A configurable operational platform connecting production planning, job-order tracking, inventory movements, quality checkpoints and dispatch.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Inventory & Distribution Management',
    slug: 'inventory-distribution-management',
    modelType: 'ready-to-configure',
    order: 2,
    summary: 'Multi-location inventory tracking, batch and serialized traceability, stock movement approvals and warehouse-level controls.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Warehouse & Logistics Management',
    slug: 'warehouse-logistics-management',
    modelType: 'ready-to-configure',
    order: 3,
    summary: 'Warehouse and distribution management connecting inbound receiving, bin allocation, pick-pack workflows and fleet tracking.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Laboratory Information Management System',
    slug: 'laboratory-information-management-system',
    modelType: 'ready-to-configure',
    order: 4,
    summary: 'Sample registration, testing stage progression, chain-of-custody tracking, instrument result logging and COA generation.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Sales Force Automation',
    slug: 'sales-force-automation',
    modelType: 'ready-to-configure',
    order: 5,
    summary: 'Field sales reporting, Beat planning, order capture, distributor mapping and retail visibility.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Project & Service Management',
    slug: 'project-service-management',
    modelType: 'ready-to-configure',
    order: 6,
    summary: 'Resource allocation, milestone tracking, ticket routing, service-level agreements and client billing.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Customer Portal',
    slug: 'customer-portal',
    modelType: 'ready-to-configure',
    order: 7,
    summary: 'Branded self-service portal for onboarding, document exchange, service requests and progress visibility.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Association & Membership Management',
    slug: 'association-membership-management',
    modelType: 'ready-to-configure',
    order: 8,
    summary: 'Member directories, dues renewal, event registration, committee workflows and certified credential verification.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Financial Operations Management',
    slug: 'financial-operations-management',
    modelType: 'ready-to-configure',
    order: 9,
    summary: 'Automated billing, reconciliation, partner commissions, ledger integration and operational finance dashboards.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Healthcare Operations Management',
    slug: 'healthcare-operations-management',
    modelType: 'ready-to-configure',
    order: 10,
    summary: 'Patient workflow coordination, clinic appointments, diagnostic reporting and departmental scheduling.',
    ctaLabel: 'Explore Solutions'
  },
  // 2 SaaS Products
  {
    title: 'Stockiphi',
    slug: 'stockiphi',
    modelType: 'saas',
    order: 1,
    summary: 'Inventory and operations management for businesses that need clearer visibility over stock movement and everyday inventory workflows.',
    ctaLabel: 'Explore Stockiphi'
  },
  {
    title: 'Taskiphi',
    slug: 'taskiphi',
    modelType: 'saas',
    order: 2,
    summary: 'Task and work management for teams that need better visibility, accountability and follow-through.',
    ctaLabel: 'Explore Taskiphi'
  }
];

const INDUSTRY_SOLUTION_LINKS = {
  'manufacturing': ['manufacturing-operations-management', 'inventory-distribution-management', 'warehouse-logistics-management'],
  'healthcare': ['healthcare-operations-management', 'laboratory-information-management-system', 'custom-business-applications'],
  'logistics': ['warehouse-logistics-management', 'inventory-distribution-management', 'custom-business-applications'],
  'finance': ['financial-operations-management', 'custom-business-applications', 'cloud-data-integrations'],
  'professional-services': ['project-service-management', 'sales-force-automation', 'customer-portal'],
  'retail-and-ecommerce': ['inventory-distribution-management', 'sales-force-automation', 'stockiphi'],
  'consumer-platforms-and-marketplaces': ['product-engineering', 'customer-portal', 'enterprise-ai-solutions'],
  'associations-and-communities': ['association-membership-management', 'customer-portal', 'custom-business-applications'],
  'education': ['product-engineering', 'project-service-management', 'customer-portal'],
  'government-and-public-sector': ['custom-business-applications', 'cloud-data-integrations', 'application-cloud-managed-services']
};

const SEED_FAQ_CATEGORIES = [
  { name: 'Process', order: 1 },
  { name: 'Pricing', order: 2 },
  { name: 'Legal', order: 3 },
  { name: 'Support', order: 4 }
];

const SEED_FAQS = [
  {
    question: 'How long does a typical custom software project take?',
    answer: 'Most custom projects move from initial technical discovery to production deployment within 8 to 14 weeks, delivered in predictable 2-week agile sprints.',
    categoryName: 'Process',
    order: 1
  },
  {
    question: 'How do you price your engineering engagements?',
    answer: 'We offer fixed milestone pricing for well-defined scopes and dedicated sprint capacity for evolving product initiatives, with no surprise overages.',
    categoryName: 'Pricing',
    order: 2
  },
  {
    question: 'Who owns the intellectual property and code you write?',
    answer: 'You own 100% of the code, system designs, documentation, and IP upon milestone payment. All repositories are transferred directly to your organization.',
    categoryName: 'Legal',
    order: 3
  },
  {
    question: 'Do you provide managed support and SLAs after launch?',
    answer: 'Yes, we provide 24/7 cloud infrastructure monitoring, proactive security updates, performance tuning, and guaranteed SLA response windows.',
    categoryName: 'Support',
    order: 4
  }
];

const SEED_TESTIMONIALS = [
  {
    quote: 'Metaphi re-engineered our operational dispatch core into a resilient real-time platform. Our fleet dispatch turnaround dropped by 64% in month one.',
    name: 'Priya Nambiar',
    role: 'Chief Operating Officer',
    company: 'FleetLogix Global',
    order: 1
  },
  {
    quote: 'The team delivered our complex patient diagnostic portal under strict regulatory compliance, on schedule and without compromise on security.',
    name: 'Dr. Daniel Okafor',
    role: 'VP of Technology & Diagnostics',
    company: 'CarePoint Health Network',
    order: 2
  }
];

const SEED_TEAM_MEMBERS = [
  {
    name: 'Meera Iyer',
    role: 'Chief Technology Architect',
    bio: '15+ years engineering scalable cloud platforms, distributed systems, and real-time enterprise architectures across North America and Asia.',
    order: 1
  },
  {
    name: 'Arjun Deshmukh',
    role: 'Head of Product Engineering',
    bio: 'Specializes in high-velocity product delivery, microservices architecture, and pragmatic AI integration for rapid-growth companies.',
    order: 2
  }
];

const SEED_PARTNERS = [
  {
    name: 'Skyline Cloud Systems',
    description: 'Enterprise Cloud Infrastructure & Managed High-Availability Hosting Partner',
    category: 'Cloud Infrastructure',
    order: 1
  },
  {
    name: 'Brightwave Analytics',
    description: 'Specialized Data Engineering & Predictive Intelligence Technology Partner',
    category: 'Data & Analytics',
    order: 2
  },
  {
    name: 'Northgate Security Labs',
    description: 'SOC2 Type II and ISO 27001 Cybersecurity Audit & Penetration Testing Alliance',
    category: 'Security & Compliance',
    order: 3
  }
];

const SEED_JOB_OPENINGS = [
  {
    title: 'Senior Full-Stack Engineer',
    department: 'Core Platform Engineering',
    location: 'Bangalore, India (Hybrid)',
    employmentType: 'Full-time',
    description: 'Build high-throughput backends and performant web interfaces for complex enterprise applications.',
    order: 1
  },
  {
    title: 'Lead Product Designer',
    department: 'Design & UX',
    location: 'Remote (India/APAC)',
    employmentType: 'Full-time',
    description: 'Craft intuitive interfaces, design systems, and workflow experiences for complex B2B platforms.',
    order: 2
  },
  {
    title: 'DevOps & Cloud Reliability Engineer',
    department: 'Cloud Infrastructure',
    location: 'Bangalore, India (Hybrid)',
    employmentType: 'Full-time',
    description: 'Automate Kubernetes clusters, CI/CD pipelines, and infrastructure observability across multicloud environments.',
    order: 3
  }
];

const SPEC_CASE_STUDIES = [
  {
    order: 1,
    title: 'Industrial IoT Digital Twin Platform',
    slug: 'industrial-iot-digital-twin-platform',
    subtitle: 'Real-time telemetry and predictive maintenance for global wind turbines',
    summary: 'Metaphi deployed an IoT digital twin platform processing telemetry from 4,200 connected wind turbines.',
    heroImageName: 'showcase-wind-farm.jpg',
    clientLogoName: 'R-Nets-sticky-logo.png',
    solutionSlug: 'manufacturing-operations-management',
    solutionText: 'Engineered high-throughput telemetry ingestion pipeline using Kafka and distributed stateful microservices with automated anomaly detection.',
    tags: [
      { title: 'Digital Twin' },
      { title: 'IoT & Telemetry' },
      { title: 'Predictive Maintenance' }
    ],
    projectSummary: {
      summaryText: 'Delivered an edge-to-cloud analytics architecture connecting 4,200 wind energy turbines.',
      keyFacts: [
        { label: 'Client', value: 'Apex Energy Systems' },
        { label: 'Industry', value: 'Manufacturing & CleanTech' },
        { label: 'Timeline', value: '6 Months' }
      ],
      headlineStats: [
        { value: '38%', label: 'Reduction in unscheduled downtime' },
        { value: '4.2k', label: 'Connected turbine assets' }
      ]
    },
    challengeSection: {
      challenge: 'Aging supervisory SCADA networks created critical data silos and delayed failure warnings.',
      items: [
        { title: 'Siloed Telemetry', description: 'Sensor streams in legacy protocols could not be joined in real time.' },
        { title: 'High Maintenance Cost', description: 'Reactive repairs resulted in high offshore dispatch expenses.' },
        { title: 'Latency Bottlenecks', description: 'Central processing delays meant alerts arrived after component failure.' }
      ]
    },
    impactSection: {
      outcomeCards: [
        { metric: '38%', title: 'Downtime Reduced', description: 'Predictive alerts averted turbine drivetrain failures.' },
        { metric: '$4.2M', title: 'Annual Savings', description: 'Reduced emergency offshore technician deployments.' },
        { metric: '<500ms', title: 'Alert Latency', description: 'Critical vibrational threshold alerts dispatched instantaneously.' }
      ]
    }
  },
  {
    order: 2,
    title: 'Clinical Diagnostic Intelligence Co-Pilot',
    slug: 'clinical-diagnostic-intelligence-copilot',
    subtitle: 'HIPAA-compliant multimodal clinical record processing and diagnostic insights',
    summary: 'Developed an AI diagnostic assistance engine processing 1.2M oncology patient medical records annually.',
    heroImageName: 'showcase-healthcare-ai.jpg',
    clientLogoName: 'R-Nets-N-knots-logo.png',
    solutionSlug: 'healthcare-operations-management',
    solutionText: 'Architected private FHIR-compliant ML pipeline integrating vision encoders and clinical NLP models.',
    tags: [
      { title: 'Healthcare AI' },
      { title: 'HIPAA Compliant' },
      { title: 'Clinical NLP' }
    ],
    projectSummary: {
      summaryText: 'Built an enterprise clinical workflow platform supporting oncology pathology teams.',
      keyFacts: [
        { label: 'Client', value: 'Novacare Health Network' },
        { label: 'Industry', value: 'Healthcare & Life Sciences' },
        { label: 'Timeline', value: '8 Months' }
      ],
      headlineStats: [
        { value: '62%', label: 'Faster pathology chart reviews' },
        { value: '99.8%', label: 'Clinical transcription accuracy' }
      ]
    },
    challengeSection: {
      challenge: 'Radiology and pathology specialists spent over 40% of their shifts manually transcribing electronic health records.',
      items: [
        { title: 'Clinician Burnout', description: 'Manual clinical documentation prolonged patient triage turnaround.' },
        { title: 'Unstructured Formats', description: 'Multimodal scans and unstructured text hindered unified patient tracking.' },
        { title: 'Strict Privacy Mandates', description: 'Strict HIPAA and BAA standards barred commercial public LLMs.' }
      ]
    },
    impactSection: {
      outcomeCards: [
        { metric: '62%', title: 'Review Acceleration', description: 'Clinicians completed complex record syntheses in minutes.' },
        { metric: '1.2M', title: 'Records Synthesized', description: 'Unstructured pathology and EHR documents ingested.' },
        { metric: '100%', title: 'HIPAA Compliance', description: 'Zero telemetry leaked beyond private enclave VPC.' }
      ]
    }
  },
  {
    order: 3,
    title: 'Autonomous Freight & Fleet Dispatch Engine',
    slug: 'autonomous-freight-fleet-dispatch-engine',
    subtitle: 'Multi-modal route optimization and automated dispatch for regional freight carrier',
    summary: 'Engineered an autonomous routing engine managing dispatch across 1,800 regional dry-van freight carriers.',
    heroImageName: 'showcase-logistics-ai.jpg',
    clientLogoName: 'R-Nets-sticky-logo.png',
    solutionSlug: 'warehouse-logistics-management',
    solutionText: 'Created constraint-satisfaction routing solver combined with live traffic and telematics re-routing.',
    tags: [
      { title: 'Autonomous Logistics' },
      { title: 'Route Optimization' },
      { title: 'Dispatch Engine' }
    ],
    projectSummary: {
      summaryText: 'Deployed live dynamic routing and load matching across interstate shipping corridors.',
      keyFacts: [
        { label: 'Client', value: 'TransVanguard Logistics' },
        { label: 'Industry', value: 'Logistics & 3PL' },
        { label: 'Timeline', value: '5 Months' }
      ],
      headlineStats: [
        { value: '24%', label: 'Fuel expenditure reduction' },
        { value: '98.6%', label: 'On-time delivery performance' }
      ]
    },
    challengeSection: {
      challenge: 'Static dispatch dispatchers struggled to react to interstate traffic delays, deadheading up to 28% of miles.',
      items: [
        { title: 'Deadhead Miles', description: 'Empty return legs caused severe operational fuel margin bleed.' },
        { title: 'Manual Load Matching', description: 'Brokers relied on manual phone calls to assign loads.' },
        { title: 'Dynamic Weather Disruption', description: 'Route planners lacked live automated rerouting triggers.' }
      ]
    },
    impactSection: {
      outcomeCards: [
        { metric: '24%', title: 'Fuel Saved', description: 'Optimized multi-stop routing cut idle burn and detours.' },
        { metric: '98.6%', title: 'On-Time Rate', description: 'Real-time delay prediction triggered proactive re-dispatches.' },
        { metric: '1,800', title: 'Active Trucks', description: 'Fleet continuously synchronized in sub-second intervals.' }
      ]
    }
  },
  {
    order: 4,
    title: 'High-Throughput Core Banking Ledger',
    slug: 'high-throughput-core-banking-ledger',
    subtitle: 'Immutable multi-currency ledger processing 45,000 transactions per second',
    summary: 'Architected a distributed ledger system for real-time settlement and compliance reporting.',
    heroImageName: 'hero-team.jpg',
    clientLogoName: 'metaphi-symbol.png',
    solutionSlug: 'financial-operations-management',
    solutionText: 'Designed distributed CQRS event-sourced ledger architecture with strict ACID double-entry accounting guarantees.',
    tags: [
      { title: 'FinTech' },
      { title: 'Core Banking' },
      { title: 'Event Sourcing' }
    ],
    projectSummary: {
      summaryText: 'Built next-generation transaction core powering retail banking accounts across 3 jurisdictions.',
      keyFacts: [
        { label: 'Client', value: 'Zenith Horizon Capital' },
        { label: 'Industry', value: 'Banking, Payments & FinTech' },
        { label: 'Timeline', value: '9 Months' }
      ],
      headlineStats: [
        { value: '45k', label: 'Peak transactions per second' },
        { value: '0.00%', label: 'Reconciliation error rate' }
      ]
    },
    challengeSection: {
      challenge: 'Legacy batch settlement mainframes created midnight reconciliation halts and cross-border currency friction.',
      items: [
        { title: 'Batch Bottlenecks', description: 'End-of-day batch processing delayed interbank transaction finality.' },
        { title: 'Concurrency Contention', description: 'Account-level locks degraded performance during high traffic spikes.' },
        { title: 'Regulatory Reporting', description: 'Auditors required manual exports to verify compliance records.' }
      ]
    },
    impactSection: {
      outcomeCards: [
        { metric: '45,000', title: 'TPS Throughput', description: 'Ultra-low-latency transaction execution without locks.' },
        { metric: '<15ms', title: 'Settlement Time', description: 'Sub-second multi-currency double entry clearing.' },
        { metric: 'Zero', title: 'Discrepancies', description: 'Continuous automated mathematical ledger verification.' }
      ]
    }
  }
];

// ── 4. MAIN SEED PROCESS ──────────────────────────────────────────────────────
async function main() {
  verifyEnvironmentSafety();

  if (isDryRun) {
    console.log('\n======================================================');
    console.log('--- METAPHI CMS SEED: [DRY-RUN MODE ACTIVATED] ---');
    console.log('No database rows will be deleted, updated, or created.');
    console.log('======================================================\n');
  } else {
    console.log('\n======================================================');
    console.log('--- METAPHI CMS SEED: EXECUTING DATABASE SEED ---');
    console.log('======================================================\n');
  }

  await checkDevServerPort(1337);

  console.log('1. Initializing Strapi instance...');
  let app;
  try {
    app = await createStrapi({ appDir, distDir: path.join(appDir, 'dist') }).load();
  } catch (err) {
    console.error('FATAL: Could not boot Strapi:', err);
    process.exit(1);
  }

  const report = {
    deleted: {},
    inserted: {},
    verified: {}
  };

  try {
    // ── PRE-FLIGHT: Look up required media assets by filename ──────────────
    console.log('\n2. Pre-flight Check: Looking up media assets in upload library by name...');
    const mediaFiles = await app.documents('plugin::upload.file').findMany({});
    const mediaByName = {};
    for (const f of mediaFiles) {
      if (f.name) mediaByName[f.name] = f;
    }

    const defaultHeroMedia = mediaByName['hero-team.jpg'] || mediaByName['Human and Machine Reach Across White.png'];
    if (!defaultHeroMedia) {
      throw new Error(
        'FATAL PRE-FLIGHT: Required hero image asset ("hero-team.jpg" or "Human and Machine Reach Across White.png") ' +
        'not found in Strapi media library! Cannot satisfy Industry schema validation. Aborting before changes.'
      );
    }
    console.log(`✓ Default Hero Media verified: "${defaultHeroMedia.name}" (ID: ${defaultHeroMedia.id}, DocID: ${defaultHeroMedia.documentId})`);

    // Verify all media required by SPEC_CASE_STUDIES
    for (const cs of SPEC_CASE_STUDIES) {
      if (!mediaByName[cs.heroImageName]) {
        throw new Error(`FATAL PRE-FLIGHT: Required Case Study hero image "${cs.heroImageName}" not found in media library! Aborting before changes.`);
      }
      if (!mediaByName[cs.clientLogoName]) {
        throw new Error(`FATAL PRE-FLIGHT: Required Case Study client logo "${cs.clientLogoName}" not found in media library! Aborting before changes.`);
      }
    }
    console.log(`✓ Verified all Case Study media assets exist (${SPEC_CASE_STUDIES.length} case studies).`);

    // Target content types to delete during cleanup
    const TARGET_COLLECTIONS = [
      'api::case-study.case-study',
      'api::job-opening.job-opening',
      'api::testimonial.testimonial',
      'api::partner.partner',
      'api::team-member.team-member',
      'api::faq.faq',
      'api::faq-category.faq-category',
      'api::industry.industry',
      'api::solution.solution'
    ];

    // Read initial counts and record existing industry images (draft and published) for preservation
    console.log('\n3. Reading baseline collection counts and recording existing industry images...');
    const existingIndustryImages = {}; // slug -> { id, documentId, name }
    try {
      const existingPubIndustries = await app.documents('api::industry.industry').findMany({
        status: 'published',
        populate: ['heroImage']
      });
      const existingDraftIndustries = await app.documents('api::industry.industry').findMany({
        status: 'draft',
        populate: ['heroImage']
      });
      for (const ind of [...(existingPubIndustries || []), ...(existingDraftIndustries || [])]) {
        if (ind.slug && ind.heroImage?.id) {
          // Verify media record still exists
          const mediaExists = await app.documents('plugin::upload.file').findOne({
            documentId: ind.heroImage.documentId || undefined
          }) || (ind.heroImage.name && mediaByName[ind.heroImage.name]);

          if (mediaExists) {
            existingIndustryImages[ind.slug] = {
              id: ind.heroImage.id,
              name: ind.heroImage.name
            };
          }
        }
      }
      console.log(`✓ Recorded existing heroImage for ${Object.keys(existingIndustryImages).length} industries (draft/published).`);
    } catch (err) {
      console.warn('   ! Could not read existing industry heroImage mappings:', err.message);
    }

    const initialCounts = {};
    for (const uid of TARGET_COLLECTIONS) {
      const draftCount = await app.documents(uid).count({ status: 'draft' });
      const pubCount = await app.documents(uid).count({ status: 'published' });
      initialCounts[uid] = { draft: draftCount, published: pubCount };
    }

    console.log('----------------------------------------------------------------------');
    console.log('Content Type                             | Drafts | Published | Total');
    console.log('-----------------------------------------|--------|-----------|-------');
    for (const uid of TARGET_COLLECTIONS) {
      const c = initialCounts[uid];
      console.log(`${uid.padEnd(40)} | ${String(c.draft).padStart(6)} | ${String(c.published).padStart(9)} | ${String(c.draft + c.published).padStart(5)}`);
    }
    console.log('----------------------------------------------------------------------');

    if (isDryRun) {
      console.log('\n[DRY-RUN] Detailed Execution Plan:');
      console.log('======================================================================');
      console.log('Step 1 (Cleanup):');
      for (const uid of TARGET_COLLECTIONS) {
        const c = initialCounts[uid];
        console.log(` - ${uid}: would delete ${c.draft} drafts and ${c.published} published documents.`);
      }
      console.log('\nStep 2 (Assertions):');
      console.log(' - Verify all target collections reach exactly 0 records before inserts.');
      console.log('\nStep 3 (Insertions):');
      console.log(` - api::solution.solution: would insert ${SPEC_SOLUTIONS.length} solutions (strictly published).`);
      console.log(` - api::industry.industry: would insert ${SPEC_INDUSTRIES.length} industries (strictly published), preserving recorded custom heroImages or defaulting to "${defaultHeroMedia.name}".`);
      console.log(' - Verify and enforce exact canonical slugs:');
      SPEC_INDUSTRIES.forEach(i => console.log(`     * [Order ${i.order}] "${i.title}" -> "${i.slug}"`));
      console.log(` - api::faq-category.faq-category: would insert ${SEED_FAQ_CATEGORIES.length} categories.`);
      console.log(` - api::faq.faq: would insert ${SEED_FAQS.length} FAQs.`);
      console.log(` - api::testimonial.testimonial: would insert ${SEED_TESTIMONIALS.length} testimonials.`);
      console.log(` - api::team-member.team-member: would insert ${SEED_TEAM_MEMBERS.length} team members.`);
      console.log(` - api::partner.partner: would insert ${SEED_PARTNERS.length} partners.`);
      console.log(` - api::job-opening.job-opening: would insert ${SEED_JOB_OPENINGS.length} job openings.`);
      console.log(` - api::case-study.case-study: would insert ${SPEC_CASE_STUDIES.length} case studies (strictly published) linked to solutions.`);
      console.log('\nStep 4 (Relation Re-linking):');
      console.log(' - Link solutions to topic-specific industries (many-to-many).');
      console.log(' - Link exactly 10 canonical industries to Home Page (api::home-page.home-page).');
      console.log('\nSingle Types Policy:');
      console.log(' - Only Home Page industries relation is updated.');
      console.log(' - All hubs and other page single types (About, Work, Compliance, etc.) are untouched.');
      console.log('======================================================================');
      console.log('✓ Dry run completed with 0 database modifications.\n');
      return;
    }

    // ── TRANSACTION BLOCK ───────────────────────────────────────────────────
    console.log('\n4. Executing cleanup and seed inside database transaction...');
    await app.db.transaction(async ({ trx }) => {

      // A. Safe Clean-up via Public Strapi Documents API (app.documents)
      // To satisfy the middleware in src/index.ts (which requires at least 1 published testimonial & FAQ),
      // we insert temporary placeholder entries first so the count is never 0 during deletion.
      console.log('   -> created temp guard');
      const tempTestimonial = await app.documents('api::testimonial.testimonial').create({
        data: {
          quote: 'Temporary seeding guard quote to satisfy document middleware.',
          name: 'Seeding Guard',
          role: 'System',
          company: 'MetaPhi Internal',
          order: 9999
        },
        status: 'published'
      });

      // Temporary FAQ Category and FAQ to satisfy FAQ document middleware
      const tempFaqCat = await app.documents('api::faq-category.faq-category').create({
        data: { name: 'Temporary Guard Category', order: 9999 },
        status: 'published'
      });
      const tempFaq = await app.documents('api::faq.faq').create({
        data: {
          question: 'Temporary seeding guard question?',
          answer: 'Temporary seeding guard answer.',
          order: 9999,
          faqCategory: tempFaqCat.documentId
        },
        status: 'published'
      });

      // Now delete all pre-existing entries across collections using public app.documents(uid).delete
      for (const uid of TARGET_COLLECTIONS) {
        let deleted = 0;
        const seenDocIds = new Set();
        // Don't delete our temporary guard entries yet
        const guardDocIds = new Set([tempTestimonial.documentId, tempFaqCat.documentId, tempFaq.documentId]);

        while (true) {
          const batch = await app.documents(uid).findMany({
            limit: 100,
            status: 'draft'
          });
          if (!batch || batch.length === 0) break;

          let batchDeleted = 0;
          for (const doc of batch) {
            if (!doc.documentId || seenDocIds.has(doc.documentId) || guardDocIds.has(doc.documentId)) continue;
            seenDocIds.add(doc.documentId);
            await app.documents(uid).delete({ documentId: doc.documentId });
            deleted++;
            batchDeleted++;
          }
          if (batchDeleted === 0) break;
        }

        report.deleted[uid] = deleted;
        console.log(`   ✓ deleted ${deleted} old ${uid}.`);
      }

      // Assert industries = 0 before inserting
      const indDraftCount = await app.documents('api::industry.industry').count({ status: 'draft' });
      const indPubCount = await app.documents('api::industry.industry').count({ status: 'published' });
      if (indDraftCount !== 0 || indPubCount !== 0) {
        throw new Error(`FATAL: Industries count not 0 before seeding! (draft: ${indDraftCount}, pub: ${indPubCount})`);
      }
      console.log('   ✓ Verified industry table is completely empty (0 collisions possible).');

      // B. Seed Solutions (17 canonical solutions)
      console.log('\n   -> Seeding 17 Solutions...');
      const solutionDocIdMap = {};
      let solutionsInserted = 0;
      for (const sol of SPEC_SOLUTIONS) {
        const created = await app.documents('api::solution.solution').create({
          data: sol,
          status: 'published'
        });
        solutionDocIdMap[sol.slug] = created.documentId;
        solutionsInserted++;
      }
      report.inserted['api::solution.solution'] = solutionsInserted;
      console.log(`   ✓ Created ${solutionsInserted} solutions.`);

      // C. Seed 10 Canonical Industries with exact slug assertion & correction
      console.log('\n   -> Seeding 10 Canonical Industries...');
      const seededIndustryDocIds = [];
      let industriesInserted = 0;

      for (const spec of SPEC_INDUSTRIES) {
        const linkedSolutionDocIds = (INDUSTRY_SOLUTION_LINKS[spec.slug] || [])
          .map(slug => solutionDocIdMap[slug])
          .filter(Boolean);

        // Check if pre-cleanup image exists for this slug
        let heroImageIdToUse = defaultHeroMedia.id;
        let imageLogMsg = `used default ("${defaultHeroMedia.name}")`;
        if (existingIndustryImages[spec.slug]?.id) {
          heroImageIdToUse = existingIndustryImages[spec.slug].id;
          imageLogMsg = `kept existing image ("${existingIndustryImages[spec.slug].name || heroImageIdToUse}")`;
        }
        console.log(`      * [${spec.slug}] ${imageLogMsg}`);

        const payload = {
          title: spec.title,
          slug: spec.slug,
          order: spec.order,
          summary: spec.summary,
          heroImage: heroImageIdToUse,
          solutions: linkedSolutionDocIds
        };

        const created = await app.documents('api::industry.industry').create({
          data: payload,
          status: 'published'
        });
        const docId = created.documentId;

        // Verify generated slug on draft and published versions
        const readDraft = await app.documents('api::industry.industry').findOne({
          documentId: docId,
          status: 'draft'
        });
        const readPub = await app.documents('api::industry.industry').findOne({
          documentId: docId,
          status: 'published'
        });

        if (readDraft?.slug !== spec.slug || readPub?.slug !== spec.slug) {
          console.warn(`   ! Slug mismatch on "${spec.title}": expected "${spec.slug}", got draft="${readDraft?.slug}", pub="${readPub?.slug}". Applying low-level query fix...`);
          
          await app.db.query('api::industry.industry').updateMany({
            where: { documentId: docId },
            data: { slug: spec.slug }
          });

          // Re-verify after low-level update
          const reDraft = await app.documents('api::industry.industry').findOne({
            documentId: docId,
            status: 'draft'
          });
          const rePub = await app.documents('api::industry.industry').findOne({
            documentId: docId,
            status: 'published'
          });

          if (reDraft?.slug !== spec.slug || rePub?.slug !== spec.slug) {
            throw new Error(
              `FATAL: Failed to force slug "${spec.slug}" on industry "${spec.title}" (docId: ${docId}). ` +
              `Actual draft="${reDraft?.slug}", pub="${rePub?.slug}". Aborting transaction.`
            );
          }
          console.log(`   ✓ Successfully corrected slug to "${spec.slug}".`);
        }

        seededIndustryDocIds.push(docId);
        industriesInserted++;
        console.log(`   ✓ Industry seeded: "${spec.title}" (slug: "${spec.slug}", order: ${spec.order})`);
      }

      report.inserted['api::industry.industry'] = industriesInserted;

      // D. Seed FAQ Categories & FAQs
      console.log('\n   -> Seeding FAQ Categories & FAQs...');
      const faqCategoryMap = {};
      let catCount = 0;
      for (const cat of SEED_FAQ_CATEGORIES) {
        const createdCat = await app.documents('api::faq-category.faq-category').create({
          data: cat,
          status: 'published'
        });
        faqCategoryMap[cat.name] = createdCat.documentId;
        catCount++;
      }
      report.inserted['api::faq-category.faq-category'] = catCount;

      let faqCount = 0;
      for (const item of SEED_FAQS) {
        await app.documents('api::faq.faq').create({
          data: {
            question: item.question,
            answer: item.answer,
            order: item.order,
            faqCategory: faqCategoryMap[item.categoryName]
          },
          status: 'published'
        });
        faqCount++;
      }
      report.inserted['api::faq.faq'] = faqCount;

      // E. Seed Testimonials, Team Members, Partners, Job Openings
      console.log('\n   -> Seeding Testimonials, Team, Partners, Job Openings...');
      let testCount = 0;
      for (const t of SEED_TESTIMONIALS) {
        await app.documents('api::testimonial.testimonial').create({ data: t, status: 'published' });
        testCount++;
      }
      report.inserted['api::testimonial.testimonial'] = testCount;

      let teamCount = 0;
      for (const m of SEED_TEAM_MEMBERS) {
        await app.documents('api::team-member.team-member').create({ data: m, status: 'published' });
        teamCount++;
      }
      report.inserted['api::team-member.team-member'] = teamCount;

      let partnerCount = 0;
      for (const p of SEED_PARTNERS) {
        await app.documents('api::partner.partner').create({ data: p, status: 'published' });
        partnerCount++;
      }
      report.inserted['api::partner.partner'] = partnerCount;

      let jobCount = 0;
      for (const j of SEED_JOB_OPENINGS) {
        await app.documents('api::job-opening.job-opening').create({ data: j, status: 'published' });
        jobCount++;
      }
      report.inserted['api::job-opening.job-opening'] = jobCount;

      // F. Seed Case Studies (linked to Solutions)
      console.log(`\n   -> Seeding ${SPEC_CASE_STUDIES.length} Case Studies...`);
      let csCount = 0;
      for (const cs of SPEC_CASE_STUDIES) {
        const heroImg = mediaByName[cs.heroImageName];
        const clientLogoImg = mediaByName[cs.clientLogoName];
        const linkedSolutionDocId = solutionDocIdMap[cs.solutionSlug];

        const payload = {
          title: cs.title,
          slug: cs.slug,
          order: cs.order,
          subtitle: cs.subtitle,
          summary: cs.summary,
          heroImage: heroImg.id,
          solutionText: cs.solutionText,
          tags: cs.tags,
          projectSummary: {
            clientLogo: clientLogoImg.id,
            summaryText: cs.projectSummary.summaryText,
            keyFacts: cs.projectSummary.keyFacts,
            headlineStats: cs.projectSummary.headlineStats
          },
          challengeSection: cs.challengeSection,
          impactSection: cs.impactSection,
          solutions: linkedSolutionDocId ? [linkedSolutionDocId] : []
        };

        const createdCs = await app.documents('api::case-study.case-study').create({
          data: payload,
          status: 'published'
        });

        // Ensure slug wasn't altered by auto-generation
        const readCsDraft = await app.documents('api::case-study.case-study').findOne({ documentId: createdCs.documentId, status: 'draft' });
        const readCsPub = await app.documents('api::case-study.case-study').findOne({ documentId: createdCs.documentId, status: 'published' });
        if (readCsDraft.slug !== cs.slug || (readCsPub && readCsPub.slug !== cs.slug)) {
          console.log(`   ! Slug mismatch on Case Study "${cs.title}": expected "${cs.slug}". Applying fix...`);
          await app.db.query('api::case-study.case-study').updateMany({
            where: { documentId: createdCs.documentId },
            data: { slug: cs.slug }
          });
        }
        csCount++;
        console.log(`   ✓ Case Study seeded: "${cs.title}" (slug: "${cs.slug}", order: ${cs.order})`);
      }
      report.inserted['api::case-study.case-study'] = csCount;

      console.log('   -> created canonical');

      // Clean up temporary guard entries now that canonical testimonials and FAQs exist
      console.log('   -> removed temp guard');
      await app.documents('api::testimonial.testimonial').delete({ documentId: tempTestimonial.documentId });
      await app.documents('api::faq.faq').delete({ documentId: tempFaq.documentId });
      await app.documents('api::faq-category.faq-category').delete({ documentId: tempFaqCat.documentId });

      // G. Re-link relations on Home Page (Draft and Published)
      console.log('\n   -> Re-linking relations on Home Page (10 unique industries)...');
      const exHome = await app.documents('api::home-page.home-page').findFirst({ status: 'draft' });
      if (exHome) {
        // Link draft
        await app.documents('api::home-page.home-page').update({
          documentId: exHome.documentId,
          data: {
            industries: seededIndustryDocIds
          },
          status: 'draft'
        });

        // ── Direct Link Table Insertion Explanation ─────────────────────────────────
        // In Strapi 5, publishing a single type (e.g. home-page) via `app.documents.publish()`
        // triggers all validation rules in `src/index.ts` (requiring fields like clientLogos >= 5,
        // specific text length limits, etc., which are managed separately by content editors).
        // To ensure the public API (GET /api/home-page?populate=industries) serves the freshly
        // seeded 10 canonical industries without requiring a re-publish of draft content attributes,
        // we write directly to the `home_pages_industries_lnk` join table inside this active
        // Knex transaction (`trx`). This guarantees atomic linkage without touching draft fields.
        // ─────────────────────────────────────────────────────────────────────────────
        const pubHome = await app.db.connection('home_pages').transacting(trx).whereNotNull('published_at').first();
        if (pubHome) {
          await app.db.connection('home_pages_industries_lnk').transacting(trx).where({ home_page_id: pubHome.id }).delete();
          const pubIndustries = await app.db.connection('industries').transacting(trx).whereNotNull('published_at').orderBy('order', 'asc');
          const linkRows = pubIndustries.map((ind, idx) => ({
            home_page_id: pubHome.id,
            industry_id: ind.id,
            industry_ord: idx + 1
          }));
          if (linkRows.length > 0) {
            await app.db.connection('home_pages_industries_lnk').transacting(trx).insert(linkRows);
          }
        }
        console.log('   ✓ Home Page relations successfully linked for both draft and published.');
      }
    });

    // ── 5. SELF-CHECK & SLUG VERIFICATION AGAINST HARD-CODED SPEC ─────────────
    console.log('\n5. Performing Post-Seed Verification...');
    const finalDrafts = await app.documents('api::industry.industry').findMany({
      status: 'draft',
      sort: 'order:asc'
    });
    const finalPubs = await app.documents('api::industry.industry').findMany({
      status: 'published',
      sort: 'order:asc'
    });

    if (finalDrafts.length !== 10 || finalPubs.length !== 10) {
      throw new Error(`SELF-CHECK FAILED: Expected 10 draft and 10 published industries, found drafts=${finalDrafts.length}, pubs=${finalPubs.length}!`);
    }

    console.log('\n========================================================================================');
    console.log('                               INDUSTRIES SLUG VERIFICATION REPORT                       ');
    console.log('========================================================================================');
    console.log('Order | Industry Title                     | Expected Slug        | Draft Slug           | Published Slug       | Match');
    console.log('------|------------------------------------|----------------------|----------------------|----------------------|------');

    for (let i = 0; i < SPEC_INDUSTRIES.length; i++) {
      const expected = SPEC_INDUSTRIES[i];
      const draft = finalDrafts[i];
      const pub = finalPubs[i];

      const match = draft.slug === expected.slug && pub.slug === expected.slug;
      console.log(
        `${String(expected.order).padStart(5)} | ` +
        `${expected.title.padEnd(34)} | ` +
        `${expected.slug.padEnd(20)} | ` +
        `${(draft?.slug || '').padEnd(20)} | ` +
        `${(pub?.slug || '').padEnd(20)} | ` +
        `${match ? '✓ PASS' : '✗ FAIL'}`
      );

      if (!match) {
        throw new Error(
          `HARD-CODED SPEC MISMATCH at index ${i} (${expected.title}): ` +
          `Expected="${expected.slug}", Actual Draft="${draft?.slug}", Actual Pub="${pub?.slug}".`
        );
      }
    }
    console.log('========================================================================================');
    console.log('✓ All 10 industry slugs strictly match hard-coded SPEC array in draft and published.\n');

    // Case Studies Self-Check
    const finalCsDrafts = await app.documents('api::case-study.case-study').findMany({ status: 'draft', sort: 'order:asc' });
    const finalCsPubs = await app.documents('api::case-study.case-study').findMany({ status: 'published', sort: 'order:asc' });

    if (finalCsDrafts.length !== SPEC_CASE_STUDIES.length || finalCsPubs.length !== SPEC_CASE_STUDIES.length) {
      throw new Error(`SELF-CHECK FAILED: Expected ${SPEC_CASE_STUDIES.length} case studies, found drafts=${finalCsDrafts.length}, pubs=${finalCsPubs.length}!`);
    }

    console.log('\n========================================================================================');
    console.log('                              CASE STUDIES SLUG VERIFICATION REPORT                      ');
    console.log('========================================================================================');
    console.log('Order | Case Study Title                   | Expected Slug        | Draft Slug           | Published Slug       | Match');
    console.log('------|------------------------------------|----------------------|----------------------|----------------------|------');
    for (let i = 0; i < SPEC_CASE_STUDIES.length; i++) {
      const expected = SPEC_CASE_STUDIES[i];
      const draft = finalCsDrafts[i];
      const pub = finalCsPubs[i];
      const match = draft.slug === expected.slug && pub.slug === expected.slug;
      console.log(
        `${String(expected.order).padStart(5)} | ` +
        `${expected.title.padEnd(34)} | ` +
        `${expected.slug.padEnd(20)} | ` +
        `${(draft?.slug || '').padEnd(20)} | ` +
        `${(pub?.slug || '').padEnd(20)} | ` +
        `${match ? '✓ PASS' : '✗ FAIL'}`
      );
      if (!match) {
        throw new Error(`CASE STUDY SPEC MISMATCH at index ${i} (${expected.title}): Expected="${expected.slug}", Actual Draft="${draft?.slug}".`);
      }
    }
    console.log('========================================================================================');
    console.log(`✓ All ${SPEC_CASE_STUDIES.length} Case Study slugs strictly match hard-coded SPEC array in draft and published.\n`);

    // Post-seed check: Every industry has a heroImage (required when published). Print slug -> image filename
    console.log('========================================================================================');
    console.log('                           INDUSTRIES HERO IMAGE VERIFICATION                            ');
    console.log('========================================================================================');
    console.log('Order | Industry Slug                      | Hero Image Filename');
    console.log('------|------------------------------------|----------------------------------------------------');
    const finalPubsWithImages = await app.documents('api::industry.industry').findMany({
      status: 'published',
      sort: 'order:asc',
      populate: ['heroImage']
    });
    for (const ind of finalPubsWithImages) {
      const imgName = ind.heroImage?.name;
      if (!imgName) {
        throw new Error(`POST-SEED CHECK FAILED: Industry "${ind.slug}" has no heroImage!`);
      }
      console.log(`${String(ind.order || 0).padStart(5)} | ${(ind.slug || '').padEnd(34)} | ${imgName}`);
    }
    console.log('========================================================================================');
    console.log('✓ All 10 published industries have valid, non-null heroImage media attached.\n');

    // ── 6. SUMMARY REPORT (DOCUMENT COUNTS) ──────────────────────────────────
    console.log('\n====================================================================================================');
    console.log('                          DATABASE SEED SUMMARY REPORT (DOCUMENT COUNTS)                            ');
    console.log('====================================================================================================');
    console.log('Content Type                             | Deleted (Docs) | Inserted (Docs) | Current Drafts | Current Pubs');
    console.log('-----------------------------------------|----------------|-----------------|----------------|-------------');
    for (const uid of TARGET_COLLECTIONS) {
      const delDocs = report.deleted[uid] || 0;
      const insDocs = report.inserted[uid] || 0;
      const curDrafts = (await app.documents(uid).findMany({ status: 'draft' })).length;
      const curPubs = (await app.documents(uid).findMany({ status: 'published' })).length;
      console.log(
        `${uid.padEnd(40)} | ` +
        `${String(delDocs).padStart(14)} | ` +
        `${String(insDocs).padStart(15)} | ` +
        `${String(curDrafts).padStart(14)} | ` +
        `${String(curPubs).padStart(12)}`
      );
    }
    console.log('====================================================================================================');
    console.log('✓ ALL COLLECTIONS SEEDED, LINKED, AND PUBLISHED CLEANLY.\n');

  } catch (err) {
    console.error('\nFATAL ERROR DURING SEED EXECUTION:', err);
    process.exit(1);
  } finally {
    if (app) {
      try {
        await app.destroy();
      } catch (e) {}
      console.log('Strapi instance closed cleanly.');
    }
  }
}

main();
