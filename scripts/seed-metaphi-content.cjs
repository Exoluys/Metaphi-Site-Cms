/**
 * seed-metaphi-content.cjs
 * 
 * Idempotent seed script for Metaphi CMS using Strapi v5 Document Service API.
 * Strict: Word doc text only, no invented copy.
 * 
 * SEEDED AS PUBLISHED:
 *  - 10 Industries
 *  - 17 Solutions:
 *      * 5 Custom Solutions
 *      * 10 Ready-to-Configure Solutions (6 featuredOnHome)
 *      * 2 SaaS Products (Stockiphi, Taskiphi)
 *  - Solutions Hub (with named slots: customModel, readyModel, saasModel, howToChoose, proof, finalCta)
 *  - Custom Solutions Hub (whenCustomMakesSense, businessOutcomes, industriesBlock, deliveryProcess, proof, finalCta)
 *  - Ready-to-Configure Hub (whatItMeans, comparisonMatrix, implementationFlow, proof, finalCta)
 *  - SaaS Products Hub (otherModels, finalCta)
 *  - Industries Hub (transformationThemes, relevantSolutions, proof, resources, finalCta)
 *  - Home Page (Hero, Trust, Business Problems, Featured Case Studies, Why Metaphi, Delivery Approach, Final CTA, and Industries relation)
 *  - Default CTA Banner
 * 
 * SEEDED AS DRAFT:
 *  - 6 FAQs
 * 
 * NOT SEEDED / LEFT EMPTY:
 *  - stats, whyChooseStats, whyChooseCertifications, clientLogos, showcase case studies
 */

const { createStrapi } = require('@strapi/strapi');
const path = require('path');
require('dotenv').config();

// 1. Strict Environment Safety Guardrail
const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
const isLocal = strapiUrl.includes('localhost') || strapiUrl.includes('127.0.0.1');
const isDev = process.env.NODE_ENV !== 'production';

if (!isLocal || !isDev) {
  console.error('REFUSING TO RUN: This seed script can ONLY be executed against localhost in development mode.');
  process.exit(1);
}

// 2. Verified Word Document Content Definitions

// 10 Industries
const INDUSTRIES = [
  { order: 1, slug: 'manufacturing', title: 'Manufacturing', hubTitle: 'Manufacturing', hubSummary: 'Connect production, inventory, sales, quality, finance and operational workflows through integrated digital systems.' },
  { order: 2, slug: 'healthcare', title: 'Healthcare & Diagnostics', hubTitle: 'Healthcare & Diagnostics', hubSummary: 'Build patient, laboratory, diagnostic and operational platforms that improve service delivery and process visibility.' },
  { order: 3, slug: 'logistics', title: 'Logistics & 3PL', hubTitle: 'Logistics & 3PL', hubSummary: 'Digitise transportation, fleet, warehouse, shipment and customer workflows.' },
  { order: 4, slug: 'finance', title: 'Financial Services & FinTech', hubTitle: 'Financial Services & FinTech', hubSummary: 'Engineer secure digital platforms for trading, lending, partner ecosystems and financial operations.' },
  { order: 5, slug: 'professional-services', title: 'Professional Services', hubTitle: 'Professional Services', hubSummary: 'Connect CRM, projects, teams, service delivery and commercial management.' },
  { order: 6, slug: 'retail-and-ecommerce', title: 'Retail & Ecommerce', hubTitle: 'Retail & Ecommerce', hubSummary: 'Integrate commerce, inventory, fulfilment, customer and order operations.' },
  { order: 7, slug: 'consumer-platforms-and-marketplaces', title: 'Consumer Platforms & Marketplaces', hubTitle: 'Consumer Platforms & Marketplaces', hubSummary: 'Build scalable marketplaces, subscription platforms and digital consumer products.' },
  { order: 8, slug: 'associations-and-communities', title: 'Associations & Communities', hubTitle: 'Associations & Communities', hubSummary: 'Create membership, networking, event and community-engagement ecosystems.' },
  { order: 9, slug: 'education', title: 'Education & Training', hubTitle: 'Education & Training', hubSummary: 'Digitise learning, administration, assessments and learner engagement.' },
  { order: 10, slug: 'government-and-public-sector', title: 'Government & Public Sector', hubTitle: 'Government & Public Sector', hubSummary: 'Build platforms for administration, infrastructure programmes, monitoring and citizen-facing workflows.' }
];

// 5 Custom Solutions (Word doc Part 4 Capabilities)
const CUSTOM_SOLUTIONS = [
  {
    title: 'Custom Business Applications',
    slug: 'custom-business-applications',
    modelType: 'custom',
    order: 1,
    summary: 'Create operational, ERP, CRM, workflow, inventory and management systems around your processes.',
    homeTitle: 'Custom Business Applications',
    homeSummary: 'ERP, CRM, inventory, workflow, operations and enterprise applications designed around the way your organisation actually works.',
    ctaLabel: 'Explore Business Applications'
  },
  {
    title: 'Product Engineering',
    slug: 'product-engineering',
    modelType: 'custom',
    order: 2,
    summary: 'Turn product concepts into reliable digital platforms and evolve existing products as they scale.',
    homeTitle: 'Product Engineering',
    homeSummary: 'From discovery and MVP development to scalable SaaS platforms, mobile products and product modernisation.',
    ctaLabel: 'Explore Product Engineering'
  },
  {
    title: 'Enterprise AI',
    slug: 'enterprise-ai-solutions',
    modelType: 'custom',
    order: 3,
    summary: 'Embed practical intelligence into workflows, documents, decisions and user experiences.',
    homeTitle: 'Enterprise AI Solutions',
    homeSummary: 'Practical AI for copilots, intelligent documents, workflow automation, forecasting, recommendations and decision support.',
    ctaLabel: 'Explore Enterprise AI'
  },
  {
    title: 'Cloud, Data & System Integrations',
    slug: 'cloud-data-integrations',
    modelType: 'custom',
    order: 4,
    summary: 'Modernise systems and connect applications, platforms, APIs and data.',
    homeTitle: 'Cloud, Data & Integrations',
    homeSummary: 'Connect applications, APIs, cloud platforms and business data while modernising technology foundations.',
    ctaLabel: 'Explore Cloud & Integrations'
  },
  {
    title: 'Application & Cloud Managed Services',
    slug: 'application-cloud-managed-services',
    modelType: 'custom',
    order: 5,
    summary: 'Maintain and continuously improve business-critical technology after implementation.',
    homeTitle: 'Application & Cloud Managed Services',
    homeSummary: 'Keep critical applications reliable, supported, secure and continuously evolving.',
    ctaLabel: 'Explore Managed Services'
  }
];

// 10 Ready-to-Configure Solutions (Word doc Part 5 Solution Portfolio)
const READY_TO_CONFIGURE_SOLUTIONS = [
  {
    title: 'Manufacturing Operations Management',
    slug: 'manufacturing-operations-management',
    modelType: 'ready-to-configure',
    order: 1,
    featuredOnHome: true,
    summary: 'A configurable operational platform connecting production planning, job-order tracking, inventory movements, quality checkpoints and dispatch.',
    homeTitle: 'Manufacturing Operations Management',
    homeSummary: 'A configurable operational platform connecting production planning, job-order tracking, inventory movements, quality checkpoints and dispatch.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Inventory & Distribution Management',
    slug: 'inventory-distribution-management',
    modelType: 'ready-to-configure',
    order: 2,
    featuredOnHome: true,
    summary: 'Multi-location inventory tracking, batch and serialized traceability, stock movement approvals and warehouse-level controls.',
    homeTitle: 'Inventory & Distribution Management',
    homeSummary: 'Multi-location inventory tracking, batch and serialized traceability, stock movement approvals and warehouse-level controls.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Warehouse & Logistics Management',
    slug: 'warehouse-logistics-management',
    modelType: 'ready-to-configure',
    order: 3,
    featuredOnHome: false,
    summary: 'Warehouse and distribution management connecting inbound receiving, bin allocation, pick-pack workflows and fleet tracking.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Laboratory Information Management System',
    slug: 'laboratory-information-management-system',
    modelType: 'ready-to-configure',
    order: 4,
    featuredOnHome: true,
    summary: 'End-to-end sample lifecycle management, test result workflows, instrument data ingestion and automated certificate generation.',
    homeTitle: 'Laboratory Information Management System',
    homeSummary: 'End-to-end sample lifecycle management, test result workflows, instrument data ingestion and automated certificate generation.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Sales Force Automation',
    slug: 'sales-force-automation',
    modelType: 'ready-to-configure',
    order: 5,
    featuredOnHome: true,
    summary: 'Field sales workflows, beat planning, customer visit logging, order capture, distributor mapping and secondary sales visibility.',
    homeTitle: 'Sales Force Automation',
    homeSummary: 'Field sales workflows, beat planning, customer visit logging, order capture, distributor mapping and secondary sales visibility.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Project & Service Management',
    slug: 'project-service-management',
    modelType: 'ready-to-configure',
    order: 6,
    featuredOnHome: true,
    summary: 'Work order management, field technician dispatch, service ticket workflows and client sign-offs.',
    homeTitle: 'Project & Service Management',
    homeSummary: 'Work order management, field technician dispatch, service ticket workflows and client sign-offs.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Customer Portal',
    slug: 'customer-portal',
    modelType: 'ready-to-configure',
    order: 7,
    featuredOnHome: false,
    summary: 'Self-service client platforms for order tracking, account management, invoices, tickets and direct communication.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Association & Membership Management',
    slug: 'association-membership-management',
    modelType: 'ready-to-configure',
    order: 8,
    featuredOnHome: true,
    summary: 'Member onboarding, dues collection, event registration, committee workflows and member directories.',
    homeTitle: 'Association & Membership Management',
    homeSummary: 'Member onboarding, dues collection, event registration, committee workflows and member directories.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Financial Operations Management',
    slug: 'financial-operations-management',
    modelType: 'ready-to-configure',
    order: 9,
    featuredOnHome: false,
    summary: 'Automated billing, reconciliation, partner commissions, ledger integration and operational finance dashboards.',
    ctaLabel: 'Explore Solutions'
  },
  {
    title: 'Healthcare Operations Management',
    slug: 'healthcare-operations-management',
    modelType: 'ready-to-configure',
    order: 10,
    featuredOnHome: false,
    summary: 'Patient workflow coordination, clinic appointments, diagnostic reporting and departmental scheduling.',
    ctaLabel: 'Explore Solutions'
  }
];

// 2 SaaS Products (Word doc Part 6)
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

// 6 FAQs (Draft only)
const FAQS = [
  {
    order: 1,
    category: 'General',
    question: 'How does Metaphi engage with new engineering projects?',
    answer: 'We begin with a focused architectural discovery phase to define scope, system requirements, and technical milestones. Within days, we assemble a dedicated engineering pod aligned with your stack, establish continuous CI/CD pipelines, and begin bi-weekly sprint deliverables with full code repository access.'
  },
  {
    order: 2,
    category: 'Delivery',
    question: 'What typical timelines can we expect from kickoff to launch?',
    answer: 'Most prototype and MVP builds reach production-ready deployment within 6 to 10 weeks. Enterprise platform modernization, digital twin simulation pipelines, and multi-agent AI rollouts typically follow milestone-based roadmaps ranging from 3 to 6 months with progressive production releases.'
  },
  {
    order: 3,
    category: 'Engagement',
    question: 'What pricing and engagement models do you support?',
    answer: 'We offer flexible engagement structures tailored to project needs: dedicated engineering teams on monthly retainer for continuous development, fixed-scope delivery for well-specified products, and time-and-materials arrangements for high-iteration AI research and pilot builds.'
  },
  {
    order: 4,
    category: 'Operations',
    question: 'How are development teams structured and managed?',
    answer: 'Every project is powered by a cross-functional pod comprising senior full-stack/AI engineers, an engineering lead, and a dedicated delivery manager. We integrate directly into your Slack, Jira, and GitHub environments, ensuring transparent daily standups and async communication across time zones.'
  },
  {
    order: 5,
    category: 'Legal',
    question: 'Who owns the intellectual property and code generated?',
    answer: 'You retain 100% ownership of all code, architecture documents, model weights, and custom algorithms developed during the project. All IP and assets are assigned directly to your organization upon creation with zero licensing or vendor lock-in.'
  },
  {
    order: 6,
    category: 'Support',
    question: 'What post-launch support and warranty coverage do you provide?',
    answer: 'Every delivered build includes a 60-day post-launch warranty covering bug fixes and system stabilization at no extra cost. Beyond launch, we offer dedicated SLA-backed maintenance, 24/7 cloud infrastructure monitoring, and ongoing optimization tiers.'
  }
];

async function seed() {
  console.log('Initializing Strapi instance...');
  const app = await createStrapi({ distDir: path.join(__dirname, '..', 'dist') }).load();

  try {
    console.log('Strapi loaded successfully. Beginning idempotent seed...\n');

    // ==========================================
    // 1. Seed 10 Industries (PUBLISHED)
    // ==========================================
    console.log('--- 1. Seeding 10 Industries ---');
    const seededIndustryDocIds = [];

    for (const ind of INDUSTRIES) {
      const existing = await app.documents('api::industry.industry').findFirst({
        filters: { slug: ind.slug }
      });

      if (!existing) {
        const created = await app.documents('api::industry.industry').create({
          data: {
            title: ind.title,
            slug: ind.slug,
            order: ind.order,
            featuredOnHub: true,
            hubTitle: ind.hubTitle,
            hubSummary: ind.hubSummary,
            hubOrder: ind.order,
            ctaLabel: 'Explore Your Industry',
            ctaLink: `/industries/${ind.slug}`
          },
          status: 'published'
        });
        seededIndustryDocIds.push(created.documentId);
        console.log(`✓ Created & published industry: ${ind.title} (${created.documentId})`);
      } else {
        await app.documents('api::industry.industry').update({
          documentId: existing.documentId,
          data: {
            title: ind.title,
            order: ind.order,
            featuredOnHub: true,
            hubTitle: ind.hubTitle,
            hubSummary: ind.hubSummary,
            hubOrder: ind.order,
            ctaLabel: 'Explore Your Industry',
            ctaLink: `/industries/${ind.slug}`
          },
          status: 'published'
        });
        seededIndustryDocIds.push(existing.documentId);
        console.log(`• Industry already exists: ${ind.title} (${existing.documentId})`);
      }
    }

    // ==========================================
    // 2. Seed 17 Solutions (PUBLISHED)
    // ==========================================
    console.log('\n--- 2. Seeding 17 Solutions ---');
    const allSolutions = [...CUSTOM_SOLUTIONS, ...READY_TO_CONFIGURE_SOLUTIONS, ...SAAS_PRODUCTS];

    for (const sol of allSolutions) {
      const existing = await app.documents('api::solution.solution').findFirst({
        filters: { slug: sol.slug }
      });

      if (!existing) {
        await app.documents('api::solution.solution').create({
          data: sol,
          status: 'published'
        });
        console.log(`✓ Created & published solution: ${sol.title} (${sol.modelType})`);
      } else {
        await app.documents('api::solution.solution').update({
          documentId: existing.documentId,
          data: sol,
          status: 'published'
        });
        console.log(`• Solution already exists: ${sol.title} (${sol.modelType})`);
      }
    }

    // ==========================================
    // 3. Seed Solutions Hub (PUBLISHED) with Named Slots
    // ==========================================
    console.log('\n--- 3. Seeding Solutions Hub ---');
    const solutionsHubData = {
      heroHeading: 'Three Ways to Solve Your Technology Challenge',
      heroSubtext: 'The right solution depends on how unique your requirements are, how quickly you need to implement and how much control your business needs over the resulting technology.',
      customModel: {
        title: 'Custom Solutions',
        tagline: 'Build around your requirements',
        description: 'Choose Custom Solutions when your business processes, product vision, integrations or competitive requirements demand bespoke technology. Typical needs include bespoke ERP or operational software, new SaaS or digital products, AI-enabled workflows, legacy modernisation and complex system integrations.',
        homeDescription: 'Built around your business. When your workflows, product vision or technology requirements are unique, we design and engineer the solution around them.',
        ctaLabel: 'Explore Custom Solutions'
      },
      readyModel: {
        title: 'Ready-to-Configure Solutions',
        tagline: 'Start from a proven foundation',
        description: 'Choose Ready-to-Configure when Metaphi has already built significant reusable capability for the problem you are trying to solve. You gain a faster starting point, configurable workflows, bespoke extensions, integration flexibility and lower implementation uncertainty.',
        homeDescription: 'Start with a proven foundation. Accelerate implementation using Metaphi solution foundations that can be configured, extended and integrated around your business.',
        ctaLabel: 'Explore Ready-to-Configure Solutions'
      },
      saasModel: {
        title: 'SaaS Products',
        tagline: 'Use a standardised product',
        description: 'Choose SaaS where the business requirement is common enough to be addressed through a subscription product without significant custom engineering.',
        homeDescription: 'Subscribe and start using. Purpose-built software for common business needs where extensive customisation is not required.',
        ctaLabel: 'Explore SaaS Products'
      },
      howToChoose: {
        heading: 'Not sure which model fits?',
        customRule: 'Choose Custom when your process or product is strategically unique.',
        readyRule: 'Choose Ready-to-Configure when you want faster implementation but still need significant business configuration.',
        saasRule: 'Choose SaaS when your requirement is standard and speed/simplicity matter more than deep customisation.',
        ctaLabel: 'Discuss the Right Approach'
      },
      proof: {
        heading: 'See how different technology models translate into execution.',
        ctaLabel: 'Explore Case Studies'
      },
      finalCta: {
        heading: 'Discuss Your Technology Initiative',
        subtext: 'Whether you need a custom platform, a configurable solution or strategic engineering support, our team is ready to discuss your initiative.',
        ctaLabel: 'Discuss Your Initiative',
        ctaLink: '/contact'
      }
    };

    const exSolutionsHub = await app.documents('api::solutions-hub.solutions-hub').findFirst({});
    if (!exSolutionsHub) {
      await app.documents('api::solutions-hub.solutions-hub').create({
        data: solutionsHubData,
        status: 'published'
      });
      console.log('✓ Created & published Solutions Hub');
    } else {
      await app.documents('api::solutions-hub.solutions-hub').update({
        documentId: exSolutionsHub.documentId,
        data: solutionsHubData,
        status: 'published'
      });
      console.log('✓ Updated & published Solutions Hub');
    }

    // ==========================================
    // 4. Seed Custom Solutions Hub (PUBLISHED)
    // ==========================================
    console.log('\n--- 4. Seeding Custom Solutions Hub ---');
    const customHubData = {
      heroHeading: 'Technology Designed Around the Way Your Business Works',
      heroSubtext: 'When standard software cannot accommodate your processes, product strategy or integration requirements, Metaphi designs and engineers technology around your business instead of forcing your business around the software.',
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
          { title: 'Discover' },
          { title: 'Define' },
          { title: 'Design' },
          { title: 'Build' },
          { title: 'Integrate' },
          { title: 'Launch' },
          { title: 'Evolve' }
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
        ctaLink: '/contact'
      }
    };

    const exCustomHub = await app.documents('api::custom-solutions-hub.custom-solutions-hub').findFirst({});
    if (!exCustomHub) {
      await app.documents('api::custom-solutions-hub.custom-solutions-hub').create({
        data: customHubData,
        status: 'published'
      });
      console.log('✓ Created & published Custom Solutions Hub');
    } else {
      await app.documents('api::custom-solutions-hub.custom-solutions-hub').update({
        documentId: exCustomHub.documentId,
        data: customHubData,
        status: 'published'
      });
      console.log('✓ Updated & published Custom Solutions Hub');
    }

    // ==========================================
    // 5. Seed Ready-to-Configure Hub (PUBLISHED)
    // ==========================================
    console.log('\n--- 5. Seeding Ready-to-Configure Hub ---');
    const rtcHubData = {
      heroHeading: 'Start With a Proven Foundation. Configure It Around Your Business.',
      heroSubtext: 'Not every implementation needs to begin from zero. Metaphi’s Ready-to-Configure solutions combine reusable software foundations with the flexibility to adapt workflows, modules, integrations and reporting around your operating model.',
      whatItMeans: [
        { title: 'Already Available', description: 'Core workflows, modules and system foundations based on previous implementation experience.' },
        { title: 'Configurable', description: 'Business rules, workflows, roles, reports and user journeys can be aligned to your organisation.' },
        { title: 'Extendable', description: 'New functionality can be engineered where your requirements go beyond the existing foundation.' },
        { title: 'Integrable', description: 'The solution can connect with your existing applications, devices and external platforms.' }
      ],
      comparisonMatrix: {
        heading: 'More flexible than SaaS. Faster than starting completely from scratch.',
        subtext: 'Different From SaaS',
        saasColumn: 'Standard product with limited configuration.',
        readyColumn: 'Reusable solution foundation with substantial business configuration and extension.',
        customColumn: 'Designed primarily from your unique requirements.'
      },
      implementationFlow: {
        heading: 'Configure. Integrate. Validate. Launch.',
        subtext: 'Assess → Configure → Integrate → Migrate → Train → Go Live',
        steps: [
          { title: 'Assess' },
          { title: 'Configure' },
          { title: 'Integrate' },
          { title: 'Migrate' },
          { title: 'Train' },
          { title: 'Go Live' }
        ]
      },
      proof: {
        heading: 'Built from implementation experience—not theory.',
        ctaLabel: 'Explore Relevant Case Studies'
      },
      finalCta: {
        heading: 'Request a Solution Walkthrough',
        subtext: 'Whether you need a custom platform, a configurable solution or strategic engineering support, our team is ready to discuss your initiative.',
        ctaLabel: 'Request a Solution Walkthrough',
        ctaLink: '/contact'
      }
    };

    const exRtcHub = await app.documents('api::ready-to-configure-hub.ready-to-configure-hub').findFirst({});
    if (!exRtcHub) {
      await app.documents('api::ready-to-configure-hub.ready-to-configure-hub').create({
        data: rtcHubData,
        status: 'published'
      });
      console.log('✓ Created & published Ready-to-Configure Hub');
    } else {
      await app.documents('api::ready-to-configure-hub.ready-to-configure-hub').update({
        documentId: exRtcHub.documentId,
        data: rtcHubData,
        status: 'published'
      });
      console.log('✓ Updated & published Ready-to-Configure Hub');
    }

    // ==========================================
    // 6. Seed SaaS Products Hub (PUBLISHED)
    // ==========================================
    console.log('\n--- 6. Seeding SaaS Products Hub ---');
    const saasHubData = {
      heroHeading: 'Purpose-Built SaaS for Everyday Business Operations',
      heroSubtext: 'Metaphi’s SaaS products address common operational needs through standardised, subscription-based software that businesses can adopt without bespoke development.',
      otherModels: {
        heading: 'SaaS vs Other Metaphi Models',
        items: [
          { text: 'Need substantial tailoring? Explore Ready-to-Configure Solutions.' },
          { text: 'Building something strategically unique? Explore Custom Solutions.' }
        ]
      },
      finalCta: {
        heading: 'Explore Metaphi Products',
        subtext: 'Whether you need a custom platform, a configurable solution or strategic engineering support, our team is ready to discuss your initiative.',
        ctaLabel: 'Explore Metaphi Products',
        ctaLink: '/contact'
      }
    };

    const exSaasHub = await app.documents('api::saas-products-hub.saas-products-hub').findFirst({});
    if (!exSaasHub) {
      await app.documents('api::saas-products-hub.saas-products-hub').create({
        data: saasHubData,
        status: 'published'
      });
      console.log('✓ Created & published SaaS Products Hub');
    } else {
      await app.documents('api::saas-products-hub.saas-products-hub').update({
        documentId: exSaasHub.documentId,
        data: saasHubData,
        status: 'published'
      });
      console.log('✓ Updated & published SaaS Products Hub');
    }

    // ==========================================
    // 7. Seed Industries Hub (PUBLISHED)
    // ==========================================
    console.log('\n--- 7. Seeding Industries Hub ---');
    const industriesHubData = {
      heroHeading: 'Technology Solutions Built Around Industry Reality',
      heroSubtext: 'Every industry has different workflows, constraints, customer expectations and opportunities. Metaphi combines software engineering, AI and automation capabilities with industry-specific solution thinking.',
      transformationThemes: {
        heading: 'Different industries. Recurring transformation opportunities.',
        items: [
          { text: 'Replace spreadsheet-led processes' },
          { text: 'Connect fragmented business applications' },
          { text: 'Automate repetitive workflows' },
          { text: 'Improve management visibility' },
          { text: 'Build customer and partner portals' },
          { text: 'Modernise legacy systems' },
          { text: 'Introduce practical AI' },
          { text: 'Improve data availability' },
          { text: 'Build scalable digital products' }
        ]
      },
      relevantSolutions: {
        heading: 'Capability that travels across industries.',
        subtext: 'Our industry work is supported by a common engineering foundation across Custom Business Applications, Product Engineering, Enterprise AI, Cloud & Integrations and Managed Services.',
        ctaLabel: 'Explore Custom Solutions'
      },
      proof: {
        heading: 'Explore industry experience through real implementations.',
        ctaLabel: 'View Case Studies'
      },
      resources: {
        heading: 'Go deeper with industry playbooks.',
        subtext: 'Our industry playbooks explore common operational challenges, technology opportunities and practical transformation paths.',
        ctaLabel: 'Browse Industry Playbooks'
      },
      finalCta: {
        heading: 'Discuss Your Industry Technology Initiative',
        subtext: 'Whether you need a custom platform, a configurable solution or strategic engineering support, our team is ready to discuss your initiative.',
        ctaLabel: 'Discuss Your Industry Technology Initiative',
        ctaLink: '/contact'
      }
    };

    const exIndHub = await app.documents('api::industries-hub.industries-hub').findFirst({});
    if (!exIndHub) {
      await app.documents('api::industries-hub.industries-hub').create({
        data: industriesHubData,
        status: 'published'
      });
      console.log('✓ Created & published Industries Hub');
    } else {
      await app.documents('api::industries-hub.industries-hub').update({
        documentId: exIndHub.documentId,
        data: industriesHubData,
        status: 'published'
      });
      console.log('✓ Updated & published Industries Hub');
    }

    // ==========================================
    // 8. Seed Home Page (PUBLISHED)
    // ==========================================
    console.log('\n--- 8. Seeding Home Page ---');
    const existingHome = await app.documents('api::home-page.home-page').findFirst({});

    const homeData = {
      heroTitle: 'Technology Built Around',
      heroHighlight: 'Your Business',
      heroDescription: 'We design, engineer and evolve custom software, digital products and enterprise AI solutions that solve real operational problems, connect fragmented workflows and create the technology foundation for growth.',
      primaryButtonText: 'Discuss Your Technology Initiative',
      secondaryButtonText: 'Explore Case Studies',
      heroMicrocopy: 'Custom Solutions · Ready-to-Configure Solutions · SaaS Products',
      trustHeading: 'Business-first thinking. Engineering-led execution.',
      trustSubtext: 'From operational systems and digital products to AI-enabled workflows and connected business platforms, Metaphi works at the intersection of technology, process and business outcomes.',
      trustPills: [
        { text: 'Business Applications' },
        { text: 'Product Engineering' },
        { text: 'Enterprise AI' },
        { text: 'Cloud, Data & Integrations' },
        { text: 'Managed Services' }
      ],
      businessProblemsHeading: 'Technology should remove complexity—not add another layer of it.',
      businessProblemsSubtext: 'Businesses typically come to us when existing tools, manual processes or disconnected systems begin limiting visibility, productivity or growth.',
      businessProblems: [
        { title: 'Fragmented Operations', description: 'Critical workflows spread across spreadsheets, disconnected applications and manual coordination.' },
        { title: 'Legacy Technology', description: 'Existing systems are difficult to integrate, scale or adapt to changing business requirements.' },
        { title: 'Product Ideas That Need Execution', description: 'A digital product or SaaS idea exists, but turning it into a reliable, scalable platform requires structured product engineering.' },
        { title: 'AI Opportunities Without a Practical Roadmap', description: 'Teams see the potential of AI but need help identifying where it can create measurable operational value.' },
        { title: 'Growing Beyond Existing Systems', description: 'Standard software no longer fits the way the business operates.' },
        { title: 'Technology Without Business Visibility', description: 'Data exists across systems, but management still lacks timely, actionable information.' }
      ],
      solutionModelsHeading: 'Choose the technology model that fits your business.',
      solutionModelsSubtext: 'Not every technology problem should be solved the same way. Metaphi offers three engagement models depending on how unique your requirements are, how quickly you need to move and how much configuration your business requires.',
      customCapabilitiesSection: {
        heading: 'From business systems to intelligent digital products.',
        ctaLabel: 'Explore Custom Solutions',
        ctaLink: '/solutions/custom-solutions'
      },
      industriesSection: {
        heading: 'Technology grounded in industry context.',
        subtext: 'Technology decisions work better when they reflect how an industry actually operates. Metaphi combines engineering capability with practical understanding of business workflows across ten industry groups.',
        ctaLabel: 'Explore Industries',
        ctaLink: '/industries'
      },
      readyToConfigureSection: {
        heading: 'Move faster without forcing your business into generic software.',
        subtext: 'Where we have already solved similar operational problems, Metaphi can begin with a reusable solution foundation and configure it around your workflows, integrations and operating model.',
        ctaLabel: 'View Ready-to-Configure Solutions',
        ctaLink: '/solutions/ready-to-configure'
      },
      featuredCaseStudiesSection: {
        heading: 'Proof through execution.',
        subtext: 'Explore how we have translated complex operational and digital requirements into working business platforms.',
        ctaLabel: 'Explore All Case Studies',
        ctaLink: '/work'
      },
      featuredCaseStudies: [
        { title: 'Agrochemical Manufacturing Digital Transformation', blurb: 'Connecting core workflows across a growing manufacturing business.' },
        { title: 'Food Testing Laboratory Information Management System', blurb: 'Digitising the laboratory lifecycle from sample registration to reporting.' },
        { title: 'Capital Markets Partner & Branch Management Platform', blurb: 'Creating a connected operating platform for partner-led financial services.' },
        { title: 'Metal Industry B2B Marketplace', blurb: 'Engineering a digital marketplace connecting buyers and sellers in a specialised industrial ecosystem.' }
      ],
      whyMetaphiHeading: 'A technology partner—not another development vendor.',
      whyMetaphiSubtext: 'We partner with growing businesses and enterprise teams who need more than extra development hands.',
      whyMetaphiPillars: [
        { title: 'Business Before Technology', description: 'We begin by understanding the operating problem, not by prescribing a technology stack.' },
        { title: 'Structured Product Thinking', description: 'Requirements, workflows and priorities are translated into clear product and engineering decisions.' },
        { title: 'Integrated Capability', description: 'Software, AI, cloud, data and integrations are considered as parts of one technology ecosystem.' },
        { title: 'Built for Evolution', description: 'Solutions are designed so that new workflows, integrations and capabilities can be introduced as the business changes.' },
        { title: 'Long-Term Partnership', description: 'We can continue supporting, improving and extending the technology after launch.' }
      ],
      deliveryApproachHeading: 'From business problem to working technology.',
      deliveryApproachSubtext: 'A structured, transparent engineering process designed to deliver predictable outcomes from discovery through to post-launch evolution.',
      deliveryApproachSteps: [
        { stepNumber: 1, title: 'Discover', description: 'Understand the business, users, processes, constraints and desired outcomes.' },
        { stepNumber: 2, title: 'Define', description: 'Translate requirements into priorities, workflows, architecture and implementation scope.' },
        { stepNumber: 3, title: 'Design', description: 'Shape the experience, system behaviour and solution architecture.' },
        { stepNumber: 4, title: 'Build', description: 'Engineer the platform using an iterative, quality-controlled development process.' },
        { stepNumber: 5, title: 'Integrate', description: 'Connect the solution with existing business systems, data and external services.' },
        { stepNumber: 6, title: 'Launch', description: 'Validate, migrate, train and deploy with production-readiness checks.' },
        { stepNumber: 7, title: 'Evolve', description: 'Support, improve and extend the solution as business requirements change.' }
      ],
      insightsResourcesSection: {
        heading: 'Practical thinking for better technology decisions.',
        subtext: 'Explore industry playbooks, implementation guides and perspectives on enterprise software, product engineering, AI and digital transformation.',
        ctaLabel: 'Explore Insights',
        ctaLink: '',
        secondaryCtaLabel: 'Browse Resources',
        secondaryCtaLink: ''
      },
      finalCta: {
        heading: 'Have a technology initiative you’re trying to move forward?',
        subtext: 'Tell us what you are trying to improve, automate, build or scale. We’ll help you evaluate the right technology approach.',
        ctaLabel: 'Discuss Your Technology Initiative',
        ctaLink: '/contact',
        secondaryCtaLabel: 'Book a Discovery Call',
        secondaryCtaLink: '/schedule-a-call'
      },
      stats: [],
      whyChooseStats: [],
      whyChooseCertifications: [],
      clientLogos: [],
      industries: seededIndustryDocIds
    };

    if (!existingHome) {
      const createdHome = await app.documents('api::home-page.home-page').create({
        data: homeData,
        status: 'published'
      });
      console.log(`✓ Created & published Home Page (${createdHome.documentId}) with ${seededIndustryDocIds.length} connected industries.`);
    } else {
      await app.documents('api::home-page.home-page').update({
        documentId: existingHome.documentId,
        data: homeData,
        status: 'published'
      });
      console.log(`✓ Updated & published Home Page (${existingHome.documentId}) with ${seededIndustryDocIds.length} connected industries.`);
    }

    // ==========================================
    // 9. Seed 6 FAQs (DRAFT ONLY)
    // ==========================================
    console.log('\n--- 9. Seeding 6 FAQs (as DRAFT) ---');
    for (const faq of FAQS) {
      const existing = await app.documents('api::faq.faq').findFirst({
        filters: { question: faq.question }
      });

      if (!existing) {
        await app.documents('api::faq.faq').create({
          data: faq,
          status: 'draft'
        });
        console.log(`✓ Created FAQ as DRAFT: "${faq.question.slice(0, 40)}..."`);
      } else {
        console.log(`• FAQ already exists: "${faq.question.slice(0, 40)}..."`);
      }
    }

    // ==========================================
    // 10. Seed Default CTA Banner (PUBLISHED)
    // ==========================================
    console.log('\n--- 10. Seeding Default CTA Banner ---');
    const existingBanner = await app.documents('api::default-cta-banner.default-cta-banner').findFirst({});
    const bannerData = {
      heading: 'Ready to Turn Your Idea into Reality?',
      text: 'Tell us what you are building. We will come back within one business day with next steps.',
      buttonLabel: 'Book a Call',
      buttonLink: '/schedule-a-call',
      themeVariant: 'dark'
    };

    if (!existingBanner) {
      await app.documents('api::default-cta-banner.default-cta-banner').create({
        data: bannerData,
        status: 'published'
      });
      console.log('✓ Created & published Default CTA Banner');
    } else {
      await app.documents('api::default-cta-banner.default-cta-banner').update({
        documentId: existingBanner.documentId,
        data: bannerData,
        status: 'published'
      });
      console.log('✓ Updated & published Default CTA Banner');
    }

    console.log('\n==========================================');
    console.log('✓ SEED COMPLETED SUCCESSFULLY');
    console.log('==========================================\n');

  } catch (err) {
    console.error('CRITICAL SEED ERROR:', err);
    process.exit(1);
  } finally {
    await app.destroy();
    process.exit(0);
  }
}

seed();
