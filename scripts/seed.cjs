/**
 * scripts/seed.cjs
 *
 * Single idempotent seed script for Metaphi CMS (Localhost only).
 * Seeds all hubs, solutions, industries, case studies, team members,
 * testimonials, FAQs, and company pages strictly as PUBLISHED.
 */

const { createStrapi } = require('@strapi/strapi');
const path = require('path');
const appDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(appDir, '.env') });

// ── Guard Check: Localhost & Non-Production only ─────────────────────────
const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
const nodeEnv = process.env.NODE_ENV || 'development';

if (
  nodeEnv === 'production' ||
  (!strapiUrl.includes('localhost') && !strapiUrl.includes('127.0.0.1'))
) {
  console.error('FATAL: seed.cjs is strictly restricted to local development environments.');
  console.error(`Received STRAPI_URL="${strapiUrl}", NODE_ENV="${nodeEnv}".`);
  process.exit(1);
}

// ── Baseline Solutions (17 Solutions: 5 Custom, 10 Ready-to-Configure, 2 SaaS) ──
const CUSTOM_SOLUTIONS = [
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
  }
];

const READY_TO_CONFIGURE_SOLUTIONS = [
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
    summary: 'End-to-end sample lifecycle management, test result workflows, instrument data ingestion and automated certificate generation.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Sales Force Automation',
    slug: 'sales-force-automation',
    modelType: 'ready-to-configure',
    order: 5,
    summary: 'Field sales workflows, beat planning, customer visit logging, order capture, distributor mapping and secondary sales visibility.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Project & Service Management',
    slug: 'project-service-management',
    modelType: 'ready-to-configure',
    order: 6,
    summary: 'Work order management, field technician dispatch, service ticket workflows and client sign-offs.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Customer Portal',
    slug: 'customer-portal',
    modelType: 'ready-to-configure',
    order: 7,
    summary: 'Self-service client platforms for order tracking, account management, invoices, tickets and direct communication.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Association & Membership Management',
    slug: 'association-membership-management',
    modelType: 'ready-to-configure',
    order: 8,
    summary: 'Member onboarding, dues collection, event registration, committee workflows and member directories.',
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
  }
];

const SAAS_PRODUCTS = [
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

// ── Baseline Industries (10 Industries) ──────────────────────────────────
const INDUSTRIES = [
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

async function seed() {
  console.log('--- Initializing Strapi instance for seed.cjs ---');
  let app;
  try {
    app = await createStrapi({ appDir, distDir: path.join(appDir, 'dist') }).load();
  } catch (err) {
    console.error('FATAL: Could not load Strapi:', err);
    process.exit(1);
  }

  try {
    console.log('✓ Strapi loaded. Running in local mode.');

    // ── STEP 4: Clear Target Tables Completely ────────────────────────────
    console.log('\n--- Step 4: Truncating/Clearing target tables so nothing old remains ---');
    const tablesToClear = [
      'case_studies_solutions_lnk',
      'components_case_study_tags',
      'components_case_study_stats',
      'components_case_study_key_facts',
      'components_case_study_outcome_cards',
      'components_case_study_challenges',
      'components_case_study_challenge_sections_cmps',
      'components_case_study_challenge_sections',
      'components_case_study_impact_sections_cmps',
      'components_case_study_impact_sections',
      'components_case_study_project_summaries_cmps',
      'components_case_study_project_summaries',
      'case_studies_cmps',
      'case_studies',
      'faqs_faq_category_lnk',
      'faqs',
      'faq_categories',
      'team_members',
      'partners',
      'testimonials'
    ];

    for (const table of tablesToClear) {
      try {
        await app.db.connection.raw(`TRUNCATE TABLE "${table}" CASCADE;`);
      } catch (err) {
        // Fallback to DELETE if TRUNCATE CASCADE hits link constraints
        try {
          await app.db.connection.raw(`DELETE FROM "${table}";`);
        } catch (delErr) {
          console.warn(`Warning clearing table ${table}: ${delErr.message}`);
        }
      }
    }
    console.log('✓ Cleared tables: testimonials, faqs, faq_categories, case_studies, team_members, partners');

    // ── 1. Seed 17 Solutions ─────────────────────────────────────────────
    console.log('\n--- 1. Seeding 17 Solutions (5 custom, 10 ready-to-configure, 2 saas) ---');
    const allSolutions = [...CUSTOM_SOLUTIONS, ...READY_TO_CONFIGURE_SOLUTIONS, ...SAAS_PRODUCTS];
    const solutionDocIdMap = {};

    for (const sol of allSolutions) {
      const existing = await app.documents('api::solution.solution').findFirst({
        filters: { slug: sol.slug }
      });

      if (!existing) {
        const created = await app.documents('api::solution.solution').create({
          data: sol,
          status: 'published'
        });
        solutionDocIdMap[sol.slug] = created.documentId;
        console.log(`✓ Created solution: "${sol.title}" (${sol.slug})`);
      } else {
        await app.documents('api::solution.solution').update({
          documentId: existing.documentId,
          data: sol,
          status: 'published'
        });
        solutionDocIdMap[sol.slug] = existing.documentId;
        console.log(`• Updated solution: "${sol.title}" (${sol.slug})`);
      }
    }

    // ── 2. Seed 10 Industries & Link Topic-Relevant Solutions ─────────────
    console.log('\n--- 2. Seeding 10 Industries (with topic-specific solutions) ---');
    const industrySolutionLinks = {
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

    const seededIndustryDocIds = [];

    for (const ind of INDUSTRIES) {
      const linkedSolutions = (industrySolutionLinks[ind.slug] || [])
        .map(slug => solutionDocIdMap[slug])
        .filter(Boolean);

      const existing = await app.documents('api::industry.industry').findFirst({
        filters: { slug: ind.slug }
      });

      const payload = {
        title: ind.title,
        slug: ind.slug,
        order: ind.order,
        summary: ind.summary,
        solutions: linkedSolutions
      };

      if (!existing) {
        console.warn(`WARNING: Industry slug "${ind.slug}" not found in database; creating.`);
        const created = await app.documents('api::industry.industry').create({
          data: payload,
          status: 'published'
        });
        seededIndustryDocIds.push(created.documentId);
        console.log(`✓ Created industry: "${ind.title}" (${ind.slug}) [order: ${ind.order}]`);
      } else {
        await app.documents('api::industry.industry').update({
          documentId: existing.documentId,
          data: payload,
          status: 'published'
        });
        seededIndustryDocIds.push(existing.documentId);
        console.log(`• Updated industry: "${ind.title}" (${ind.slug}) [order: ${ind.order}]`);
      }
    }

    // ── 3. Seed Hubs ─────────────────────────────────────────────────────
    console.log('\n--- 3. Seeding Hubs ---');

    // 3a. Ready-to-Configure Hub
    console.log('Seeding Ready-to-Configure Hub...');
    const rtcData = {
      heroHeading: 'Launch Faster With Software That Is Already Built',
      heroSubtext: 'Skip the long build phase. Our pre-engineered platforms come with the core features ready, so your team can tailor screens, rules and reports to fit your operations and go live in weeks instead of months.',
      whatItMeansHeading: 'Why This Approach Works',
      whatItMeansSubtext: 'A working core means you spend your budget on what makes your business different, not on rebuilding standard features.',
      whatItMeans: [
        {
          title: 'Ready on Day One',
          description: 'Core modules such as user management, dashboards and notifications are already built and tested.'
        },
        {
          title: 'Tailored to You',
          description: 'Change fields, approval chains, permissions and branding without touching the underlying code.'
        },
        {
          title: 'Built to Grow',
          description: 'Add new modules and custom logic later without rebuilding what you already have.'
        },
        {
          title: 'Plays Well With Others',
          description: 'Sync data with accounting tools, CRMs, payment providers and single sign-on systems.'
        }
      ],
      comparisonMatrix: {
        heading: 'The Middle Path Between Off-the-Shelf and Fully Custom',
        subtext: 'How Ready-to-Configure Compares',
        saasColumn: 'Fixed features, shared roadmap, minimal control over how it works.',
        readyColumn: 'Proven core with deep customization, delivered in a fraction of the time.',
        customColumn: 'Total freedom, but longer timelines and higher upfront cost.'
      },
      implementationFlow: {
        heading: 'From Kickoff to Launch in Six Clear Stages',
        subtext: 'Discover, set up, connect, import, enable, release',
        steps: [
          {
            title: 'Discover',
            description: 'Workshops with your stakeholders to capture goals, pain points and success measures.'
          },
          {
            title: 'Set Up',
            description: 'Our team configures the base platform around your approved workflows and branding.'
          },
          {
            title: 'Connect',
            description: 'Link the platform with the systems your teams already depend on every day.'
          },
          {
            title: 'Import',
            description: 'Clean and load your existing records with test runs before anything goes live.'
          },
          {
            title: 'Enable',
            description: 'Role-based training sessions, quick guides and recorded walkthroughs for your staff.'
          },
          {
            title: 'Release',
            description: 'Phased rollout with real-time monitoring and a support team on standby.'
          }
        ]
      },
      proof: {
        heading: 'Delivered for real teams with real deadlines.',
        ctaLabel: 'See Customer Success Stories'
      },
      finalCta: {
        heading: 'See It Working Before You Commit',
        subtext: 'Book a live session with our solution architects and watch a configured platform handle scenarios from your own industry.',
        ctaLabel: 'Book a Live Demo',
        secondaryCtaLabel: '' // Left empty: frontend HubFinalCta has no secondary link target wired
      }
    };

    const exRtc = await app.documents('api::ready-to-configure-hub.ready-to-configure-hub').findFirst({});
    if (!exRtc) {
      await app.documents('api::ready-to-configure-hub.ready-to-configure-hub').create({
        data: rtcData,
        status: 'published'
      });
      console.log('✓ Created Ready-to-Configure Hub');
    } else {
      await app.documents('api::ready-to-configure-hub.ready-to-configure-hub').update({
        documentId: exRtc.documentId,
        data: rtcData,
        status: 'published'
      });
      console.log('✓ Updated Ready-to-Configure Hub');
    }

    // 3b. SaaS Products Hub
    console.log('Seeding SaaS Products Hub...');
    const saasData = {
      heroHeading: 'Ready-to-Use Software, Billed Simply, Running in Days',
      heroSubtext: 'Sign up, invite your team and start working. Our subscription products cover everyday needs like invoicing, scheduling and support, with regular updates and hosting handled for you.',
      productsHeading: 'Our SaaS Product Lineup',
      productsSubtext: 'Subscription tools for invoicing, appointment booking, helpdesk and team collaboration, each ready to use out of the box and priced per user per month.',
      otherModels: {
        heading: 'Not Sure SaaS Is the Right Fit?',
        items: [
          {
            title: 'Want to adapt a platform to your workflows?',
            description: 'Our Ready-to-Configure solutions give you a proven foundation that we shape around your teams, rules and integrations.'
          },
          {
            title: 'Need software built around a unique idea?',
            description: 'Our custom engineering team designs and builds a platform from your requirements, with you owning the roadmap.'
          }
        ]
      },
      finalCta: {
        heading: 'Pick a Product and Start Your Free Trial',
        subtext: 'Try any Metaphi SaaS product free for 14 days. No credit card needed, and our support team is available throughout your trial.',
        ctaLabel: 'Start Free Trial',
        secondaryCtaLabel: '' // Left empty: frontend HubFinalCta has no secondary link target wired
      }
    };

    const exSaas = await app.documents('api::saas-products-hub.saas-products-hub').findFirst({});
    if (!exSaas) {
      await app.documents('api::saas-products-hub.saas-products-hub').create({
        data: saasData,
        status: 'published'
      });
      console.log('✓ Created SaaS Products Hub');
    } else {
      await app.documents('api::saas-products-hub.saas-products-hub').update({
        documentId: exSaas.documentId,
        data: saasData,
        status: 'published'
      });
      console.log('✓ Updated SaaS Products Hub');
    }

    // 3c. Industries Hub
    console.log('Seeding Industries Hub...');
    const indHubData = {
      heroHeading: 'Software That Understands How Your Industry Actually Works',
      heroSubtext: 'Healthcare, logistics, retail and finance each run on different rules, rhythms and regulations. We pair deep engineering skill with sector knowledge so the technology we deliver fits your daily reality from the first release.',
      gridHeading: 'Industries We Serve',
      gridSubtext: 'Explore how we apply our engineering core across ten industry verticals.',
      transformationThemes: {
        heading: 'One Industry at a Time, the Same Proven Playbook',
        items: [
          { text: 'Move off manual spreadsheets' },
          { text: 'Unify disconnected tools' },
          { text: 'Automate routine tasks' },
          { text: 'Get live operational insight' },
          { text: 'Open digital channels to clients' },
          { text: 'Upgrade aging platforms' },
          { text: 'Apply AI where it helps' },
          { text: 'Make data trustworthy' },
          { text: 'Ship products that scale' }
        ]
      },
      relevantSolutions: {
        heading: 'The Same Engineering Core Behind Every Sector',
        subtext: 'Whatever your industry, our delivery draws on shared strengths in application development, intelligent automation, cloud infrastructure and long-term platform support.',
        ctaLabel: 'See How We Build'
      },
      proof: {
        heading: 'See how these ideas played out in real projects.',
        ctaLabel: 'Read Project Stories'
      },
      resources: {
        heading: 'Learn Before You Commit',
        subtext: 'Practical guides on sector trends, technology choices and rollout lessons from the projects we have delivered.',
        ctaLabel: 'Read Our Industry Guides'
      },
      finalCta: {
        heading: "Tell Us About Your Sector's Biggest Challenge",
        subtext: "Share what is slowing your team down. We'll set up a 45-minute working session with engineers who know your space to walk through how others solved it.",
        ctaLabel: 'Schedule an Industry Session',
        secondaryCtaLabel: '' // Left empty: frontend HubFinalCta has no secondary link target wired
      }
    };

    const exIndHub = await app.documents('api::industries-hub.industries-hub').findFirst({});
    if (!exIndHub) {
      await app.documents('api::industries-hub.industries-hub').create({
        data: indHubData,
        status: 'published'
      });
      console.log('✓ Created Industries Hub');
    } else {
      await app.documents('api::industries-hub.industries-hub').update({
        documentId: exIndHub.documentId,
        data: indHubData,
        status: 'published'
      });
      console.log('✓ Updated Industries Hub');
    }

    // 3d. Solutions Hub
    console.log('Seeding Solutions Hub...');
    const solutionsHubData = {
      heroHeading: 'Three Paths to Fix Your Operations Problem',
      heroSubtext: 'Your best option depends on budget, timeline and how much control you want over the final product.',
      modelsHeading: 'Engagement Options',
      modelsSubtext: 'Compare how each approach handles cost, speed and flexibility, before you decide.',
      howToChoose: {
        heading: 'Unsure where to begin?',
        subtext: 'Answer three quick questions about uniqueness, speed and budget, and the right model usually becomes obvious.',
        customRuleTitle: 'Choose Custom',
        customRule: 'If no existing product matches how your team works.',
        readyRuleTitle: 'Choose Ready-to-Configure',
        readyRule: 'If you want speed but still need meaningful configuration.',
        saasRuleTitle: 'Choose SaaS',
        saasRule: 'If your needs are standard and you value simplicity over customisation.',
        ctaLabel: 'Get a Recommendation'
      },
      proof: {
        heading: 'Watch each model turn into real delivery.',
        ctaLabel: 'Browse Our Projects'
      },
      finalCta: {
        heading: "Let's Shape Your Project",
        subtext: "Tell us your goal and deadline. We'll respond within one business day with a practical plan.",
        ctaLabel: 'Request a Proposal',
        secondaryCtaLabel: ''
      },
      customModel: {
        title: 'Custom Solutions',
        tagline: 'Designed for your exact workflow',
        description: 'Choose this route when your processes, integrations or product vision are too specific for packaged software. Typical projects include internal platforms, customer portals, workflow automation and legacy system replacement.',
        ctaLabel: 'View Bespoke Engineering'
      },
      readyModel: {
        title: 'Ready-to-Configure Solutions',
        tagline: 'Launch in weeks, not quarters',
        description: 'Choose this route when we already have tested components for your problem, such as onboarding, scheduling, billing or reporting. We configure them to your rules and expand only where you need something unique.',
        ctaLabel: 'View Pre-Built Modules'
      },
      saasModel: {
        title: 'SaaS Products',
        tagline: 'Pay monthly, scale on demand',
        description: 'Choose this route when your need is common enough that a renowned product covers it with light setup and no custom development.',
        ctaLabel: 'View Subscription Platforms'
      }
    };

    const exSolHub = await app.documents('api::solutions-hub.solutions-hub').findFirst({});
    if (!exSolHub) {
      await app.documents('api::solutions-hub.solutions-hub').create({
        data: solutionsHubData,
        status: 'published'
      });
      console.log('✓ Created Solutions Hub');
    } else {
      await app.documents('api::solutions-hub.solutions-hub').update({
        documentId: exSolHub.documentId,
        data: solutionsHubData,
        status: 'published'
      });
      console.log('✓ Updated Solutions Hub');
    }

    // 3e. Custom Solutions Hub
    console.log('Seeding Custom Solutions Hub...');
    const customHubData = {
      heroHeading: 'Technology Designed Around the Way Your Business Works',
      heroSubtext: 'When standard software cannot accommodate your processes, product strategy or integration requirements, Metaphi designs and engineers technology around your business instead of forcing your business around the software.',
      capabilitiesHeading: 'Capabilities',
      capabilitiesSubtext: 'From business systems to intelligent digital products.',
      whenCustomMakesSense: {
        heading: 'When Custom Makes Sense',
        items: [
          { text: 'Your workflows create competitive differentiation.' },
          { text: 'Multiple existing systems need to work together.' },
          { text: 'Standard software requires excessive workarounds.' },
          { text: 'You are creating a new digital product.' },
          { text: 'Your business requires specialised automation or AI.' },
          { text: 'Existing technology needs modernisation.' },
          { text: 'You need full control over evolution and integrations.' }
        ]
      },
      businessOutcomes: {
        heading: 'Custom technology should create business leverage.',
        items: [
          { text: 'Fewer manual hand-offs' },
          { text: 'Better operational visibility' },
          { text: 'Connected data' },
          { text: 'Faster workflows' },
          { text: 'Better customer experience' },
          { text: 'Scalable digital operations' },
          { text: 'Reduced dependence on spreadsheets' },
          { text: 'Technology aligned to future growth' }
        ]
      },
      industriesBlock: {
        heading: 'Built across different operating environments.',
        ctaLabel: 'Explore Industries'
      },
      deliveryProcess: {
        heading: 'Structured enough for control. Flexible enough for reality.',
        subtext: 'Discover → Define → Design → Build → Integrate → Launch → Evolve',
        steps: [
          {
            title: 'Discover',
            description: 'Understand the business, users, processes, constraints and desired outcomes.'
          },
          {
            title: 'Define',
            description: 'Translate requirements into priorities, workflows, architecture and implementation scope.'
          },
          {
            title: 'Design',
            description: 'Shape the experience, system behaviour and solution architecture.'
          },
          {
            title: 'Build',
            description: 'Engineer the platform using an iterative, quality-controlled development process.'
          },
          {
            title: 'Integrate',
            description: 'Connect the solution with existing business systems, data and external services.'
          },
          {
            title: 'Launch',
            description: 'Validate, migrate, train and deploy with production-readiness checks.'
          },
          {
            title: 'Evolve',
            description: 'Support, improve and extend the solution as business requirements change.'
          }
        ]
      },
      proof: {
        heading: 'Explore Custom Solution Case Studies',
        ctaLabel: 'Explore Case Studies'
      },
      finalCta: {
        heading: 'Discuss Your Custom Software Requirement',
        subtext: 'Whether you need a custom platform, a configurable solution or strategic engineering support, our team is ready to discuss your initiative.',
        ctaLabel: 'Discuss Your Custom Software Requirement',
        secondaryCtaLabel: ''
      }
    };

    const exCustomHub = await app.documents('api::custom-solutions-hub.custom-solutions-hub').findFirst({});
    if (!exCustomHub) {
      await app.documents('api::custom-solutions-hub.custom-solutions-hub').create({
        data: customHubData,
        status: 'published'
      });
      console.log('✓ Created Custom Solutions Hub');
    } else {
      await app.documents('api::custom-solutions-hub.custom-solutions-hub').update({
        documentId: exCustomHub.documentId,
        data: customHubData,
        status: 'published'
      });
      console.log('✓ Updated Custom Solutions Hub');
    }

    // ── 4. Seed Work Page & Case Studies ─────────────────────────────────
    console.log('\n--- 4. Seeding Work Page & Case Studies ---');
    const workPageData = {
      heading: 'Work We Have Delivered for Real Teams',
      highlight: '',
      intro: 'A look inside the problems we were handed, the choices we made and the measurable results that followed. Every case study reflects real code in production.',
      emptyStateText: 'Case studies are currently being updated. Please check back soon.'
    };

    const exWork = await app.documents('api::work-page.work-page').findFirst({});
    if (!exWork) {
      await app.documents('api::work-page.work-page').create({
        data: workPageData,
        status: 'published'
      });
      console.log('✓ Created Work Page');
    } else {
      await app.documents('api::work-page.work-page').update({
        documentId: exWork.documentId,
        data: workPageData,
        status: 'published'
      });
      console.log('✓ Updated Work Page');
    }

    // Case Study 1: Route Planning Overhaul (Order 1, topic: logistics)
    const cs1Solutions = [
      solutionDocIdMap['warehouse-logistics-management'],
      solutionDocIdMap['inventory-distribution-management'],
      solutionDocIdMap['custom-business-applications']
    ].filter(Boolean);

    await app.documents('api::case-study.case-study').create({
      data: {
        slug: 'route-planning-overhaul',
        title: 'Route Planning Overhaul for Regional Fleet',
        order: 1,
        subtitle: 'Replacing manual dispatch with real-time routing',
        summary: 'A regional delivery fleet was spending three hours every morning manually assigning runs. We built a dispatch platform with dynamic route optimization that cut planning time to under twenty minutes and dropped fuel costs across the board.',
        tags: [
          { title: 'Logistics' },
          { title: 'Dispatch' },
          { title: 'Routing' }
        ],
        solutionText: 'We deployed an automated scheduling engine that factors in live traffic, vehicle capacities, delivery windows, and priority tiers to compute optimal multi-stop runs in real time.',
        solutions: cs1Solutions,
        projectSummary: {
          summaryText: 'Complete overhaul of fleet dispatching and live driver routing across 12 regional depots.',
          keyFacts: [
            { label: 'Client', value: 'FleetLogix Regional' },
            { label: 'Industry', value: 'Logistics & 3PL' },
            { label: 'Engagement', value: 'Custom Platform Build' }
          ],
          headlineStats: [
            { value: '88%', label: 'Less Planning Time' },
            { value: '14%', label: 'Fuel Reduction' }
          ]
        },
        challengeSection: {
          challenge: 'Dispatchers relied on wall-mounted maps and static spreadsheets to assign over 250 daily stops.',
          items: [
            {
              title: 'Manual Scheduling Delays',
              description: 'Dispatchers spent three hours every morning manually assigning delivery routes across drivers.'
            },
            {
              title: 'Excessive Fuel Consumption',
              description: 'Inefficient routing led to significant mileage overlap, empty backhauls, and rising fuel expenditures.'
            },
            {
              title: 'Zero Real-time Visibility',
              description: 'Central operations lost contact with drivers once vehicles left the warehouse depot.'
            }
          ]
        },
        impactSection: {
          outcomeCards: [
            {
              metric: '88%',
              title: 'Faster Morning Dispatch',
              description: 'Planning time dropped from three hours to under twenty minutes per distribution depot.'
            },
            {
              metric: '14%',
              title: 'Fuel Spend Reduction',
              description: 'Optimized delivery routes eliminated redundant mileage and cut monthly fleet fuel expenses.'
            },
            {
              metric: '99.4%',
              title: 'On-Time Delivery Rate',
              description: 'Accurate arrival estimates and live adjustments raised on-time delivery customer satisfaction.'
            }
          ]
        }
      },
      status: 'published'
    });
    console.log('✓ Created Case Study: "Route Planning Overhaul for Regional Fleet"');

    // Case Study 2: Patient Booking Redesign (Order 2, topic: healthcare)
    const cs2Solutions = [
      solutionDocIdMap['healthcare-operations-management'],
      solutionDocIdMap['laboratory-information-management-system'],
      solutionDocIdMap['customer-portal']
    ].filter(Boolean);

    await app.documents('api::case-study.case-study').create({
      data: {
        slug: 'patient-booking-redesign',
        title: 'Patient Booking Redesign for Multi-Clinic Network',
        order: 2,
        subtitle: 'Unifying four clinic systems into one patient portal',
        summary: 'A network of twenty-four outpatient clinics had four different scheduling tools, leaving front-desk staff overwhelmed by phone bookings. We unified their calendars into a single patient self-service portal, reducing no-shows and freeing front desks to focus on patients in the room.',
        tags: [
          { title: 'Healthcare' },
          { title: 'Scheduling' },
          { title: 'Self-Service' }
        ],
        solutionText: 'We integrated the clinic EHR databases into a centralized scheduling platform with automated SMS reminders and a patient self-service portal.',
        solutions: cs2Solutions,
        projectSummary: {
          summaryText: 'Consolidation of disparate clinic scheduling calendars into a unified patient booking portal.',
          keyFacts: [
            { label: 'Client', value: 'CarePoint Outpatient Network' },
            { label: 'Industry', value: 'Healthcare & Life Sciences' },
            { label: 'Engagement', value: 'Ready-to-Configure Deployment' }
          ],
          headlineStats: [
            { value: '31%', label: 'Fewer Missed Visits' },
            { value: '62%', label: 'Online Bookings' }
          ]
        },
        challengeSection: {
          challenge: 'Twenty-four clinic locations operated four distinct legacy calendars without coordination.',
          items: [
            {
              title: 'Fragmented Clinic Calendars',
              description: 'Four disconnected legacy scheduling systems prevented cross-location availability visibility.'
            },
            {
              title: 'Severe Phone Bottlenecks',
              description: 'Front-desk staff spent over 70% of their operational hours handling routine phone scheduling.'
            },
            {
              title: 'High Patient No-Show Rates',
              description: 'Lack of automated reminders and easy rescheduling resulted in persistent missed appointments.'
            }
          ]
        },
        impactSection: {
          outcomeCards: [
            {
              metric: '31%',
              title: 'Fewer Missed Visits',
              description: 'Automated SMS confirmations and easy one-click rescheduling reduced appointment no-shows.'
            },
            {
              metric: '62%',
              title: 'Booked by Patients Themselves',
              description: 'The majority of appointments shifted online, dramatically lowering front-desk call load.'
            },
            {
              metric: '4.8/5',
              title: 'Patient Satisfaction Score',
              description: 'Patients praised the intuitive booking experience and convenient mobile calendar reminders.'
            }
          ]
        }
      },
      status: 'published'
    });
    console.log('✓ Created Case Study: "Patient Booking Redesign for Multi-Clinic Network"');

    // ── 5. Seed About Page ───────────────────────────────────────────────
    console.log('\n--- 5. Seeding About Page ---');
    const aboutPageData = {
      heroHeading: 'We Build the Software Your Operations Depend On',
      heroSubtext: "We are an engineering team that focuses on what happens after the sale: the messy, critical, everyday software that keeps orders moving, trucks running, patients seen and teams aligned. No jargon, no runaway scopes - just solid software that solves the problem you hired us for.",
      missionHeading: 'How We Think About the Work',
      missionText: "Most software projects don't fail because the code was bad. They fail because the team building it never truly understood the business problem. We start on your side of the table: learning your workflows, respecting the systems you already have, and delivering working software in small, verifiable steps so you never have to wonder what your budget is paying for.",
      pillarsHeading: 'The Principles We Work By',
      pillars: [
        {
          title: 'Direct Access to the Engineers',
          description: 'You talk with the people writing the code and designing the architecture, not layers of account managers.'
        },
        {
          title: 'Working Software Over Big Presentations',
          description: 'We show progress in weekly demos with clickable screens, not slide decks.'
        },
        {
          title: 'Code You Actually Own',
          description: 'All code, tests, documentation and deployment scripts belong to you from the moment invoices are settled.'
        },
        {
          title: 'Honest Scoping',
          description: "If something isn't worth building, we'll tell you. We protect your budget as if it were ours."
        }
      ],
      finalCta: {
        heading: "Let's Talk About What You Need Built",
        subtext: "Tell us where your current tools are letting you down. We'll set up a 30-minute discovery call with a senior engineer - no sales pitch, just practical answers.",
        ctaLabel: 'Book a Technical Consultation',
        secondaryCtaLabel: 'Schedule a Call'
      }
    };

    const exAbout = await app.documents('api::about-page.about-page').findFirst({});
    if (!exAbout) {
      await app.documents('api::about-page.about-page').create({
        data: aboutPageData,
        status: 'published'
      });
      console.log('✓ Created About Page');
    } else {
      await app.documents('api::about-page.about-page').update({
        documentId: exAbout.documentId,
        data: aboutPageData,
        status: 'published'
      });
      console.log('✓ Updated About Page');
    }

    // ── 6. Seed Team Page & Team Members ─────────────────────────────────
    console.log('\n--- 6. Seeding Team Page & Team Members ---');
    const teamPageData = {
      heroHeading: 'The People Behind the Code',
      heroSubtext: "Senior engineers, product designers and solution architects with decades of collective experience across cloud infrastructure, enterprise applications and applied AI.",
      emptyStateText: 'Our team directory is being updated. Please check back shortly.'
    };

    const exTeamPage = await app.documents('api::team-page.team-page').findFirst({});
    if (!exTeamPage) {
      await app.documents('api::team-page.team-page').create({
        data: teamPageData,
        status: 'published'
      });
      console.log('✓ Created Team Page');
    } else {
      await app.documents('api::team-page.team-page').update({
        documentId: exTeamPage.documentId,
        data: teamPageData,
        status: 'published'
      });
      console.log('✓ Updated Team Page');
    }

    const teamMembersList = [
      {
        name: 'Meera Iyer',
        role: 'Head of Solutions Architecture',
        department: 'Engineering',
        bio: 'Over twelve years designing distributed systems, high-throughput APIs and cloud infrastructure for logistics and financial operations.',
        order: 1
      },
      {
        name: 'Arjun Deshmukh',
        role: 'Principal Product Engineer',
        department: 'Product',
        bio: 'Leads our application delivery teams, specializing in complex workflow design, relational data models and frictionless web interfaces.',
        order: 2
      }
    ];

    for (const m of teamMembersList) {
      await app.documents('api::team-member.team-member').create({
        data: m,
        status: 'published'
      });
      console.log(`✓ Created Team Member: ${m.name}`);
    }

    // ── 7. Seed Testimonials Page & Testimonials ─────────────────────────
    console.log('\n--- 7. Seeding Testimonials Page & Testimonials ---');
    const testimonialsPageData = {
      heroHeading: 'What Our Clients Say',
      heroSubtext: 'Read how teams across logistics, healthcare and commerce used Metaphi software to modernize operations, cut overhead and hit their deadlines.',
      emptyStateText: 'Testimonials are currently being refreshed. Please check back soon.'
    };

    const exTestimonialsPage = await app.documents('api::testimonials-page.testimonials-page').findFirst({});
    if (!exTestimonialsPage) {
      await app.documents('api::testimonials-page.testimonials-page').create({
        data: testimonialsPageData,
        status: 'published'
      });
      console.log('✓ Created Testimonials Page');
    } else {
      await app.documents('api::testimonials-page.testimonials-page').update({
        documentId: exTestimonialsPage.documentId,
        data: testimonialsPageData,
        status: 'published'
      });
      console.log('✓ Updated Testimonials Page');
    }

    const testimonialsList = [
      {
        quote: "Metaphi didn't just write code - they pushed back on ideas that wouldn't have scaled and delivered our dispatch overhaul two weeks ahead of schedule.",
        name: 'Priya Nambiar',
        role: 'VP of Operations',
        company: 'FleetLogix',
        result: '88% faster dispatch time',
        order: 1
      },
      {
        quote: 'The booking portal unified twenty-four clinics in four months without a single day of patient disruption. Their weekly demo cadence kept everyone aligned.',
        name: 'Daniel Okafor',
        role: 'Chief Medical Information Officer',
        company: 'CarePoint Network',
        result: '31% reduction in no-shows',
        order: 2
      }
    ];

    for (const t of testimonialsList) {
      await app.documents('api::testimonial.testimonial').create({
        data: t,
        status: 'published'
      });
      console.log(`✓ Created Testimonial: "${t.name}" (${t.company})`);
    }

    // ── 8. Seed Partners Page & Partners ─────────────────────────────────
    console.log('\n--- 8. Seeding Partners Page & Partners ---');
    const partnersPageData = {
      heroHeading: 'Technology and Platform Partners',
      heroSubtext: 'We build on proven cloud providers, developer platforms and data infrastructure so your software stays fast, secure and supported long after launch.',
      emptyStateText: 'Partner directory is currently being updated. Please check back soon.'
    };

    const exPartnersPage = await app.documents('api::partners-page.partners-page').findFirst({});
    if (!exPartnersPage) {
      await app.documents('api::partners-page.partners-page').create({
        data: partnersPageData,
        status: 'published'
      });
      console.log('✓ Created Partners Page');
    } else {
      await app.documents('api::partners-page.partners-page').update({
        documentId: exPartnersPage.documentId,
        data: partnersPageData,
        status: 'published'
      });
      console.log('✓ Updated Partners Page');
    }

    const partnersList = [
      {
        name: 'Skyline Cloud Systems',
        category: 'Cloud Infrastructure',
        description: 'Global compute and storage provider powering our production deployments with 99.99% uptime guarantees.',
        order: 1
      },
      {
        name: 'Brightwave Analytics',
        category: 'Data & Telemetry',
        description: 'Real-time event streaming and analytical pipeline partner for operational monitoring.',
        order: 2
      },
      {
        name: 'Northgate Security Labs',
        category: 'Application Security',
        description: 'Independent vulnerability scanning, compliance audits and penetration testing.',
        order: 3
      }
    ];

    for (const p of partnersList) {
      await app.documents('api::partner.partner').create({
        data: p,
        status: 'published'
      });
      console.log(`✓ Created Partner: "${p.name}"`);
    }

    // ── 9. Seed Compliance Page ──────────────────────────────────────────
    console.log('\n--- 9. Seeding Compliance Page ---');
    const compliancePageData = {
      heroHeading: 'Security, Privacy and Engineering Standards',
      heroSubtext: 'Enterprise-grade protection is not an add-on. We build defense in depth, strict access controls and verifiable audit logs into every project from day one.',
      sectionEyebrow: 'Our Safeguards',
      sectionHeading: 'How We Protect Your Code, Data and Operations',
      sectionSubtext: 'Practical engineering controls applied across development, staging and production.',
      items: [
        {
          title: 'Encrypted in Transit and at Rest',
          description: 'All database volumes, backups and network communication use industry-standard encryption protocols (TLS 1.3, AES-256).'
        },
        {
          title: 'Role-Based Access and Audit Logging',
          description: 'Fine-grained permissions ensure staff see only what their job requires, with tamper-evident audit trails on every write.'
        },
        {
          title: 'Isolated Environments',
          description: 'Development, staging and production run on separate networks with distinct credentials and anonymized test datasets.'
        },
        {
          title: 'Regular Vulnerability Audits',
          description: 'Automated dependency scanning on every pull request paired with routine third-party penetration testing.'
        }
      ],
      finalCta: {
        heading: 'Have Specific Security Requirements?',
        subtext: 'Share your compliance checklist or vendor assessment questionnaire. Our engineering leads will review it and return clear answers within two business days.',
        ctaLabel: 'Submit Your Security Questionnaire',
        secondaryCtaLabel: 'Schedule a Call'
      }
    };

    const exCompliancePage = await app.documents('api::compliance-page.compliance-page').findFirst({});
    if (!exCompliancePage) {
      await app.documents('api::compliance-page.compliance-page').create({
        data: compliancePageData,
        status: 'published'
      });
      console.log('✓ Created Compliance Page');
    } else {
      await app.documents('api::compliance-page.compliance-page').update({
        documentId: exCompliancePage.documentId,
        data: compliancePageData,
        status: 'published'
      });
      console.log('✓ Updated Compliance Page');
    }

    // ── 10. Seed FAQ Page & FAQ Entries ──────────────────────────────────
    console.log('\n--- 10. Seeding FAQ Page & FAQ Entries ---');
    const faqPageData = {
      heroHeading: 'Questions We Hear Most Often',
      heroSubtext: 'Straight answers about how we work, what projects cost, how long they take and who owns the finished product. Not finding yours? Just ask us.',
      emptyStateText: 'Our FAQ list is being refreshed. Please check back soon, or reach out and we will answer your question directly.'
    };

    const exFaqPage = await app.documents('api::faq-page.faq-page').findFirst({});
    if (!exFaqPage) {
      await app.documents('api::faq-page.faq-page').create({
        data: faqPageData,
        status: 'published'
      });
      console.log('✓ Created FAQ Page');
    } else {
      await app.documents('api::faq-page.faq-page').update({
        documentId: exFaqPage.documentId,
        data: faqPageData,
        status: 'published'
      });
      console.log('✓ Updated FAQ Page');
    }

    const categoryNames = ['Process', 'Pricing', 'Legal', 'Support'];
    const catDocMap = {};
    for (const name of categoryNames) {
      let exCat = await app.documents('api::faq-category.faq-category').findFirst({
        filters: { name }
      });
      if (!exCat) {
        exCat = await app.documents('api::faq-category.faq-category').create({
          data: { name },
          status: 'published'
        });
        console.log(`✓ Created FAQ Category: ${name}`);
      }
      catDocMap[name] = exCat.documentId;
    }

    const faqList = [
      {
        question: 'How long does a typical project take?',
        answer: 'Most projects run between 3 and 8 months, depending on scope. We agree on a delivery plan after the discovery phase and share progress every two weeks.',
        categoryName: 'Process',
        order: 1
      },
      {
        question: 'How do you price your work?',
        answer: 'We offer fixed-price packages for well-defined scopes and monthly team-based pricing for ongoing work. After a short discovery call we give you a written estimate.',
        categoryName: 'Pricing',
        order: 2
      },
      {
        question: 'Who owns the code you write for us?',
        answer: 'You do. Once the final invoice is paid, all source code and project documentation transfer to your organization under a written agreement.',
        categoryName: 'Legal',
        order: 3
      },
      {
        question: 'Do you provide support after launch?',
        answer: 'Yes. Every project includes a short warranty period for fixes, and you can add a support plan for monitoring, updates and new features afterwards.',
        categoryName: 'Support',
        order: 4
      }
    ];

    for (const f of faqList) {
      await app.documents('api::faq.faq').create({
        data: {
          question: f.question,
          answer: f.answer,
          order: f.order,
          faqCategory: catDocMap[f.categoryName]
        },
        status: 'published'
      });
      console.log(`✓ Created FAQ: "${f.question.slice(0, 35)}..." [${f.categoryName}]`);
    }

    // ── 11. Seed Default CTA Banner ──────────────────────────────────────
    console.log('\n--- 11. Seeding Default CTA Banner ---');
    const defaultCtaBannerData = {
      heading: 'Ready to Turn Your Idea into Reality?',
      text: 'Tell us what you are building. We will come back within one business day with next steps.',
      buttonLabel: 'Book a Call'
    };

    const exBanner = await app.documents('api::default-cta-banner.default-cta-banner').findFirst({});
    if (!exBanner) {
      await app.documents('api::default-cta-banner.default-cta-banner').create({
        data: defaultCtaBannerData,
        status: 'published'
      });
      console.log('✓ Created Default CTA Banner');
    } else {
      await app.documents('api::default-cta-banner.default-cta-banner').update({
        documentId: exBanner.documentId,
        data: defaultCtaBannerData,
        status: 'published'
      });
      console.log('✓ Updated Default CTA Banner');
    }

    // ── 12. Seed Contact Page & Schedule A Call Page ──────────────────────
    console.log('\n--- 12. Seeding Contact Page & Schedule A Call Page ---');
    const contactPageData = {
      heroHeading: 'Contact',
      heroHighlight: 'Us.',
      heroSubtext: 'Have an inquiry or project idea? Connect directly with our team to explore technical solutions.',
      email: 'hello@metaphi.example',
      emailLabel: 'Email Us',
      phoneLabel: 'Call Us',
      phones: [
        { label: 'India', value: '+91 00000 00000', href: '+910000000000' },
        { label: 'USA', value: '+1 000 000 0000', href: '+10000000000' }
      ],
      firstNameLabel: 'First Name',
      firstNamePlaceholder: 'First Name *',
      lastNameLabel: 'Last Name',
      lastNamePlaceholder: 'Last Name *',
      emailFieldLabel: 'Email Address',
      emailFieldPlaceholder: 'Email Address *',
      countryCodeLabel: 'Country Code',
      phoneFieldLabel: 'Contact Number',
      phoneFieldPlaceholder: 'Contact Number *',
      messageFieldLabel: 'Your Message',
      messageFieldPlaceholder: 'Type your message here... *',
      submitButtonLabel: 'Submit Now',
      submittingButtonLabel: 'Submitting...',
      successHeading: 'Message Received',
      successMessage: 'Thank you for reaching out. A senior member of our engineering team will review your requirements and respond within one business day.',
      sendAnotherLabel: 'Send Another Message',
      errorMessage: 'Failed to submit. Please check your information and try again.'
    };

    const exContact = await app.documents('api::contact-page.contact-page').findFirst({});
    if (!exContact) {
      await app.documents('api::contact-page.contact-page').create({
        data: contactPageData,
        status: 'published'
      });
      console.log('✓ Created Contact Page');
    } else {
      await app.documents('api::contact-page.contact-page').update({
        documentId: exContact.documentId,
        data: contactPageData,
        status: 'published'
      });
      console.log('✓ Updated Contact Page');
    }

    const schedulePageData = {
      heroHeading: 'Book a Technical',
      heroHighlight: 'Consultation',
      heroSubtext: 'Speak directly with our solutions architects to evaluate technical feasibility, project scope, and system design tailored to your organization.',
      durationText: '30 Min Session',
      videoCallText: 'Google Meet / Zoom',
      promisesHeading: 'What you can expect from us:',
      promises: [
        { text: 'Tailored Solutions for Complex Challenges' },
        { text: 'End-to-End Development Support' },
        { text: '100% In-house Engineering Team' },
        { text: 'Proven Track Record with Industry Leaders' },
        { text: 'Transparent Milestone & Payment Policies' }
      ],
      selectTimezoneLabel: 'Time zone:',
      availableSlotsLabel: 'Available slots for:',
      confirmButtonTemplate: 'Confirm 30-Minute Meeting for {month} {day} at {slot}',
      emptySlotButtonLabel: 'Select a time slot above to continue',
      confirmationHeading: 'Meeting Confirmed!',
      confirmationSubtext: 'Your 30-minute technical discovery session has been successfully booked with our architecture team.',
      calendarInviteNote: 'A calendar invitation with video conference credentials has been forwarded to your email address.',
      rescheduleButtonLabel: 'Schedule Another Time',
      returnHomeButtonLabel: 'Return to Homepage'
    };

    const exSchedule = await app.documents('api::schedule-a-call-page.schedule-a-call-page').findFirst({});
    if (!exSchedule) {
      await app.documents('api::schedule-a-call-page.schedule-a-call-page').create({
        data: schedulePageData,
        status: 'published'
      });
      console.log('✓ Created Schedule A Call Page');
    } else {
      await app.documents('api::schedule-a-call-page.schedule-a-call-page').update({
        documentId: exSchedule.documentId,
        data: schedulePageData,
        status: 'published'
      });
      console.log('✓ Updated Schedule A Call Page');
    }

    // ── 13. Ensure Home Page Baseline Exists (Preserve Hero & Stats Strip) ──
    console.log('\n--- 13. Verifying Home Page baseline ---');
    const exHome = await app.documents('api::home-page.home-page').findFirst({});
    if (!exHome) {
      const homeData = {
        heroTitle: 'Technology Built Around',
        heroHighlight: 'Your Business',
        heroDescription: 'We design, engineer and evolve custom software, digital products and enterprise AI solutions that solve real operational problems, connect fragmented workflows and create the technology foundation for growth.',
        primaryButtonText: 'Discuss Your Technology Initiative',
        secondaryButtonText: 'Explore Case Studies',
        companyStats: [
          { label: 'Years of Experience', value: 12, suffix: '+' },
          { label: 'Engineers & Architects', value: 85, suffix: '+' },
          { label: 'Industries Served', value: 10, suffix: '' },
          { label: 'Products & Systems Shipped', value: 140, suffix: '+' }
        ],
        trustHeading: 'Business-first thinking.',
        trustHighlight: 'Engineering-led execution.',
        trustSubtext: 'From operational systems and digital products to AI-enabled workflows and connected business platforms, Metaphi works at the intersection of technology, process and business outcomes.',
        trustPills: [
          { text: 'Business Applications' },
          { text: 'Product Engineering' },
          { text: 'Enterprise AI' },
          { text: 'Cloud, Data & Integrations' },
          { text: 'Managed Services' }
        ],
        businessProblemsHeading: 'Technology should remove complexity—',
        businessProblemsHighlight: 'not add another layer of it.',
        businessProblemsSubtext: 'Businesses typically come to us when existing tools, manual processes or disconnected systems begin limiting visibility, productivity or growth.',
        businessProblems: [
          { title: 'Fragmented Operations', description: 'Critical workflows spread across spreadsheets, disconnected applications and manual coordination.' },
          { title: 'Legacy Technology', description: 'Existing systems are difficult to integrate, scale or adapt to changing business requirements.' },
          { title: 'Product Ideas That Need Execution', description: 'A digital product or SaaS idea exists, but turning it into a reliable, scalable platform requires structured product engineering.' },
          { title: 'AI Opportunities Without a Practical Roadmap', description: 'Teams see the potential of AI but need help identifying where it can create measurable operational value.' },
          { title: 'Growing Beyond Existing Systems', description: 'Standard software no longer fits the way the business operates.' },
          { title: 'Technology Without Business Visibility', description: 'Data exists across systems, but management still lacks timely, actionable information.' }
        ],
        solutionModelsEyebrow: 'WHAT WE DO',
        solutionModelsLinkLabel: 'Learn More',
        solutionModelsHeading: 'Choose the technology model that',
        solutionModelsHighlight: 'fits your business.',
        solutionModelsSubtext: 'Not every technology problem should be solved the same way. Metaphi offers three engagement models depending on how unique your requirements are, how quickly you need to move and how much configuration your business requires.',
        industriesSection: {
          heading: 'Technology grounded in industry context.',
          subtext: 'Technology decisions work better when they reflect how an industry actually operates. Metaphi combines engineering capability with practical understanding of business workflows across ten industry groups.',
          ctaLabel: 'Explore Industries'
        },
        workShowcaseEyebrow: 'FEATURED CASE STUDY',
        workShowcaseLinkLabel: 'View Full Case Study',
        workShowcaseHeading: "Results We're Accountable for.",
        workShowcaseHighlight: 'Work You Can Verify.',
        workShowcaseIntro: 'Metaphi delivers proven, production-grade systems across industries. Every project was engineered from strategy to post-launch impact.',
        whyMetaphiHeading: 'A technology partner—',
        whyMetaphiHighlight: 'not another development vendor.',
        whyMetaphiSubtext: 'We partner with growing businesses and enterprise teams who need more than extra development hands.',
        whyMetaphiPillars: [
          { title: 'Business Before Technology', description: 'We begin by understanding the operating problem, not by prescribing a technology stack.' },
          { title: 'Structured Product Thinking', description: 'Requirements, workflows and priorities are translated into clear product and engineering decisions.' },
          { title: 'Integrated Capability', description: 'Software, AI, cloud, data and integrations are considered as parts of one technology ecosystem.' },
          { title: 'Built for Evolution', description: 'Solutions are designed so that new workflows, integrations and capabilities can be introduced as the business changes.' },
          { title: 'Long-Term Partnership', description: 'We can continue supporting, improving and extending the technology after launch.' }
        ],
        deliveryApproachHeading: 'From business problem to',
        deliveryApproachHighlight: 'working technology.',
        deliveryApproachSubtext: 'A structured, transparent engineering process designed to deliver predictable outcomes from discovery through to post-launch evolution.',
        finalCta: {
          heading: "Have a technology initiative you're trying to move forward?",
          subtext: "Tell us what you are trying to improve, automate, build or scale. We'll help you evaluate the right technology approach.",
          ctaLabel: 'Discuss Your Technology Initiative',
          secondaryCtaLabel: ''
        },
        whyChooseEyebrow: 'WHY METAPHI',
        whyChooseCertifications: [],
        certificationsEmptyStateText: 'No certifications currently displayed.',
        testimonialsEyebrow: 'CLIENT TESTIMONIALS',
        testimonialsEmptyStateText: 'No testimonials available.',
        faqEyebrow: 'QUICK ANSWERS',
        faqLinkLabel: 'Browse all FAQs',
        faqEmptyStateText: 'No FAQs available.',
        clientLogos: [],
        industries: seededIndustryDocIds
      };

      await app.documents('api::home-page.home-page').create({
        data: homeData,
        status: 'published'
      });
      console.log('✓ Created initial Home Page baseline');
    } else {
      // Preserve heroTitle, heroHighlight, heroDescription, primaryButtonText, secondaryButtonText, companyStats
      // Only attach updated industries relation and ensure certifications/logos remain uninvented/empty
      await app.documents('api::home-page.home-page').update({
        documentId: exHome.documentId,
        data: {
          industries: seededIndustryDocIds,
          clientLogos: [],
          whyChooseCertifications: []
        },
        status: 'published'
      });
      console.log('✓ Verified and linked Home Page without altering hero or stats strip');
    }

    console.log('\n======================================================');
    console.log('ALL SECTIONS SEEDED & PUBLISHED LOCALLY WITH SUCCESS!');
    console.log('======================================================\n');
    process.exit(0);
  } catch (err) {
    console.error('FATAL: Error during seed execution:', err);
    process.exit(1);
  }
}

seed();
