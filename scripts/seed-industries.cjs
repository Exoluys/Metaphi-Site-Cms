/**
 * seed-industries.cjs
 *
 * Phase 3: Seed dummy content for the remaining 11 industries (Strapi v5).
 * Healthcare is explicitly excluded and remains untouched.
 *
 * Usage:
 *   node scripts/seed-industries.cjs            # Dry-run (default, safe, read-only)
 *   node scripts/seed-industries.cjs --apply    # Write draft & published via Document Service API
 */

const { createStrapi } = require('@strapi/strapi');

const TARGET_SLUGS = [
  'education',
  'finance',
  'fitness-and-wellness',
  'logistics',
  'manufacturing',
  'media',
  'real-estate',
  'retail-and-ecommerce',
  'saas',
  'sports-and-gaming',
  'testing-and-certification',
];

// ─── 11 INDUSTRY CONTENT DEFINITIONS ─────────────────────────────────────────

const INDUSTRY_DATA = {
  // 1. EDUCATION
  education: {
    hero: {
      title: 'EdTech Software Engineering for Scalable Learning Platforms',
      description: 'Architecting high-concurrency learning management systems, virtual classrooms, and adaptive education tools designed for modern institutions and digital academies.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'FERPA-aware',
        title: 'Student Privacy Standards',
        description: 'Engineering practices aligned with educational data privacy and security mandates.',
      },
      {
        value: 'LTI-ready',
        title: 'Ecosystem Interoperability',
        description: 'Standardized integration architectures connecting leading SIS and LMS ecosystems.',
      },
    ],
    challenges: {
      heading: 'Overcoming Core Digital Bottlenecks in Modern Education',
      ctaLabel: 'Discuss Your EdTech Roadmap',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Platform crashes and degraded video feeds during peak synchronous lecture hours.',
          costToClient: 'Disrupted instruction schedules, frustrated learners, and churn in paid course enrollments.',
          solutionLabel: 'Elastic Auto-Scaling & Real-Time Media Streaming',
          preferredService: 'cloud-engineering',
        },
        {
          challenge: 'Fragmented student performance data across disconnected test and assignment portals.',
          costToClient: 'Inability to detect struggling learners early, causing higher drop-out and failure rates.',
          solutionLabel: 'Unified Learner Analytics & Early-Alert Pipelines',
          preferredService: 'data-analytics',
        },
        {
          challenge: 'Clunky legacy student information interfaces causing high abandonment during course enrollment.',
          costToClient: 'Administrative processing backlogs and significant friction during semester registration cycles.',
          solutionLabel: 'Intuitive Student Portal & Mobile Registration Flows',
          preferredService: 'web-portal-development',
        },
        {
          challenge: 'High manual grading workloads draining educator focus from live teaching and curriculum development.',
          costToClient: 'Slow feedback cycles on formative assessments and widespread educator burnout.',
          solutionLabel: 'Automated Feedback Assistants & Grading Workflows',
          preferredService: 'ai-agent-development',
        },
      ],
    },
    caseStudies: [], // No existing education case study
    solutions: {
      heading: 'Comprehensive Engineering Solutions for Education & EdTech',
      intro: 'Modern digital learning architectures engineered for high engagement, institutional reliability, and student success.',
      categories: [
        {
          categoryName: 'Learning Management & Delivery',
          items: [
            {
              title: 'Custom LMS & Virtual Classroom Platforms',
              description: 'Scalable learning management systems featuring real-time whiteboards, interactive breakout rooms, and attendance telemetry.',
            },
            {
              title: 'Adaptive Assessment & Quiz Engines',
              description: 'Dynamic testing platforms with randomized question banks, automated rubric grading, and anti-cheating audit logging.',
            },
            {
              title: 'Microlearning & Modular Course Apps',
              description: 'Bite-sized mobile learning applications with offline access, gamified streaks, and multimedia course modules.',
            },
          ],
        },
        {
          categoryName: 'Institutional Administration',
          items: [
            {
              title: 'Student Information & Enrollment Portals',
              description: 'Self-service course registration, tuition payment processing, and transcript generation workflows.',
            },
            {
              title: 'SIS & LTI Tool Integrations',
              description: 'Bi-directional data exchange pipelines bridging institutional SIS databases with third-party digital learning tools.',
            },
            {
              title: 'Standards & Regulatory Reporting Dashboards',
              description: 'Automated reporting engines aggregating course outcomes, syllabus coverage, and attendance audits.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for Education Providers',
      tabs: [
        {
          preferredSlug: 'software-development',
          industryDescription: 'Full-stack engineering for web and mobile education portals, student dashboards, and custom course authoring tools.',
          highlightTags: 'Custom Portals, LMS Development, Interactive Courseware',
          order: 1,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'Auto-scaling cloud infrastructure engineered to handle massive concurrent traffic spikes during semester exams and enrollment days.',
          highlightTags: 'Auto-Scaling, Video Infrastructure, High Availability',
          order: 2,
        },
        {
          preferredSlug: 'ai-agent-development',
          industryDescription: 'Intelligent teaching assistants, automated writing feedback engines, and 24/7 student support chatbots.',
          highlightTags: 'Teaching Copilots, Automated Tutoring, Student Support',
          order: 3,
        },
        {
          preferredSlug: 'web-portal-development',
          industryDescription: 'Responsive student, faculty, and administrator portals with unified single sign-on and role-based permissions.',
          highlightTags: 'Student Portals, Faculty Dashboards, SSO Integration',
          order: 4,
        },
        {
          preferredSlug: 'mobile-app-development',
          industryDescription: 'Cross-platform iOS and Android learning applications supporting offline course sync, push reminders, and progress tracking.',
          highlightTags: 'Mobile Learning, Offline Sync, Microlearning Apps',
          order: 5,
        },
        {
          preferredSlug: 'data-analytics',
          industryDescription: 'Comprehensive learning analytics dashboards tracking student engagement, retention rates, and intervention triggers.',
          highlightTags: 'Learning Analytics, Retention Tracking, Early Alerts',
          order: 6,
        },
      ],
    },
    verticals: {
      heading: 'Education Verticals and Learning Sectors We Support',
      intro: 'Tailored technology solutions built for the specific curriculum models and regulatory standards across education.',
      items: [
        { title: 'Higher Education & Universities', description: 'Campus-wide portals, research collaboration tools, and registrar enrollment engines.', icon: 'GraduationCap' },
        { title: 'K-12 School Districts', description: 'Parent-teacher communication channels, district gradebooks, and digital curriculum delivery.', icon: 'School' },
        { title: 'Corporate Training & Upskilling', description: 'Enterprise employee onboarding platforms, regulatory training tracking, and skill assessments.', icon: 'Award' },
        { title: 'Language Learning Platforms', description: 'Interactive speech recognition engines, spaced repetition flashcards, and community practice hubs.', icon: 'BookOpen' },
        { title: 'STEM & Coding Academies', description: 'Interactive browser-based sandboxes, auto-graded code submissions, and hands-on lab environments.', icon: 'Code2' },
        { title: 'Academic Libraries & Archives', description: 'Digital asset management repositories, citation indexers, and open-access research catalogs.', icon: 'Library' },
        { title: 'Test Preparation Providers', description: 'Timed mock exam simulators, adaptive diagnostic tests, and personalized study pacing calendars.', icon: 'FileText' },
        { title: 'Vocational & Technical Training', description: 'Hands-on procedural guides, apprentice milestone tracking, and practical skill verification.', icon: 'Briefcase' },
      ],
    },
    techStack: {
      heading: 'Education Technology & Interoperability Stack',
      groups: [
        { group: 'Learning Standards & Formats', items: 'LTI v1.3\nSCORM 1.2 / 2004\nxAPI (Experience API)\nQTI (Question & Test Interoperability)\nOneRoster' },
        { group: 'Real-Time Streaming & Media', items: 'WebRTC\nLiveKit\nAWS Chime SDK\nHLS Video Streaming\nMux Video API' },
        { group: 'Application Frameworks', items: 'Next.js\nReact\nNode.js\nTypeScript\nGraphQL' },
        { group: 'Cloud & Database', items: 'PostgreSQL\nRedis\nAWS Fargate\nDocker\nElasticsearch' },
      ],
    },
    ctaBanner: {
      heading: "Let's Build Your Next-Generation Learning Platform",
      text: 'Partner with senior software engineers who understand educational pedagogy, high-concurrency architectures, and student data privacy.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'EdTech Software Development & Education Engineering | Metaphi',
      metaDescription: 'Custom EdTech software development services. We build scalable learning platforms, LMS integrations, and student analytics architectures.',
      keywords: 'EdTech software development, LMS engineering, learning management systems, student information systems, virtual classroom apps',
    },
  },

  // 2. FINANCE
  finance: {
    hero: {
      title: 'FinTech Software Engineering for Secure Financial Ecosystems',
      description: 'Building ultra-reliable banking architectures, payment gateways, automated wealth platforms, and regulatory reporting systems engineered for zero downtime.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'PCI DSS-aware',
        title: 'Payment Security Architecture',
        description: 'Engineering methodologies aligned with payment card industry security standards.',
      },
      {
        value: 'ISO 20022-ready',
        title: 'Financial Messaging Standards',
        description: 'Transactional messaging architectures aligned with international financial communication standards.',
      },
    ],
    challenges: {
      heading: 'Solving High-Stakes Technical Complexities in Finance',
      ctaLabel: 'Discuss Your FinTech Project',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Strict regulatory audit requirements demanding immutable transaction history and verifiable data lineage.',
          costToClient: 'Costly regulatory audits, punitive fines from regulatory oversight bodies, and brand erosion.',
          solutionLabel: 'Append-Only Audit Ledgers & Automated Audit Logging',
          preferredService: 'data-engineering',
        },
        {
          challenge: 'High payment transaction drop-offs caused by slow multi-step checkout verification and payment routing failures.',
          costToClient: 'Lost transaction revenues, merchant churn, and degraded customer lifetime value.',
          solutionLabel: 'Intelligent Payment Routing & Resilient Gateway Architecture',
          preferredService: 'software-development',
        },
        {
          challenge: 'Sophisticated fraud rings exploiting real-time payment rails before legacy batch checks trigger.',
          costToClient: 'Immediate capital losses from chargebacks, unrecoverable funds, and elevated risk flags.',
          solutionLabel: 'Real-Time Fraud Detection & Anomaly Screening Pipelines',
          preferredService: 'ml-development',
        },
        {
          challenge: 'Legacy core banking systems unable to expose modern REST or GraphQL APIs for partner fintech integration.',
          costToClient: 'Stalled product innovation, slow partner onboarding, and lost open-banking market share.',
          solutionLabel: 'Open Banking API Adapters & Cloud Middleware Layers',
          preferredService: 'cloud-engineering',
        },
      ],
    },
    caseStudies: [],
    solutions: {
      heading: 'Enterprise-Grade Engineering Solutions for Finance & Banking',
      intro: 'Fault-tolerant financial technology architectures engineered for high throughput, encryption, and institutional compliance.',
      categories: [
        {
          categoryName: 'Banking & Core Ledger Systems',
          items: [
            {
              title: 'Multi-Currency Core Banking Engines',
              description: 'Double-entry general ledger backends supporting high-concurrency fund transfers, account balances, and automated reconciliation.',
            },
            {
              title: 'Open Banking & PSD2 API Gateways',
              description: 'Secure API infrastructure enabling account information aggregation and payment initiation for licensed third parties.',
            },
            {
              title: 'Automated Loan Origination & Underwriting',
              description: 'Rule-driven credit scoring pipelines with document verification, risk tiering, and instant disbursement capabilities.',
            },
          ],
        },
        {
          categoryName: 'Payments & Wealth Management',
          items: [
            {
              title: 'Payment Gateway & Multi-Acquirer Routing',
              description: 'High-availability payment processing engines with automatic failover, smart retries, and tokenized card vaults.',
            },
            {
              title: 'Robo-Advisory & Portfolio Rebalancing Tools',
              description: 'Automated wealth management dashboards providing tax-loss harvesting, risk-profiled portfolios, and real-time market data.',
            },
            {
              title: 'Regulatory Capital & Liquidity Reporting',
              description: 'Automated reporting frameworks aggregating daily risk exposures, liquidity ratios, and regulatory filing packages.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for Financial Institutions',
      tabs: [
        {
          preferredSlug: 'software-development',
          industryDescription: 'High-throughput transactional software development, core ledger architectures, and secure payment processing services.',
          highlightTags: 'Core Banking, Ledgers, Payment Gateways, High Concurrency',
          order: 1,
        },
        {
          preferredSlug: 'ml-development',
          industryDescription: 'Real-time transaction anomaly detection, credit risk modeling, and automated identity verification pipelines.',
          highlightTags: 'Fraud Detection, Credit Scoring, Risk Modeling',
          order: 2,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'Zero-trust cloud infrastructure with hardware-backed encryption, multi-region redundancy, and disaster recovery.',
          highlightTags: 'Zero-Trust Architecture, Multi-Region, Encrypted Storage',
          order: 3,
        },
        {
          preferredSlug: 'qa-testing',
          industryDescription: 'Automated financial regression suites, concurrency race-condition testing, and security penetration assessments.',
          highlightTags: 'Ledger Reconciliation QA, Concurrency Testing, Security Audits',
          order: 4,
        },
        {
          preferredSlug: 'data-engineering',
          industryDescription: 'Streaming financial data pipelines for real-time ledger settlement, trade reconciliation, and regulatory audits.',
          highlightTags: 'Real-Time Streaming, Reconciliation, Audit Logging',
          order: 5,
        },
        {
          preferredSlug: 'mobile-app-development',
          industryDescription: 'Biometric-secured retail and commercial mobile banking applications for iOS and Android with instant payment notifications.',
          highlightTags: 'Mobile Banking, Biometric Auth, Real-Time Alerts',
          order: 6,
        },
      ],
    },
    verticals: {
      heading: 'Financial Sectors and Industry Verticals We Serve',
      intro: 'Specialized software engineering tailored to regulatory mandates and mission-critical workflows across financial services.',
      items: [
        { title: 'Retail & Commercial Banks', description: 'Core banking modernization, customer web portals, and automated account opening.', icon: 'Landmark' },
        { title: 'Payment Service Providers (PSPs)', description: 'Acquiring gateways, merchant settlement engines, and card processing routers.', icon: 'CreditCard' },
        { title: 'Wealth Management & Robo-Advisors', description: 'Automated asset allocation, portfolio rebalancing, and client portal interfaces.', icon: 'TrendingUp' },
        { title: 'Digital Wallets & Neobanks', description: 'Virtual cards, peer-to-peer transfers, and instant currency exchange backends.', icon: 'Wallet' },
        { title: 'Lending & Consumer Credit', description: 'Buy-now-pay-later (BNPL) integrations, credit decisioning, and loan servicing portals.', icon: 'Coins' },
        { title: 'InsurTech & Underwriting', description: 'Policy administration systems, automated claims processing, and actuarial data pipelines.', icon: 'Shield' },
        { title: 'B2B Corporate Treasury', description: 'Cash concentration dashboards, multi-bank liquidity views, and automated payroll rails.', icon: 'Building' },
        { title: 'Regulatory Alignment & RegTech', description: 'Automated AML screening, KYC identity verification, and suspicious activity reporting.', icon: 'Scale' },
      ],
    },
    techStack: {
      heading: 'Financial Technology & Security Architecture Stack',
      groups: [
        { group: 'Transaction Processing & Ledgers', items: 'TigerBeetle\nPostgreSQL (ACID Transactional)\nApache Kafka\nRedis Enterprise\nHashiCorp Vault' },
        { group: 'Financial Protocols & Standards', items: 'ISO 20022\nFIX Protocol\nOpen Banking APIs\nSEPA / ACH / FedNow\nSWIFT MT/MX' },
        { group: 'Backend & Resilience', items: 'Go\nJava / Spring Boot\nNode.js / TypeScript\nDocker & Kubernetes\nTerraform' },
        { group: 'Security & Verification', items: 'mTLS Authentication\nHSM Key Management\nAWS KMS\nOpenID Connect\nWAF & DDoS Protection' },
      ],
    },
    ctaBanner: {
      heading: 'Build Resilient, Standards-Aligned FinTech Platforms',
      text: 'Collaborate with engineering specialists experienced in transactional consistency, high-throughput architectures, and strict financial compliance.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'FinTech Software Development & Financial Engineering | Metaphi',
      metaDescription: 'Enterprise FinTech software development services. We build core banking systems, payment gateways, and automated wealth management platforms.',
      keywords: 'FinTech software development, banking software engineering, payment gateway development, ledger systems, financial technology consulting',
    },
  },

  // 3. FITNESS AND WELLNESS
  'fitness-and-wellness': {
    hero: {
      title: 'Fitness & Wellness Software Engineering for Connected Health',
      description: 'Developing high-engagement workout applications, wearable telemetry pipelines, gym management systems, and personalized wellness coaching platforms.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'BLE-ready',
        title: 'Wearable Sensor Connectivity',
        description: 'Robust Bluetooth Low Energy protocol integration for continuous biometrics ingestion.',
      },
      {
        value: 'Sub-second',
        title: 'Real-Time Telemetry Sync',
        description: 'Low-latency data pipelines processing heart rate zones, cadences, and session metrics.',
      },
    ],
    challenges: {
      heading: 'Solving Technical Barriers in Digital Fitness and Wellness',
      ctaLabel: 'Discuss Your Wellness App',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Unreliable Bluetooth pairing causing dropped telemetry during intense subscriber workouts.',
          costToClient: 'Member frustration, negative app store ratings, and canceled connected-device subscriptions.',
          solutionLabel: 'Fault-Tolerant BLE Synchronization & Local Buffer Caching',
          preferredService: 'mobile-app-development',
        },
        {
          challenge: 'High subscriber churn after initial sign-up due to generic, static workout recommendations.',
          costToClient: 'Declining monthly recurring revenue (MRR) and elevated member acquisition costs.',
          solutionLabel: 'Dynamic Personalization & Adaptive Recovery Scoring',
          preferredService: 'ai-agent-development',
        },
        {
          challenge: 'Gym booking systems failing under flash traffic when weekly popular class schedules release.',
          costToClient: 'Double-booked sessions, vocal member complaints at front desks, and staff admin load.',
          solutionLabel: 'High-Concurrency Reservation Queues & Atomic Scheduling',
          preferredService: 'software-development',
        },
        {
          challenge: 'Inconsistent biometric metric calculations across diverse smartwatch and fitness band ecosystems.',
          costToClient: 'Conflicting health data confusing users and eroding trust in personalized coaching programs.',
          solutionLabel: 'Standardized Sensor Telemetry Normalization Pipelines',
          preferredService: 'data-engineering',
        },
      ],
    },
    caseStudies: [],
    solutions: {
      heading: 'Connected Engineering Solutions for Modern Fitness Brands',
      intro: 'Scalable mobile, wearable, and operational architectures built for interactive fitness ecosystems and digital health brands.',
      categories: [
        {
          categoryName: 'Connected Fitness & Coaching',
          items: [
            {
              title: 'Interactive Workout Streaming Apps',
              description: 'Cross-platform mobile and TV applications delivering live video workouts with real-time biometric leaderboard overlays.',
            },
            {
              title: 'Adaptive Training Plan Engines',
              description: 'Algorithm-driven workout pacing that recalibrates intensity based on sleep quality, strain scores, and past performance.',
            },
            {
              title: 'Nutrition & Macro Tracking Portals',
              description: 'Visual meal logging tools with barcode scanning, custom macro targets, and hydration reminders.',
            },
          ],
        },
        {
          categoryName: 'Facility & Studio Management',
          items: [
            {
              title: 'Gym & Studio Membership Management',
              description: 'All-in-one studio management systems handling recurring billing, digital waivers, and turnstile access control.',
            },
            {
              title: 'Class Booking & Capacity Scheduling',
              description: 'Real-time studio mat and bike reservation engines with automated waitlist promotions and calendar sync.',
            },
            {
              title: 'Trainer Client Coaching Workspaces',
              description: 'Dedicated portals for personal trainers to assign custom exercise routines, review video form checks, and message clients.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for Fitness & Wellness Brands',
      tabs: [
        {
          preferredSlug: 'mobile-app-development',
          industryDescription: 'Native and cross-platform fitness apps with Apple HealthKit, Google Health Connect, and BLE wearable sensor integration.',
          highlightTags: 'HealthKit, Health Connect, BLE Sync, Offline Workouts',
          order: 1,
        },
        {
          preferredSlug: 'software-development',
          industryDescription: 'Scalable cloud backends for gym operations, high-concurrency class bookings, and automated recurring billing.',
          highlightTags: 'Gym Management, Booking Engines, Stripe Billing',
          order: 2,
        },
        {
          preferredSlug: 'data-engineering',
          industryDescription: 'High-volume sensor telemetry pipelines ingesting continuous heart rate, sleep stages, and movement cadences.',
          highlightTags: 'Biometric Pipelines, Sensor Streaming, Data Normalization',
          order: 3,
        },
        {
          preferredSlug: 'ai-agent-development',
          industryDescription: 'Intelligent fitness coaching bots delivering personalized workout modifications, recovery tips, and nutritional guidance.',
          highlightTags: 'AI Coach, Adaptive Pacing, Recovery Guidance',
          order: 4,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'Scalable cloud media streaming backends for on-demand workout video libraries and live trainer broadcasts.',
          highlightTags: 'Video On-Demand, Live Streaming, Cloud CDN',
          order: 5,
        },
        {
          preferredSlug: 'product-design-and-ux',
          industryDescription: 'High-energy, glanceable UI/UX designs optimized for mid-workout readability, motivational streaks, and social sharing.',
          highlightTags: 'Glanceable UI, Workout Dashboards, Habit Streaks',
          order: 6,
        },
      ],
    },
    verticals: {
      heading: 'Fitness and Wellness Sectors We Support',
      intro: 'Digital technology engineering tailored to the unique user journeys across connected wellness and physical training.',
      items: [
        { title: 'Boutique Studios & Gym Chains', description: 'Turnstile check-in kiosks, member booking apps, and recurring membership billing.', icon: 'Dumbbell' },
        { title: 'Wearable Fitness Hardware Brands', description: 'Companion mobile apps, firmware sync protocols, and continuous biometric analytics.', icon: 'HeartPulse' },
        { title: 'On-Demand Workout Streaming', description: 'Multi-screen streaming apps for connected smart screens, tablets, and phones.', icon: 'MonitorPlay' },
        { title: 'Nutrition & Meal Planning SaaS', description: 'Barcode food logging, macronutrient distribution calculations, and recipe catalogs.', icon: 'Apple' },
        { title: 'Recovery & Sleep Optimization', description: 'HRV trend analysis, sleep stage scoring algorithms, and guided recovery protocols.', icon: 'Flame' },
        { title: 'Personal Training Platforms', description: 'Trainer-to-client video review tools, exercise program builders, and payment collection.', icon: 'Users' },
        { title: 'Mindfulness & Mental Wellbeing', description: 'Guided audio meditation libraries, mood journaling, and habit tracking calendars.', icon: 'Brain' },
        { title: 'Corporate Wellness Programs', description: 'Company step challenges, ergonomic check-ins, and health incentive dashboards.', icon: 'Trophy' },
      ],
    },
    techStack: {
      heading: 'Connected Fitness & Health Telemetry Stack',
      groups: [
        { group: 'Mobile & Hardware Integration', items: 'React Native\nFlutter\nApple HealthKit API\nGoogle Health Connect API\nWeb Bluetooth / BLE Protocols' },
        { group: 'Streaming Video & Media', items: 'WebRTC\nAWS Elemental MediaLive\nHLS Video Packaging\nCloudflare Stream\nAgora Real-Time Video' },
        { group: 'Backend & Data Pipelines', items: 'Node.js\nGo\nPostgreSQL\nTimescaleDB (Time-Series Metrics)\nRedis' },
        { group: 'Cloud Infrastructure', items: 'AWS Fargate\nDocker\nAmazon CloudFront\nDatadog APM\nSentry Error Tracking' },
      ],
    },
    ctaBanner: {
      heading: 'Elevate Your Fitness Brand With High-Performance Engineering',
      text: 'Work with engineers who understand connected hardware telemetry, motivational UI/UX design, and resilient cloud backends.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'Fitness & Wellness Software Development Services | Metaphi',
      metaDescription: 'Custom fitness software development. We engineer connected workout apps, gym management portals, and wearable biometric telemetry pipelines.',
      keywords: 'fitness app development, gym software engineering, wearable integration, HealthKit development, wellness platform engineering',
    },
  },

  // 4. LOGISTICS
  logistics: {
    hero: {
      title: 'Logistics & Supply Chain Software Engineering for Global Freight',
      description: 'Building intelligent transportation management systems, automated warehouse orchestration, real-time freight tracking, and route optimization engines.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'Real-time',
        title: 'Fleet Telemetry Ingestion',
        description: 'Scalable MQTT and GPS streaming backends tracking assets across global transit corridors.',
      },
      {
        value: 'Multi-carrier',
        title: 'Electronic Data Interchange (EDI)',
        description: 'Automated 204, 214, and 210 EDI messaging pipelines integrating 3PLs and freight brokers.',
      },
    ],
    challenges: {
      heading: 'Resolving Operational Bottlenecks Across Modern Supply Chains',
      ctaLabel: 'Discuss Your Logistics Platform',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Blind spots in shipment milestones causing high customer support call volumes and delayed ETA notices.',
          costToClient: 'Detention fees, penalty charges for missed delivery windows, and lower shipper satisfaction.',
          solutionLabel: 'End-to-End Milestone Tracking & Automated Webhook Alerts',
          preferredService: 'software-development',
        },
        {
          challenge: 'Inefficient manual dispatch planning leading to empty backhauls and excessive fuel expenditures.',
          costToClient: 'Elevated fleet operating expenses and suppressed operating margins across delivery routes.',
          solutionLabel: 'Autonomous Dispatch Optimization & Multi-Stop Route Planning',
          preferredService: 'ai-agent-development',
        },
        {
          challenge: 'Warehouse inventory mismatches between physical pallets and digital warehouse records.',
          costToClient: 'Mispicks, shipping delays, emergency replenishment costs, and frustrated retail partners.',
          solutionLabel: 'Barcode & RFID Inventory Reconciliation Middleware',
          preferredService: 'data-engineering',
        },
        {
          challenge: 'Fragmented EDI messaging formats causing billing disputes and slow freight carrier payment settlement.',
          costToClient: 'Cash flow delays, administrative accounting overhead, and strained carrier partner relationships.',
          solutionLabel: 'Standardized EDI 204/214/210 Automation & Automated Invoicing',
          preferredService: 'erp-development',
        },
      ],
    },
    caseStudies: ['autonomous-agent-logistics'], // Genuinely matched existing case study!
    caseStudiesSection: {
      heading: 'Featured Logistics Engagements',
      intro: 'Case studies demonstrating autonomous fleet management, telemetry routing, and supply chain efficiency.',
      ctaLabel: 'View all logistics case studies',
    },
    solutions: {
      heading: 'Enterprise Engineering Solutions for Freight & Logistics',
      intro: 'Mission-critical software platforms designed for 24/7 visibility, dispatch precision, and supply chain automation.',
      categories: [
        {
          categoryName: 'Transportation & Fleet Management',
          items: [
            {
              title: 'Transportation Management Systems (TMS)',
              description: 'Unified freight rate calculation, automated carrier selection, load tendering, and electronic bills of lading (eBOL).',
            },
            {
              title: 'Dynamic Multi-Stop Route Optimization',
              description: 'Real-time vehicle routing software accounting for traffic density, vehicle weight limits, driver hours-of-service, and time windows.',
            },
            {
              title: 'Driver Companion Mobile Applications',
              description: 'Offline-capable mobile apps with turn-by-turn commercial navigation, digital proof-of-delivery (ePOD), and instant exception logging.',
            },
          ],
        },
        {
          categoryName: 'Warehousing & Cross-Docking',
          items: [
            {
              title: 'Warehouse Management System (WMS) Portals',
              description: 'Inbound receiving verification, automated pick-and-pack wave orchestration, and multi-bin location tracking.',
            },
            {
              title: 'Carrier EDI & API Integration Hubs',
              description: 'Standardized messaging brokers translating EDI X12, EDIFACT, and modern REST APIs for seamless partner handoffs.',
            },
            {
              title: 'Yard Management & Dock Appointment Scheduling',
              description: 'Visual yard maps tracking trailer spot locations, gate check-in automation, and dock door scheduling queues.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for Logistics Operations',
      tabs: [
        {
          preferredSlug: 'software-development',
          industryDescription: 'Custom TMS software development, carrier portal engineering, and freight tracking platforms built for enterprise scale.',
          highlightTags: 'Custom TMS, Freight Portals, Load Tendering, Real-Time Tracking',
          order: 1,
        },
        {
          preferredSlug: 'ai-agent-development',
          industryDescription: 'Autonomous dispatch agents, predictive ETA forecasting algorithms, and intelligent freight bid assistants.',
          highlightTags: 'Autonomous Dispatch, ETA Prediction, Dynamic Pricing',
          order: 2,
        },
        {
          preferredSlug: 'data-engineering',
          industryDescription: 'High-throughput telematics data pipelines processing GPS coordinates, cold-chain temperature sensors, and engine diagnostics.',
          highlightTags: 'Telematics Streaming, IoT Ingestion, Cold-Chain Monitoring',
          order: 3,
        },
        {
          preferredSlug: 'mobile-app-development',
          industryDescription: 'Durable driver applications supporting offline mode, barcode scanning, signature capture, and geofenced arrive/depart events.',
          highlightTags: 'Driver Mobile Apps, Proof of Delivery, Barcode Scanning',
          order: 4,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'High-availability cloud infrastructure designed to support continuous fleet tracking with multi-region failover.',
          highlightTags: 'High Availability, Zero Downtime, Fleet Telemetry Cloud',
          order: 5,
        },
        {
          preferredSlug: 'erp-development',
          industryDescription: 'Enterprise ERP and EDI integrations connecting supply chain management systems with accounting and procurement platforms.',
          highlightTags: 'EDI 204/214/210, ERP Integrations, Automated Freight Invoicing',
          order: 6,
        },
      ],
    },
    verticals: {
      heading: 'Logistics and Transportation Verticals We Support',
      intro: 'Specialized logistics software engineered for the operational needs of 3PLs, carriers, and freight forwarders.',
      items: [
        { title: 'Third-Party Logistics (3PL & 4PL)', description: 'Multi-client warehousing, consolidated freight billing, and dedicated client tracking portals.', icon: 'Boxes' },
        { title: 'Full Truckload & LTL Carriers', description: 'Asset utilization monitoring, driver scheduling, and electronic logging device (ELD) data sync.', icon: 'Truck' },
        { title: 'Freight Forwarders & Customs', description: 'Multimodal sea and air documentation, customs clearance workflows, and container tracking.', icon: 'Ship' },
        { title: 'Last-Mile & Parcel Delivery', description: 'High-density urban dispatch, customer SMS delivery alerts, and doorstep photo verification.', icon: 'Package' },
        { title: 'Air Cargo & Expedited Freight', description: 'Airport ramp milestone tracking, unit load device (ULD) tracking, and express flight manifests.', icon: 'Plane' },
        { title: 'Cold-Chain & Pharma Logistics', description: 'Continuous temperature sensor monitoring, excursion alerts, and strict regulatory transit logs.', icon: 'Activity' },
        { title: 'Warehousing & Distribution Hubs', description: 'Automated conveyor control interfaces, bin inventory allocation, and pick-path optimization.', icon: 'Warehouse' },
        { title: 'Intermodal Rail & Drayage', description: 'Port terminal gate appointment booking, railhead container tracking, and demurrage alerts.', icon: 'Navigation' },
      ],
    },
    techStack: {
      heading: 'Supply Chain & Telematics Engineering Stack',
      groups: [
        { group: 'IoT & Telemetry Ingestion', items: 'MQTT / CoAP Protocols\nAWS IoT Core\nApache Kafka\nTimescaleDB\nRabbitMQ' },
        { group: 'EDI & Supply Chain Messaging', items: 'EDI X12 (204, 214, 210, 856, 850)\nEDIFACT\nAS2 Communication\nStedi Platform\nRESTful Webhooks' },
        { group: 'Backend & Routing Algorithms', items: 'Go\nNode.js\nPython\nOR-Tools / VRP Solvers\nPostgreSQL / PostGIS (Spatial Data)' },
        { group: 'Cloud & Infrastructure', items: 'AWS ECS / EKS\nDocker\nAmazon ElastiCache\nMapbox GL / Google Maps Platform APIs\nHashiCorp Terraform' },
      ],
    },
    ctaBanner: {
      heading: 'Accelerate Your Supply Chain With Precision Software',
      text: 'Partner with engineers experienced in high-throughput fleet telemetry, EDI standards, and automated route optimization.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'Logistics Software Development & Supply Chain Engineering | Metaphi',
      metaDescription: 'Custom logistics software development services. We engineer modern TMS systems, automated route optimization, and real-time fleet telemetry backends.',
      keywords: 'logistics software development, TMS engineering, fleet telemetry, EDI integration, supply chain software consulting',
    },
  },

  // 5. MANUFACTURING
  manufacturing: {
    hero: {
      title: 'Smart Manufacturing Software Engineering for Industry 4.0',
      description: 'Developing manufacturing execution systems (MES), industrial IoT telemetry pipelines, predictive equipment maintenance, and factory floor digital twins.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'OPC UA-ready',
        title: 'Industrial Protocol Connectivity',
        description: 'Standardized factory floor machine telemetry ingestion across diverse PLC hardware.',
      },
      {
        value: 'Edge-capable',
        title: 'Local Floor Resilience',
        description: 'Edge-computing architectures ensuring shop floor continuity during network outages.',
      },
    ],
    challenges: {
      heading: 'Overcoming Core Operational Challenges in Modern Manufacturing',
      ctaLabel: 'Discuss Your Smart Factory Roadmap',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Unplanned machine breakdowns causing costly assembly line stoppages and missed production delivery quotas.',
          costToClient: 'Significant factory idle-time losses, expedited freight costs, and strained customer delivery contracts.',
          solutionLabel: 'Sensor-Driven Predictive Maintenance & Anomaly Detection',
          preferredService: 'ml-development',
        },
        {
          challenge: 'Isolated legacy PLCs and proprietary industrial machinery unable to share operational data with cloud analytics.',
          costToClient: 'Blind spots in factory throughput, inaccurate inventory accounting, and inability to calculate real OEE.',
          solutionLabel: 'Unified Industrial IoT Ingestion & OPC UA Edge Gateways',
          preferredService: 'data-engineering',
        },
        {
          challenge: 'Manual paper checklists on assembly lines causing quality defects to go undetected until final shipment audits.',
          costToClient: 'Costly product recalls, scrapped production batches, and damage to brand quality standing.',
          solutionLabel: 'Digital Inspection Workflows & Computer Vision Quality Verification',
          preferredService: 'software-development',
        },
        {
          challenge: 'Production schedulers struggling to re-optimize assembly runs when critical raw materials face delivery delays.',
          costToClient: 'Line changeover inefficiencies, bloated work-in-progress (WIP) inventories, and delayed order fulfillment.',
          solutionLabel: 'Dynamic Production Rescheduling & Material Allocation Engines',
          preferredService: 'ai-agent-development',
        },
      ],
    },
    caseStudies: [], // Skipping wind-farm-digital-twin to keep strictly clean and avoid domain mismatch
    solutions: {
      heading: 'Industrial-Grade Software Solutions for Manufacturing',
      intro: 'Robust shop-floor and enterprise manufacturing platforms built for uptime, operational visibility, and quality assurance.',
      categories: [
        {
          categoryName: 'Factory Floor Operations',
          items: [
            {
              title: 'Manufacturing Execution Systems (MES)',
              description: 'Real-time work order tracking, machine status monitoring, operator dispatch, and production batch recording.',
            },
            {
              title: 'Overall Equipment Effectiveness (OEE) Dashboards',
              description: 'Automated calculation of availability, performance, and quality metrics across individual workstations and entire plants.',
            },
            {
              title: 'Digital Quality Inspection Workbenches',
              description: 'Touch-friendly operator tablets for in-line dimensional checks, defect logging, and automated rejection gating.',
            },
          ],
        },
        {
          categoryName: 'Asset Intelligence & Plant Analytics',
          items: [
            {
              title: 'Predictive Equipment Health Models',
              description: 'Machine learning pipelines processing vibration, temperature, and motor current telemetry to flag bearing failure early.',
            },
            {
              title: 'Digital Twin Plant Visualization',
              description: 'Interactive 3D factory layout models displaying real-time machine run states, bottleneck zones, and throughput rates.',
            },
            {
              title: 'Industrial Supply Chain & ERP Integration',
              description: 'Automated bridges connecting shop-floor work completion events with corporate ERP and warehouse databases.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for Industrial Manufacturers',
      tabs: [
        {
          preferredSlug: 'software-development',
          industryDescription: 'Custom MES application development, operator touch interfaces, and shop-floor production management tools.',
          highlightTags: 'MES Development, Shop-Floor UI, OEE Tracking, Production Logging',
          order: 1,
        },
        {
          preferredSlug: 'ml-development',
          industryDescription: 'Predictive maintenance algorithms, vibration analysis models, and automated visual defect classification.',
          highlightTags: 'Predictive Maintenance, Defect Classification, Vibration Analysis',
          order: 2,
        },
        {
          preferredSlug: 'digital-twin-engineering',
          industryDescription: 'Virtual factory floor modeling, real-time sensor twin synchronization, and assembly line bottleneck simulation.',
          highlightTags: 'Digital Twins, 3D Factory Modeling, Line Simulation',
          order: 3,
        },
        {
          preferredSlug: 'data-engineering',
          industryDescription: 'High-frequency telemetry pipelines ingesting OPC UA, Modbus, and MQTT data streams from thousands of factory sensors.',
          highlightTags: 'OPC UA, Modbus, Time-Series Telemetry, Edge Gateways',
          order: 4,
        },
        {
          preferredSlug: 'ai-agent-development',
          industryDescription: 'Intelligent production scheduling agents and automated maintenance work order dispatch copilots.',
          highlightTags: 'Automated Scheduling, Maintenance Copilots, Work Order Dispatch',
          order: 5,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'Hybrid cloud and edge computing deployments ensuring local shop-floor execution continues without external internet.',
          highlightTags: 'Hybrid Cloud, Industrial Edge, Offline Resilience',
          order: 6,
        },
      ],
    },
    verticals: {
      heading: 'Manufacturing Sectors and Industrial Verticals We Serve',
      intro: 'Specialized software engineering tailored to discrete, continuous, and batch manufacturing operations.',
      items: [
        { title: 'Automotive & Heavy Equipment', description: 'Assembly line sequencing, sub-component traceability, and robotic cell monitoring.', icon: 'Cog' },
        { title: 'Aerospace & Defense Components', description: 'Strict AS9100 quality audit tracking, material certifications, and serialization logs.', icon: 'Plane' },
        { title: 'Electronics & Semiconductor Assembly', description: 'Cleanroom environmental telemetry, high-speed SMT verification, and chip yield analytics.', icon: 'Cpu' },
        { title: 'Consumer Packaged Goods (CPG)', description: 'High-speed packaging line monitoring, batch tracking, and automated labeling verification.', icon: 'Package' },
        { title: 'Food & Beverage Processing', description: 'HACCP audit logging, recipe batch orchestration, and cold-chain storage alerts.', icon: 'Factory' },
        { title: 'Industrial Machinery & Tooling', description: 'Connected OEM machinery, remote telematics dashboards, and aftermarket service portals.', icon: 'Wrench' },
        { title: 'Chemicals & Materials Production', description: 'Continuous reactor telemetry, pressure threshold safety monitors, and chemical batch logs.', icon: 'FlaskConical' },
        { title: 'Medical Device Manufacturing', description: 'Device history record (eDHR) automation, sterile batch logging, and strict FDA audit trails.', icon: 'Activity' },
      ],
    },
    techStack: {
      heading: 'Industry 4.0 & Industrial Automation Stack',
      groups: [
        { group: 'Industrial Protocols & Edge', items: 'OPC UA / OPC DA\nMQTT / Sparkplug B\nModbus TCP\nEdge Computing (AWS IoT Greengrass)\nNode-RED' },
        { group: 'Time-Series & Telemetry Storage', items: 'TimescaleDB\nInfluxDB\nApache Kafka\nPostgreSQL\nClickHouse' },
        { group: 'Application & Analytics Backends', items: 'Go\nPython (NumPy / SciPy)\nNode.js\nGraphQL\nDocker & Kubernetes' },
        { group: 'Front-End & Visualization', items: 'React\nTypeScript\nThree.js / WebGL (3D Twins)\nTailwind CSS\nGrafana Integration' },
      ],
    },
    ctaBanner: {
      heading: 'Modernize Your Factory Floor With Intelligent Software',
      text: 'Collaborate with engineers experienced in industrial protocols, edge resilience, and high-frequency sensor telemetry.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'Smart Manufacturing Software Engineering & Industry 4.0 | Metaphi',
      metaDescription: 'Custom manufacturing software development services. We engineer modern MES platforms, industrial IoT telemetry, and predictive maintenance solutions.',
      keywords: 'smart manufacturing software, MES engineering, industrial IoT, predictive maintenance, digital twins manufacturing',
    },
  },

  // 6. MEDIA
  media: {
    hero: {
      title: 'Digital Media & Streaming Software Engineering for High Concurrency',
      description: 'Architecting ultra-low latency video streaming, content distribution platforms, digital asset management, and dynamic monetization backends for modern creators and broadcasters.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'Multi-CDN',
        title: 'Global Video Delivery',
        description: 'Redundant content delivery networks with automated traffic routing for zero-buffering playback.',
      },
      {
        value: 'Sub-second',
        title: 'Live Stream Ingestion Latency',
        description: 'Optimized WebRTC and LL-HLS pipelines for interactive broadcast experiences.',
      },
    ],
    challenges: {
      heading: 'Overcoming Modern Technical Bottlenecks in Media and Entertainment',
      ctaLabel: 'Discuss Your Media Platform',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Buffering stalls and playback failures during high-profile live streaming events.',
          costToClient: 'Viewer outrage on social channels, subscriber cancellations, and ad impression losses.',
          solutionLabel: 'Multi-CDN Failover Routing & Low-Latency HLS Packaging',
          preferredService: 'cloud-engineering',
        },
        {
          challenge: 'Unorganized video and audio production assets scattered across unindexed local storage servers.',
          costToClient: 'Hours of wasted editor search time, duplicate shooting expenses, and delayed release schedules.',
          solutionLabel: 'Cloud Digital Asset Management (DAM) & Automated Metadata Tagging',
          preferredService: 'software-development',
        },
        {
          challenge: 'Ad blockers and client-side latency reducing monetization yields on premium video content.',
          costToClient: 'Diminishing ad revenues and degraded viewer experience caused by clunky client-side ad popups.',
          solutionLabel: 'Server-Side Ad Insertion (SSAI) & Targeted VAST/VMAP Stitching',
          preferredService: 'web-application-development',
        },
        {
          challenge: 'Content piracy and unauthorized credential sharing across video streaming subscriptions.',
          costToClient: 'Direct loss of subscription revenues and violation of studio distribution license agreements.',
          solutionLabel: 'Multi-DRM Protection & Concurrent Session Governance',
          preferredService: 'qa-testing',
        },
      ],
    },
    caseStudies: [],
    solutions: {
      heading: 'Streaming & Content Solutions for Digital Media Companies',
      intro: 'Resilient digital broadcast and publishing architectures built for global scale, zero buffering, and revenue maximization.',
      categories: [
        {
          categoryName: 'Video Streaming & Playback',
          items: [
            {
              title: 'Live & On-Demand Video Streaming Platforms',
              description: 'Custom video-on-demand (VOD) and live broadcast portals with adaptive bitrate streaming, subtitle tracks, and audio switching.',
            },
            {
              title: 'Server-Side Ad Insertion (SSAI) Engines',
              description: 'Seamless ad stitching into live and on-demand video feeds that bypasses ad blockers while preserving broadcast quality.',
            },
            {
              title: 'Multi-Screen Connected TV (CTV) Apps',
              description: 'Dedicated streaming apps for Roku, Apple TV, Android TV, and smart televisions with unified user profiles.',
            },
          ],
        },
        {
          categoryName: 'Publishing & Asset Management',
          items: [
            {
              title: 'Enterprise Digital Asset Management (DAM)',
              description: 'Centralized media storage with automated video transcoding, AI speech-to-text indexing, and rights tracking.',
            },
            {
              title: 'Headless Editorial CMS & Newsrooms',
              description: 'High-speed publishing workflows for newsrooms and media houses supporting rich visual layouts and instant CDN invalidation.',
            },
            {
              title: 'Audience Engagement & Live Chat Backends',
              description: 'Interactive real-time chat, audience polls, and creator tipping widgets supporting hundreds of thousands of concurrent viewers.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for Media & Entertainment',
      tabs: [
        {
          preferredSlug: 'software-development',
          industryDescription: 'Custom video portal engineering, digital asset management backends, and subscription management platforms.',
          highlightTags: 'Video Portals, DAM Platforms, Subscription Billing, Transcoding',
          order: 1,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'High-bandwidth multi-CDN architectures, video transcoding pipelines, and automated cloud edge caching.',
          highlightTags: 'Multi-CDN, Video Transcoding, Edge Caching, HLS/DASH',
          order: 2,
        },
        {
          preferredSlug: 'web-application-development',
          industryDescription: 'High-performance media web applications featuring custom video player controls, SSAI ad stitching, and DRM protection.',
          highlightTags: 'Custom Video Player, SSAI Ad Insertion, DRM, Shaka Player',
          order: 3,
        },
        {
          preferredSlug: 'mobile-app-development',
          industryDescription: 'Cross-platform mobile and tablet streaming apps with background audio playback, offline downloads, and push alerts.',
          highlightTags: 'Mobile Streaming, Offline Video Downloads, Background Audio',
          order: 4,
        },
        {
          preferredSlug: 'ai-agent-development',
          industryDescription: 'Automated video highlights extraction, intelligent closed-caption generation, and personalized content recommendation engines.',
          highlightTags: 'Automated Highlights, Speech-to-Text, Content Recommendations',
          order: 5,
        },
        {
          preferredSlug: 'data-analytics',
          industryDescription: 'Real-time viewer engagement analytics, quality-of-experience (QoE) tracking, and audience drop-off diagnostics.',
          highlightTags: 'QoE Analytics, Viewer Retention, Real-Time Dashboards',
          order: 6,
        },
      ],
    },
    verticals: {
      heading: 'Media Sectors and Broadcasting Verticals We Support',
      intro: 'Technology solutions engineered for the specific bandwidth, latency, and monetization requirements across media.',
      items: [
        { title: 'OTT Streaming Services', description: 'Subscription VOD portals, multi-tier paywalls, and cross-platform viewer profile synchronization.', icon: 'Tv' },
        { title: 'Live Sports & Event Broadcasters', description: 'Ultra-low latency live video feeds, real-time score overlays, and concurrent viewer scaling.', icon: 'Video' },
        { title: 'Digital News & Publishing Houses', description: 'High-traffic editorial web portals, paywalled journalism, and instant breaking news delivery.', icon: 'Newspaper' },
        { title: 'Podcast & Audio Networks', description: 'Dynamic audio ad insertion, RSS feed syndication, and mobile audio player applications.', icon: 'Headphones' },
        { title: 'Music Streaming & Distribution', description: 'Lossless audio streaming, artist royalty tracking dashboards, and algorithmic playlist generators.', icon: 'Music' },
        { title: 'Production Studios & Agencies', description: 'Internal review and approval tools, proxy video generation, and secure watermarked screeners.', icon: 'Film' },
        { title: 'Creator Economy & Fan Platforms', description: 'Direct-to-consumer creator subscriptions, live tipping interfaces, and community hubs.', icon: 'Camera' },
        { title: 'Radio & Audio Broadcast Networks', description: 'Automated digital broadcast simulcasting, station scheduling, and podcast archiving.', icon: 'Radio' },
      ],
    },
    techStack: {
      heading: 'Media Streaming & Content Delivery Stack',
      groups: [
        { group: 'Video Ingestion & Protocols', items: 'HLS / LL-HLS\nMPEG-DASH\nWebRTC\nRTMP / SRT Video Ingestion\nAWS Elemental MediaLive' },
        { group: 'DRM & Player Technologies', items: 'Widevine / FairPlay / PlayReady DRM\nVideo.js / Shaka Player / Hls.js\nServer-Side Ad Insertion (SSAI)\nVAST 4.x / VMAP Protocols' },
        { group: 'Application & Delivery', items: 'Next.js\nNode.js\nGo\nGraphQL\nRedis' },
        { group: 'Cloud CDN & Edge', items: 'Cloudflare / Fastly CDN\nAWS CloudFront\nAWS S3 / Wasabi Storage\nDocker & Kubernetes\nFFmpeg Transcoding Workers' },
      ],
    },
    ctaBanner: {
      heading: 'Build Scalable, Low-Latency Media Platforms With Us',
      text: 'Partner with engineers experienced in high-bandwidth video delivery, DRM security, and monetization architecture.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'Digital Media Software Development & Streaming Engineering | Metaphi',
      metaDescription: 'Custom media software development services. We engineer high-concurrency video streaming platforms, OTT applications, and digital asset management systems.',
      keywords: 'media software development, OTT platform engineering, video streaming software, digital asset management, SSAI development',
    },
  },

  // 7. REAL ESTATE
  'real-estate': {
    hero: {
      title: 'Real Estate Software Engineering for Modern Property Tech',
      description: 'Developing high-speed property listing portals, automated lease management, virtual 3D tour viewers, and broker workflow management platforms.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'RETS / RESO-ready',
        title: 'MLS Data Standardization',
        description: 'Automated RETS and RESO Web API synchronization across regional property listing databases.',
      },
      {
        value: 'Sub-second',
        title: 'Spatial Search & Mapping',
        description: 'High-speed geospatial bounding-box queries filtering hundreds of thousands of active listings.',
      },
    ],
    challenges: {
      heading: 'Overcoming Core Operational Challenges in PropTech',
      ctaLabel: 'Discuss Your PropTech Project',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Slow, stale property listing data causing buyers to inquire about already-sold or under-contract homes.',
          costToClient: 'Frustrated home seekers, wasted agent follow-up hours, and loss of competitive listing discovery traffic.',
          solutionLabel: 'Real-Time RESO Web API Ingestion & Automated Listing De-Duplication',
          preferredService: 'data-engineering',
        },
        {
          challenge: 'Clunky map search interfaces freezing when users pan across dense metropolitan areas with thousands of pins.',
          costToClient: 'High bounce rates on listing search portals and lost buyer lead generation opportunities.',
          solutionLabel: 'Vector Tile Geospatial Indexing & High-Speed Map Clustering',
          preferredService: 'software-development',
        },
        {
          challenge: 'Disjointed lease application processes requiring physical paperwork, manual credit checks, and email chains.',
          costToClient: 'Extended vacancy periods, slow leasing cycle turnaround, and lost rental income.',
          solutionLabel: 'End-to-End Digital Lease Signing & Automated Tenant Screening',
          preferredService: 'web-portal-development',
        },
        {
          challenge: 'Unqualified lead floods overwhelming property agents with low-intent inquiries.',
          costToClient: 'Agent time squandered on tire-kickers while high-value pre-approved buyers wait hours for a reply.',
          solutionLabel: 'AI Lead Qualification & Automated Showing Tour Schedulers',
          preferredService: 'ai-agent-development',
        },
      ],
    },
    caseStudies: [],
    solutions: {
      heading: 'Comprehensive Engineering Solutions for PropTech & Real Estate',
      intro: 'Scalable property portals, automated management systems, and geospatial tools built for modern real estate brokerages and REITs.',
      categories: [
        {
          categoryName: 'Property Discovery & Brokerage',
          items: [
            {
              title: 'Custom MLS & Brokerage Portals',
              description: 'Fast, consumer-facing property search websites featuring polygon map drawing, commute time calculators, and school ratings.',
            },
            {
              title: 'Automated Valuation Models (AVM)',
              description: 'Comparable-sales algorithms calculating accurate property value estimates based on historical transaction data and local market trends.',
            },
            {
              title: 'Interactive 3D Floor Plan & Virtual Tour Viewers',
              description: 'Embedded WebGL tour viewers allowing prospective buyers to explore spatial layouts and walk through properties remotely.',
            },
          ],
        },
        {
          categoryName: 'Property & Asset Management',
          items: [
            {
              title: 'Tenant & Landlord Management Portals',
              description: 'Digital leasing platforms supporting online rent collection, maintenance ticket tracking, and automated lease renewals.',
            },
            {
              title: 'Commercial Lease Abstraction & Accounting',
              description: 'Automated tools parsing complex commercial lease documents, indexing key dates, escalation clauses, and tenant obligations.',
            },
            {
              title: 'Construction & Capital Improvement Tracking',
              description: 'Milestone tracking dashboards for real estate developers monitoring contractor budgets, permits, and inspection sign-offs.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for PropTech Companies',
      tabs: [
        {
          preferredSlug: 'software-development',
          industryDescription: 'Full-stack property search portal engineering, custom CRM backends for agents, and automated valuation platforms.',
          highlightTags: 'Property Portals, MLS Search, Broker CRM, AVM Engines',
          order: 1,
        },
        {
          preferredSlug: 'web-portal-development',
          industryDescription: 'Responsive tenant, landlord, and investor portals with integrated payment gateways and document management.',
          highlightTags: 'Tenant Portals, Rent Payment, Lease Signing, Investor Dashboards',
          order: 2,
        },
        {
          preferredSlug: 'data-engineering',
          industryDescription: 'High-frequency MLS and public tax record ingestion pipelines standardizing fragmented regional real estate datasets.',
          highlightTags: 'RESO Web API, RETS Pipelines, Data Normalization, Tax Records',
          order: 3,
        },
        {
          preferredSlug: 'ai-agent-development',
          industryDescription: 'Automated buyer lead qualification copilots, instant inquiry responder bots, and automated showing schedulers.',
          highlightTags: 'Lead Qualification, Showing Scheduling, AI Buyer Assistant',
          order: 4,
        },
        {
          preferredSlug: 'mobile-app-development',
          industryDescription: 'Cross-platform mobile apps for property seekers and field agents with instant push alerts for newly listed homes.',
          highlightTags: 'Property Search App, Agent Mobile CRM, Instant Alerts',
          order: 5,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'Geographically distributed cloud infrastructure supporting high-speed spatial queries and high-resolution photo hosting.',
          highlightTags: 'Geospatial Cloud, High-Resolution Media, CDN Caching',
          order: 6,
        },
      ],
    },
    verticals: {
      heading: 'Real Estate Sectors and PropTech Verticals We Support',
      intro: 'Custom software engineering designed for the unique operational workflows across the real estate lifecycle.',
      items: [
        { title: 'Residential Brokerages & Franchises', description: 'Agent branding sites, team CRM tools, and centralized transaction management.', icon: 'Home' },
        { title: 'Commercial Real Estate (CRE)', description: 'Multi-tenant lease management, investor reporting, and square-footage stacking plans.', icon: 'Building2' },
        { title: 'Property Management Companies', description: 'Automated tenant rent collection, vendor work-order dispatch, and unit turnover checklists.', icon: 'Key' },
        { title: 'Real Estate Investment Trusts (REITs)', description: 'Portfolio yield analytics, asset acquisition pipeline trackers, and cap-rate calculators.', icon: 'Landmark' },
        { title: 'Short-Term Rental & Vacation Portals', description: 'Multi-channel calendar sync, dynamic night-rate pricing, and housekeeping dispatch.', icon: 'Store' },
        { title: 'Title & Escrow Technology', description: 'Secure digital escrow funding coordination, title document vaults, and closing trackers.', icon: 'FileText' },
        { title: 'Land Development & Construction', description: 'Zoning record lookups, lot parcel mapping, and capital project budget tracking.', icon: 'Compass' },
        { title: 'Co-Working & Flexible Office Spaces', description: 'Desk hot-booking apps, conference room scheduling displays, and member community directories.', icon: 'Users' },
      ],
    },
    techStack: {
      heading: 'PropTech & Geospatial Engineering Stack',
      groups: [
        { group: 'Geospatial & Search Engines', items: 'PostgreSQL / PostGIS (Geospatial Queries)\nElasticsearch (Faceted Property Search)\nMapbox GL JS / OpenStreetMap\nVector Tile Services (MVT)\nGoogle Places API' },
        { group: 'MLS & Data Standards', items: 'RESO Web API (Real Estate Standards Org)\nRETS Protocols\nSpark API / Bridge Interactive\nStripe (Rent Collection)\nDocuSign / HelloSign APIs' },
        { group: 'Application Frameworks', items: 'Next.js\nReact\nNode.js / TypeScript\nGraphQL\nRedis Caching' },
        { group: 'Cloud & Media Storage', items: 'AWS S3 (High-Res Listing Photos)\nCloudflare Image Optimization\nDocker & Kubernetes\nTerraform' },
      ],
    },
    ctaBanner: {
      heading: 'Transform Your Property Technology With Robust Engineering',
      text: 'Partner with engineers experienced in RESO data synchronization, geospatial clustering, and seamless digital leasing workflows.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'PropTech & Real Estate Software Development Services | Metaphi',
      metaDescription: 'Custom real estate software development services. We engineer modern MLS portals, property management platforms, and geospatial search applications.',
      keywords: 'PropTech software development, real estate web portals, MLS integration services, property management software, RESO Web API development',
    },
  },

  // 8. RETAIL AND ECOMMERCE
  'retail-and-ecommerce': {
    hero: {
      title: 'Retail & E-Commerce Software Engineering for High-Volume Commerce',
      description: 'Architecting scalable headless commerce storefronts, unified omnichannel inventory systems, automated checkout funnels, and real-time fulfillment pipelines.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'Sub-second',
        title: 'Cart & Checkout Response Latency',
        description: 'Optimized checkout microservices engineered for zero friction during peak sales events.',
      },
      {
        value: 'Omnichannel',
        title: 'Unified Inventory Architecture',
        description: 'Single-source-of-truth inventory coordination connecting physical stores and digital channels.',
      },
    ],
    challenges: {
      heading: 'Solving High-Volume Technical Pressures in Modern E-Commerce',
      ctaLabel: 'Discuss Your E-Commerce Roadmap',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Storefront slowdowns and checkout timeout crashes during Black Friday and flash promotional campaigns.',
          costToClient: 'Direct revenue abandonment, wasted paid marketing spend, and lasting consumer dissatisfaction.',
          solutionLabel: 'Headless Storefront Decoupling & Auto-Scaling Edge Caching',
          preferredService: 'cloud-engineering',
        },
        {
          challenge: 'Stock level discrepancies causing items to be sold online that are already out of stock on store shelves.',
          costToClient: 'Order cancellations, disappointed customers, customer support escalations, and refund fees.',
          solutionLabel: 'Real-Time Omnichannel Inventory Synchronization',
          preferredService: 'data-engineering',
        },
        {
          challenge: 'High cart abandonment rates due to rigid multi-page checkout flows and lacking local payment options.',
          costToClient: 'Depressed checkout conversion rates and inflated customer acquisition costs (CAC).',
          solutionLabel: 'One-Click Checkout Optimization & Multi-Gateway Integration',
          preferredService: 'software-development',
        },
        {
          challenge: 'Generic product catalog merchandising failing to showcase relevant items to individual shopping personas.',
          costToClient: 'Lower average order values (AOV) and missed cross-sell / upsell revenue opportunities.',
          solutionLabel: 'Dynamic Product Recommendation & Search Personalization',
          preferredService: 'ml-development',
        },
      ],
    },
    caseStudies: [],
    solutions: {
      heading: 'Scalable Commerce Solutions for Retailers & D2C Brands',
      intro: 'Modern headless commerce, order orchestration, and customer loyalty architectures designed for enterprise transaction volumes.',
      categories: [
        {
          categoryName: 'Headless Storefronts & Checkout',
          items: [
            {
              title: 'Headless Commerce Frontends',
              description: 'Ultra-fast Next.js commerce storefronts decoupled from monolithic backends, optimizing Core Web Vitals and SEO rankings.',
            },
            {
              title: 'Streamlined One-Click Checkout Engines',
              description: 'High-conversion checkout flows supporting Apple Pay, Google Pay, Buy-Now-Pay-Later (BNPL), and guest checkout.',
            },
            {
              title: 'Custom Product Customizers & Bundlers',
              description: 'Interactive visual configurators allowing shoppers to build custom product kits, personalize engravings, and preview variants.',
            },
          ],
        },
        {
          categoryName: 'Omnichannel Fulfillment & Operations',
          items: [
            {
              title: 'Omnichannel Order Management (OMS)',
              description: 'Intelligent order routing directing fulfillment to the nearest store location or warehouse for buy-online-pickup-in-store (BOPIS).',
            },
            {
              title: 'Loyalty Programs & Member Rewards Portals',
              description: 'Tiered reward point engines, referral tracking workflows, and exclusive member discount gating.',
            },
            {
              title: 'Multi-Marketplace Product Catalog Sync',
              description: 'Centralized product information management (PIM) syndicating listings and prices across Amazon, Walmart, and custom sites.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for Retail & E-Commerce',
      tabs: [
        {
          preferredSlug: 'software-development',
          industryDescription: 'Custom e-commerce backend engineering, checkout microservices, and unified product information systems.',
          highlightTags: 'Headless Commerce, Checkout Services, Custom PIM, High Volume',
          order: 1,
        },
        {
          preferredSlug: 'web-application-development',
          industryDescription: 'High-speed headless e-commerce storefronts built on Next.js with sub-second page loads and optimized mobile UX.',
          highlightTags: 'Next.js Storefronts, Core Web Vitals, Mobile Commerce, Cart UX',
          order: 2,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'Resilient cloud infrastructure with global edge caching designed to absorb massive traffic spikes during seasonal promotions.',
          highlightTags: 'Flash Sale Scaling, Edge Caching, Multi-Region Cloud',
          order: 3,
        },
        {
          preferredSlug: 'data-engineering',
          industryDescription: 'Real-time inventory coordination pipelines connecting warehouse management, physical store POS, and digital storefronts.',
          highlightTags: 'Omnichannel Sync, Real-Time Inventory, POS Integration',
          order: 4,
        },
        {
          preferredSlug: 'ml-development',
          industryDescription: 'Personalized product recommendation algorithms, dynamic price testing models, and customer churn prediction.',
          highlightTags: 'Product Recommendations, Dynamic Pricing, Churn Modeling',
          order: 5,
        },
        {
          preferredSlug: 'mobile-app-development',
          industryDescription: 'Brand mobile shopping applications featuring personalized push alerts, barcode in-store lookup, and instant re-ordering.',
          highlightTags: 'Mobile Shopping Apps, In-Store Barcode Lookup, Push Marketing',
          order: 6,
        },
      ],
    },
    verticals: {
      heading: 'Retail and E-Commerce Sectors We Support',
      intro: 'Specialized digital commerce engineering tailored to diverse catalog sizes, fulfillment models, and shopper journeys.',
      items: [
        { title: 'Direct-to-Consumer (D2C) Brands', description: 'Bespoke brand storytelling storefronts, subscription club boxes, and retention funnels.', icon: 'ShoppingBag' },
        { title: 'Omnichannel Department Retailers', description: 'Buy-online-pickup-in-store (BOPIS) flows, store stock lookups, and unified loyalty cards.', icon: 'Store' },
        { title: 'Multi-Vendor Marketplaces', description: 'Vendor onboarding portals, split-payout escrow processing, and marketplace commissions.', icon: 'ShoppingCart' },
        { title: 'Apparel & Fashion Commerce', description: 'Size recommendation widgets, visual lookbooks, and high-volume return authorization tools.', icon: 'Tag' },
        { title: 'Grocery & Perishable Goods', description: 'Time-slotted delivery booking, cold-pack fulfillment logic, and weighted produce pricing.', icon: 'Truck' },
        { title: 'B2B Wholesale Commerce', description: 'Tiered wholesale pricing, corporate credit limits, bulk quick-order pads, and RFQ workflows.', icon: 'Briefcase' },
        { title: 'Electronics & High-Tech Retail', description: 'Warranty plan additions, detailed spec comparison sheets, and serial number registration.', icon: 'Cpu' },
        { title: 'Health & Beauty Subscriptions', description: 'Recurring auto-ship replenishment intervals, sample selections, and routine builders.', icon: 'Sparkles' },
      ],
    },
    techStack: {
      heading: 'E-Commerce Architecture & Modern Commerce Stack',
      groups: [
        { group: 'Headless Commerce Platforms', items: 'Shopify Plus / Storefront API\ncommercetools\nMedusa.js\nStripe Checkout / Elements\nBigCommerce' },
        { group: 'Storefront & Performance', items: 'Next.js (App Router)\nReact\nTailwind CSS\nVercel Edge Network\nAlgolia / Meilisearch (Instant Search)' },
        { group: 'Backend & OMS Middleware', items: 'Node.js / TypeScript\nGo\nPostgreSQL\nRedis (Cart Session Storage)\nRabbitMQ' },
        { group: 'Inventory & Data Integration', items: 'Apache Kafka (Inventory Stream)\nGraphQL\nRESTful Webhooks\nAWS Fargate\nDatadog Real User Monitoring (RUM)' },
      ],
    },
    ctaBanner: {
      heading: 'Scale Your Digital Commerce Revenue With Modern Engineering',
      text: 'Partner with engineers experienced in high-concurrency storefronts, one-click checkouts, and real-time inventory synchronization.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'E-Commerce Software Development & Headless Commerce | Metaphi',
      metaDescription: 'Custom e-commerce software development services. We engineer fast headless storefronts, omnichannel inventory systems, and high-converting checkouts.',
      keywords: 'e-commerce software development, headless commerce engineering, Shopify Plus developers, custom checkout development, omnichannel inventory systems',
    },
  },

  // 9. SAAS
  saas: {
    hero: {
      title: 'B2B SaaS Software Engineering for Rapid Cloud Scale',
      description: 'Architecting robust multi-tenant cloud backends, self-service subscription billing, granular role-based access control (RBAC), and developer-first public APIs.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'Multi-tenant',
        title: 'Data Isolation Architecture',
        description: 'Secure tenant partitioning with row-level security and dedicated schema isolation options.',
      },
      {
        value: 'SOC 2-aware',
        title: 'Security & Audit Readiness',
        description: 'Engineering practices designed for continuous audit readiness, tamper-evident audit logs, and encryption.',
      },
    ],
    challenges: {
      heading: 'Overcoming Critical Architectural Hurdles in B2B SaaS',
      ctaLabel: 'Discuss Your SaaS Roadmap',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Data leakage risks between competing enterprise clients sharing the same multi-tenant database infrastructure.',
          costToClient: 'Catastrophic breach of client confidentiality, immediate contract terminations, and crippling legal exposure.',
          solutionLabel: 'Strict Row-Level Security (RLS) & Multi-Tenant Partitioning',
          preferredService: 'software-development',
        },
        {
          challenge: 'Heavy usage by large enterprise accounts causing noisy-neighbor slowdowns for smaller paying customers.',
          costToClient: 'SLA breach penalties, user churn, and widespread platform unreliability during peak business hours.',
          solutionLabel: 'Tenant-Aware Rate Limiting & Resource Quota Isolation',
          preferredService: 'cloud-engineering',
        },
        {
          challenge: 'Clunky enterprise sales cycles caused by lacking SAML/SSO authentication and SCIM directory synchronization.',
          costToClient: 'Months of stalled enterprise deal cycles and blocked procurement approvals.',
          solutionLabel: 'Turnkey Enterprise SAML SSO & Automated SCIM Provisioning',
          preferredService: 'saas-application-development',
        },
        {
          challenge: 'Complex subscription tier changes and seat-based billing leading to billing disputes and lost expansion revenue.',
          costToClient: 'Inaccurate invoice generation, manual accounting remediation, and customer frustration.',
          solutionLabel: 'Automated Usage-Based Metering & Prorated Stripe Invoicing',
          preferredService: null,
        },
      ],
    },
    caseStudies: [],
    solutions: {
      heading: 'Scalable Engineering Foundations for High-Growth SaaS',
      intro: 'Battle-tested software architectures designed for rapid enterprise onboarding, seamless monetization, and multi-tenant scale.',
      categories: [
        {
          categoryName: 'Multi-Tenancy & Enterprise Readiness',
          items: [
            {
              title: 'Multi-Tenant Architecture & Data Partitioning',
              description: 'Scalable database backends featuring PostgreSQL Row-Level Security (RLS), tenant routing middleware, and schema-per-tenant support.',
            },
            {
              title: 'Enterprise Single Sign-On (SAML / Okta)',
              description: 'Turnkey integration for corporate identity providers (IdPs) via SAML 2.0 and automated user provisioning via SCIM.',
            },
            {
              title: 'Comprehensive Audit Logs & Governance Trails',
              description: 'Immutable, tamper-evident user activity logs tracking every configuration change, data export, and permission grant.',
            },
          ],
        },
        {
          categoryName: 'Monetization & Developer Platform',
          items: [
            {
              title: 'Seat & Usage-Based Metered Billing',
              description: 'Flexible billing engines supporting flat recurring seats, tiered overages, automated usage metering, and invoice generation.',
            },
            {
              title: 'Developer Public APIs & Webhook Engines',
              description: 'Versioned REST and GraphQL developer APIs with automated rate limiting, API key rotation, and reliable webhook delivery.',
            },
            {
              title: 'Customizable Analytics & Reporting Workspaces',
              description: 'In-app interactive reporting dashboards enabling end users to filter, visualize, and schedule automated data exports.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for SaaS Providers',
      tabs: [
        {
          preferredSlug: 'saas-application-development',
          industryDescription: 'Full-cycle B2B SaaS application engineering, multi-tenant cloud backends, and self-service onboarding flows.',
          highlightTags: 'Multi-Tenant Architecture, Self-Service Onboarding, Enterprise SSO',
          order: 1,
        },
        {
          preferredSlug: 'software-development',
          industryDescription: 'Custom web application engineering, microservices decoupling, and high-performance database indexing.',
          highlightTags: 'PostgreSQL RLS, Tenant Isolation, Core Application Backends',
          order: 2,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'Kubernetes orchestration, automated CI/CD deployment pipelines, and zero-downtime database schema migrations.',
          highlightTags: 'Kubernetes Clusters, Zero-Downtime Deploys, Auto-Scaling',
          order: 3,
        },
        {
          preferredSlug: 'ai-agent-development',
          industryDescription: 'Embedded generative AI features, in-app workflow copilots, and intelligent user onboarding guidance.',
          highlightTags: 'In-App AI Copilots, Semantic Search, Workflow Automation',
          order: 4,
        },
        {
          preferredSlug: 'qa-testing',
          industryDescription: 'Automated multi-tenant isolation testing, API regression suites, and load testing simulating thousands of concurrent workspaces.',
          highlightTags: 'Tenant Isolation QA, Load Testing, Automated API Suites',
          order: 5,
        },
      ],
    },
    verticals: {
      heading: 'SaaS Sectors and Product Archetypes We Serve',
      intro: 'Specialized software engineering tailored across B2B horizontal and vertical SaaS models.',
      items: [
        { title: 'Productivity & Workflow SaaS', description: 'Collaborative task boards, document co-editing, and real-time team notification feeds.', icon: 'Workflow' },
        { title: 'Developer Tools & API Platforms', description: 'Developer documentation portals, CLI tooling, API key gateways, and SDK generation.', icon: 'Terminal' },
        { title: 'Security & Governance SaaS', description: 'Automated vulnerability scanning dashboards, policy attestation trackers, and audit logging.', icon: 'Shield' },
        { title: 'Analytics & Business Intelligence SaaS', description: 'Interactive data visualization widgets, embedded charting, and automated email digests.', icon: 'Brain' },
        { title: 'HR & People Operations Platforms', description: 'Employee onboarding checklists, time-off approval workflows, and payroll integration.', icon: 'Users' },
        { title: 'Finance & Invoicing SaaS', description: 'Automated accounts payable matching, expense categorization, and multi-currency ledgers.', icon: 'Receipt' },
        { title: 'Sales Engagement & CRM Tools', description: 'Pipeline opportunity stages, email sequence automation, and meeting scheduling widgets.', icon: 'Briefcase' },
        { title: 'Industry-Specific Vertical SaaS', description: 'Specialized operational systems built for trade contractors, law firms, and medical clinics.', icon: 'Layers' },
      ],
    },
    techStack: {
      heading: 'B2B SaaS & Cloud-Native Engineering Stack',
      groups: [
        { group: 'Application & Frameworks', items: 'Next.js (App Router)\nReact\nNode.js / TypeScript\nGo\nGraphQL' },
        { group: 'Database & Tenant Isolation', items: 'PostgreSQL (Row-Level Security)\nPrisma / Drizzle ORM\nRedis (Session & Caching)\nTimescaleDB\nElasticsearch' },
        { group: 'Auth & Billing Ecosystem', items: 'WorkOS / Auth0 (SAML SSO, SCIM)\nStripe Billing / Invoicing API\nSvix (Reliable Webhooks)\nResend / SendGrid (Transactional Email)' },
        { group: 'Cloud & Observability', items: 'AWS / GCP\nDocker & Kubernetes\nTerraform\nDatadog / Prometheus\nSentry Error Monitoring' },
      ],
    },
    ctaBanner: {
      heading: 'Build Scalable, Enterprise-Ready SaaS Platforms With Us',
      text: 'Partner with engineers experienced in multi-tenant data isolation, enterprise SSO, and reliable metered billing engines.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'B2B SaaS Software Development & Cloud Engineering | Metaphi',
      metaDescription: 'Enterprise B2B SaaS software development services. We engineer scalable multi-tenant backends, enterprise SAML SSO, and metered subscription billing.',
      keywords: 'SaaS software development, multi-tenant architecture, B2B SaaS engineering, enterprise SSO integration, cloud SaaS development',
    },
  },

  // 10. SPORTS AND GAMING
  'sports-and-gaming': {
    hero: {
      title: 'Sports & Gaming Software Engineering for Real-Time Experiences',
      description: 'Architecting ultra-low latency multiplayer backends, live sports score synchronization, esports tournament engines, and real-time community engagement platforms.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'Sub-100ms',
        title: 'Real-Time State Synchronization',
        description: 'Optimized WebSocket and UDP socket connections powering instant multiplayer updates.',
      },
      {
        value: 'Concurrent',
        title: 'Tournament Scaling Architecture',
        description: 'Elastic matchmaking clusters capable of scaling to hundreds of thousands of concurrent players.',
      },
    ],
    challenges: {
      heading: 'Overcoming High-Intensity Technical Pressures in Gaming and Sports',
      ctaLabel: 'Discuss Your Gaming Platform',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Network latency spikes causing synchronization lag and unfair match outcomes in competitive multiplayer lobbies.',
          costToClient: 'Player frustration, rage-quitting, negative game store reviews, and rapid community abandonment.',
          solutionLabel: 'Low-Latency WebSocket Clusters & Client-Side Prediction Engines',
          preferredService: 'software-development',
        },
        {
          challenge: 'Live sports scores and odds feeds lagging behind broadcast television and live stadium action.',
          costToClient: 'Arbitrage exploits, inaccurate user predictions, and lost credibility as a real-time data provider.',
          solutionLabel: 'Sub-Second Real-Time Telemetry & Event Broadcast Queues',
          preferredService: 'data-engineering',
        },
        {
          challenge: 'Tournament bracket management crashing under flash player registration right before esports competitions start.',
          costToClient: 'Delayed tournament starts, chaotic re-seeding, and compromised competitive integrity.',
          solutionLabel: 'Atomic Matchmaking & Dynamic Double-Elimination Bracket Logic',
          preferredService: 'web-application-development',
        },
        {
          challenge: 'Rampant cheating and bot farming ruining player economies and competitive rankings.',
          costToClient: 'Erosion of fair play, churn of legitimate players, and collapsed in-game virtual economy value.',
          solutionLabel: 'Server-Authoritative Game State Validation & Anti-Cheat Heuristics',
          preferredService: 'qa-testing',
        },
      ],
    },
    caseStudies: [],
    solutions: {
      heading: 'Real-Time Engineering Solutions for Sports & Interactive Gaming',
      intro: 'High-frequency multiplayer architectures, real-time data engines, and gamified community platforms built for scale.',
      categories: [
        {
          categoryName: 'Multiplayer & Tournament Systems',
          items: [
            {
              title: 'Multiplayer Matchmaking & Lobby Systems',
              description: 'Skill-based matchmaking (SBMM) engines with automated latency region routing, private team rooms, and queue management.',
            },
            {
              title: 'Automated Esports Tournament Platforms',
              description: 'Dynamic single and double-elimination bracket generators with automated score verification, match disputes, and prize payouts.',
            },
            {
              title: 'Server-Authoritative Game State Engines',
              description: 'Lightweight cloud backends enforcing physics checks, anti-speedhack verification, and atomic player inventory updates.',
            },
          ],
        },
        {
          categoryName: 'Live Sports Data & Fan Engagement',
          items: [
            {
              title: 'Live Score & Telemetry Feed Aggregation',
              description: 'Ultra-fast event ingestion pipelines processing official sports radar feeds, play-by-play updates, and team statistics.',
            },
            {
              title: 'Gamified Fan Engagement & Prediction Hubs',
              description: 'Interactive live match prediction widgets, fantasy league draft rooms, and instant leaderboard recalculations.',
            },
            {
              title: 'Digital Collectibles & Player Marketplace',
              description: 'Secure virtual item trading systems with item provenance tracking, trade escrows, and in-game economy balancing.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for Sports & Gaming Studios',
      tabs: [
        {
          preferredSlug: 'software-development',
          industryDescription: 'High-speed multiplayer server backends, game lobby microservices, and server-authoritative state logic.',
          highlightTags: 'Multiplayer Servers, WebSockets, Matchmaking, Game Lobbies',
          order: 1,
        },
        {
          preferredSlug: 'web-application-development',
          industryDescription: 'Responsive esports tournament web platforms, interactive brackets, and live fan engagement portals.',
          highlightTags: 'Tournament Portals, Live Brackets, WebGL Dashboards',
          order: 2,
        },
        {
          preferredSlug: 'data-engineering',
          industryDescription: 'Sub-second real-time streaming data pipelines for live sports match statistics, telemetry, and leaderboards.',
          highlightTags: 'Real-Time Telemetry, Live Sports Feeds, Leaderboards',
          order: 3,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'Elastic cloud gaming infrastructure featuring automated fleet scaling and edge server distribution.',
          highlightTags: 'Game Server Fleet Scaling, Low-Latency Edge, Multi-Region',
          order: 4,
        },
        {
          preferredSlug: 'qa-testing',
          industryDescription: 'Rigorous load testing simulating tens of thousands of concurrent players, packet loss resilience, and anti-cheat checks.',
          highlightTags: 'Concurrent Player Load Testing, Packet Loss QA, Anti-Cheat',
          order: 5,
        },
        {
          preferredSlug: 'mobile-app-development',
          industryDescription: 'Companion sports mobile apps featuring live score push alerts, fantasy lineup adjustments, and community forums.',
          highlightTags: 'Companion Apps, Real-Time Push, Fantasy Sports UI',
          order: 6,
        },
      ],
    },
    verticals: {
      heading: 'Gaming Sectors and Sports Verticals We Support',
      intro: 'Specialized software engineering tailored for game developers, sports leagues, and esports organizers.',
      items: [
        { title: 'Esports Tournament Organizers', description: 'Automated bracket management, player roster verification, and live broadcast match APIs.', icon: 'Trophy' },
        { title: 'Indie & Mid-Core Game Studios', description: 'Cross-platform backend-as-a-service (BaaS), cloud save states, and player matchmaking.', icon: 'Gamepad2' },
        { title: 'Fantasy Sports & Fan Prediction', description: 'Live draft rooms, custom point calculation engines, and real-time matchup leaderboards.', icon: 'Swords' },
        { title: 'Professional Sports Franchises', description: 'Official fan club mobile applications, mobile ticketing integration, and stadium wayfinding.', icon: 'Crown' },
        { title: 'Sports Telemetry & Performance Tech', description: 'Wearable athlete GPS speed analysis, biometric fatigue tracking, and tactical video tagging.', icon: 'Activity' },
        { title: 'Social & Casual Gaming Platforms', description: 'Turn-based puzzle multiplayer, social friend invites, and cross-platform casual boards.', icon: 'Dice5' },
        { title: 'Gaming Communities & Clan Hubs', description: 'Voice and text chat integration, clan recruitment boards, and community reputation scoring.', icon: 'Users' },
        { title: 'Virtual Economy & In-Game Stores', description: 'Secure microtransactions, battle-pass reward progression, and virtual item trading.', icon: 'Coins' },
      ],
    },
    techStack: {
      heading: 'Real-Time Gaming & Sports Architecture Stack',
      groups: [
        { group: 'Real-Time Networking & Sockets', items: 'WebSockets (Socket.io / ws)\nWebTransport / WebRTC Data Channels\nAgones (Kubernetes Game Server Orchestration)\nColyseus Multiplayer Framework\nRedis Pub/Sub' },
        { group: 'Application & State Engines', items: 'Node.js / TypeScript\nGo (High-Performance Server Routines)\nC# (.NET Core)\nPostgreSQL\nTimescaleDB' },
        { group: 'Sports Data & Feeds', items: 'Sportradar API\nOpta Sports Data\nLive Score Webhooks\nAWS AppSync (Managed GraphQL Subscriptions)' },
        { group: 'Cloud & Edge Infrastructure', items: 'AWS GameLift / Google Cloud\nDocker & Kubernetes\nCloudflare WebSockets Support\nDatadog Real-Time Monitoring' },
      ],
    },
    ctaBanner: {
      heading: 'Build Unstoppable Real-Time Gaming & Sports Platforms',
      text: 'Partner with engineers experienced in low-latency multiplayer protocols, live score synchronization, and scalable matchmaker design.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'Sports & Gaming Software Development Services | Metaphi',
      metaDescription: 'Custom sports and gaming software development services. We engineer multiplayer backends, live score data pipelines, and esports tournament platforms.',
      keywords: 'gaming software development, esports platform engineering, multiplayer game server development, sports tech software, live score data pipelines',
    },
  },

  // 11. TESTING AND CERTIFICATION
  'testing-and-certification': {
    hero: {
      title: 'Testing & Certification Software Engineering for Audit Integrity',
      description: 'Developing digital laboratory information management systems (LIMS), automated certification workflows, regulatory audit trails, and sample custody tracking platforms.',
      primaryCtaLabel: 'Talk to an Expert',
      primaryCtaLink: '/schedule-a-call',
    },
    stats: [
      {
        value: 'ISO 17025-aware',
        title: 'Laboratory Testing Standards',
        description: 'Engineering workflows aligned with general requirements for testing and calibration laboratories.',
      },
      {
        value: '21 CFR Part 11-aware',
        title: 'Electronic Records & Signatures',
        description: 'Tamper-evident audit logging and digital signature workflows aligned with regulatory requirements.',
      },
    ],
    challenges: {
      heading: 'Overcoming Core Quality and Regulatory Barriers in Testing',
      ctaLabel: 'Discuss Your LIMS Roadmap',
      ctaLink: '/schedule-a-call',
      rows: [
        {
          challenge: 'Manual transcription of instrument readouts onto paper test sheets causing typographical errors.',
          costToClient: 'Invalidated test runs, delayed certificate releases, and expensive re-testing procedures.',
          solutionLabel: 'Direct Instrument RS-232 / USB Telemetry Ingestion',
          preferredService: 'data-engineering',
        },
        {
          challenge: 'Gaps in physical sample chain-of-custody documentation failing regulatory audit reviews.',
          costToClient: 'Suspension of testing operating licenses and total loss of corporate client trust.',
          solutionLabel: 'Barcode & QR Sample Custody Verification Workflows',
          preferredService: 'software-development',
        },
        {
          challenge: 'Slow, multi-day manual peer-review cycles delaying final certificate of analysis (CoA) issuance.',
          costToClient: 'Client shipment delays, client dissatisfaction, and backlogged laboratory throughput.',
          solutionLabel: 'Automated Multi-Tier Approval Workflows & Digital PDF Stamping',
          preferredService: null,
        },
        {
          challenge: 'Clients bombarding laboratory phone lines inquiring about sample testing progress and completion dates.',
          costToClient: 'High lab technician administrative distraction and lower daily sample testing capacity.',
          solutionLabel: 'Self-Service Client Sample Tracking & Instant Certificate Downloads',
          preferredService: null,
        },
      ],
    },
    caseStudies: [],
    solutions: {
      heading: 'Laboratory Quality & LIMS Solutions for Testing Laboratories',
      intro: 'Digital LIMS, chain-of-custody tracking, and automated certification platforms engineered for regulatory alignment and audit readiness.',
      categories: [
        {
          categoryName: 'Laboratory Information & Sample Tracking',
          items: [
            {
              title: 'Laboratory Information Management Systems (LIMS)',
              description: 'Centralized sample intake, test method assignment, laboratory bench scheduling, and chemical reagent inventory tracking.',
            },
            {
              title: 'Digital Chain-of-Custody & Barcode Tracking',
              description: 'Barcode-driven tracking recording every handover, technician receipt, storage temperature, and bench testing timestamp.',
            },
            {
              title: 'Automated Instrument Data Capture (LIMS-to-Instrument)',
              description: 'Direct serial, network, and file ingestion from mass spectrometers, chromatographs, and environmental testing meters.',
            },
          ],
        },
        {
          categoryName: 'Certification & Quality Assurance',
          items: [
            {
              title: 'Automated Certificate of Analysis (CoA) Generation',
              description: 'Rule-based PDF certificate generation with automated pass/fail tolerance checks, digital cryptographic signatures, and QR verification.',
            },
            {
              title: 'Regulatory Audit Trail & Version Control',
              description: 'Immutable, tamper-evident audit logs capturing every result modification, technician approval, and test method revision.',
            },
            {
              title: 'Client Sample Submission & Reporting Portals',
              description: 'Secure self-service client portals where customers submit testing orders, print shipping labels, and download validated results.',
            },
          ],
        },
      ],
    },
    services: {
      heading: 'Core Engineering Capabilities for Certification Bodies',
      tabs: [
        {
          preferredSlug: 'software-development',
          industryDescription: 'Custom LIMS engineering, laboratory bench workflows, and automated certificate generation engines.',
          highlightTags: 'Custom LIMS, Sample Intake, Certificate Automation, Bench Workflows',
          order: 1,
        },
        {
          preferredSlug: 'data-engineering',
          industryDescription: 'Automated laboratory instrument data parsing pipelines, telemetry ingestion, and chemical inventory tracking.',
          highlightTags: 'Instrument Data Parsing, Telemetry Ingestion, Calibration Logs',
          order: 2,
        },
        {
          preferredSlug: 'qa-testing',
          industryDescription: 'Rigorous software validation for regulatory alignment, data integrity verification, and audit trail stress tests.',
          highlightTags: 'Regulatory Validation, Audit Trail Verification, Security QA',
          order: 3,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'Encrypted cloud storage archives ensuring long-term raw data preservation for regulatory audits.',
          highlightTags: 'Secure Archival, Data Encryption, Audit-Ready Cloud',
          order: 4,
        },
      ],
    },
    verticals: {
      heading: 'Testing and Certification Verticals We Support',
      intro: 'Specialized software engineering tailored across testing laboratories, inspection bodies, and certification authorities.',
      items: [
        { title: 'Environmental Testing Labs', description: 'Water quality assays, soil contamination monitoring, and EPA reporting alignment.', icon: 'FlaskConical' },
        { title: 'Food Safety & Agricultural Testing', description: 'Microbiological testing, pesticide residue screening, and nutritional breakdown analysis.', icon: 'CheckSquare' },
        { title: 'Materials & Metallurgy Testing', description: 'Tensile stress testing, corrosion rate logging, and alloy composition certificates.', icon: 'Sliders' },
        { title: 'Product Safety & Electrical Testing', description: 'UL/CE safety mark verification, electromagnetic compatibility (EMC), and flammability audits.', icon: 'Zap' },
        { title: 'Clinical & Toxicological Diagnostics', description: 'Chain-of-custody drug testing, biological sample analysis, and diagnostic reporting.', icon: 'Microscope' },
        { title: 'Construction & Concrete Testing', description: 'Compressive strength batch testing, soil compaction logging, and on-site field reports.', icon: 'Construction' },
        { title: 'Calibration & Metrology Labs', description: 'Equipment calibration schedules, measurement uncertainty calculations, and calibration stickers.', icon: 'Gauge' },
        { title: 'ISO & Standards Audit Bodies', description: 'Audit scheduling, non-conformance tracking (CARs), and official verification registries.', icon: 'FileCheck' },
      ],
    },
    techStack: {
      heading: 'LIMS & Quality Assurance Architecture Stack',
      groups: [
        { group: 'Instrument Ingestion & File Parsing', items: 'RS-232 / USB Serial Drivers\nNode.js Stream Parsers\nCSV / XML / ASTM Laboratory Protocols\nRESTful Webhooks\nMQTT' },
        { group: 'Certificate & Cryptographic Stamping', items: 'PDFKit / Puppeteer (High-Resolution PDF Rendering)\nPKI Digital Signatures (X.509 Certificates)\nQR Code Verification Tokens\nHashiCorp Vault' },
        { group: 'Database & Audit Preservation', items: 'PostgreSQL (Append-Only Audit Triggers)\nAWS S3 Object Lock (WORM Immutable Storage)\nRedis\nElasticsearch' },
        { group: 'Application & Frameworks', items: 'Next.js\nReact\nTypeScript\nDocker & Kubernetes\nTerraform' },
      ],
    },
    ctaBanner: {
      heading: 'Modernize Your Laboratory Workflows With Secure Software',
      text: 'Partner with engineers experienced in LIMS workflows, instrument data ingestion, and tamper-evident audit trails.',
      buttonLabel: 'Schedule an Introductory Call',
    },
    seo: {
      metaTitle: 'Testing & Certification Software Development | LIMS Engineering | Metaphi',
      metaDescription: 'Custom software development for testing and calibration laboratories. We engineer modern LIMS, digital chain-of-custody, and automated certificate generation.',
      keywords: 'LIMS software development, laboratory information management systems, testing lab software, certificate of analysis automation, ISO 17025 software',
    },
  },
};

// ─── RUNNER IMPLEMENTATION ───────────────────────────────────────────────────

async function run() {
  const isApply = process.argv.includes('--apply');
  const isDryRun = !isApply;

  console.log('========================================================================');
  console.log(`PHASE 3: SEEDING 11 INDUSTRIES VIA DOCUMENT SERVICE API`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (default, read-only)' : 'APPLY (writing to database)'}`);
  console.log('========================================================================\n');

  console.log('Bootstrapping Strapi instance...');
  const app = await createStrapi({ distDir: './dist' }).load();
  console.log('✓ Strapi bootstrapped successfully.\n');

  try {
    // 1. Fetch all existing Services for relation matching
    const allServices = await app.documents('api::service.service').findMany({
      status: 'draft',
      fields: ['id', 'documentId', 'slug', 'title'],
    });
    const serviceMap = new Map();
    for (const s of allServices) {
      serviceMap.set(s.slug, s);
    }
    console.log(`Loaded ${allServices.length} existing Services for relation matching.`);

    // 2. Fetch all existing Case Studies for relation matching
    const allCaseStudies = await app.documents('api::case-study.case-study').findMany({
      status: 'draft',
      fields: ['id', 'documentId', 'slug', 'title'],
    });
    const caseStudyMap = new Map();
    for (const cs of allCaseStudies) {
      caseStudyMap.set(cs.slug, cs);
    }
    console.log(`Loaded ${allCaseStudies.length} existing Case Studies for relation matching.\n`);

    // 3. Process each of the 11 industries
    const reportSummaries = [];

    for (const slug of TARGET_SLUGS) {
      const def = INDUSTRY_DATA[slug];
      if (!def) {
        throw new Error(`Missing content definition for industry: "${slug}"`);
      }

      console.log(`------------------------------------------------------------------------`);
      console.log(`PROCESSING: ${slug.toUpperCase()}`);
      console.log(`------------------------------------------------------------------------`);

      // Find industry by slug in Strapi
      const industryDoc = await app.documents('api::industry.industry').findFirst({
        filters: { slug },
      });

      if (!industryDoc) {
        throw new Error(`Industry with slug "${slug}" not found in database!`);
      }
      console.log(`Found industry: title="${industryDoc.title}", documentId=${industryDoc.documentId}`);

      // A. Match challenges
      const matchedChallenges = [];
      const challengesLog = [];
      for (const row of def.challenges.rows) {
        if (row.preferredService) {
          const matchedService = serviceMap.get(row.preferredService);
          if (matchedService) {
            matchedChallenges.push({
              challenge: row.challenge,
              costToClient: row.costToClient,
              solutionLabel: row.solutionLabel,
              linkedService: matchedService.documentId,
            });
            challengesLog.push(`${row.preferredService} (matched)`);
          } else {
            matchedChallenges.push({
              challenge: row.challenge,
              costToClient: row.costToClient,
              solutionLabel: row.solutionLabel,
              linkedService: null,
            });
            challengesLog.push(`${row.preferredService} (not found, unlinked)`);
          }
        } else {
          matchedChallenges.push({
            challenge: row.challenge,
            costToClient: row.costToClient,
            solutionLabel: row.solutionLabel,
            linkedService: null,
          });
          challengesLog.push('unlinked by design');
        }
      }

      // B. Match service tabs
      const matchedServiceTabs = [];
      const serviceTabsLog = [];
      for (const tab of def.services.tabs) {
        const matchedService = serviceMap.get(tab.preferredSlug);
        if (matchedService) {
          matchedServiceTabs.push({
            service: matchedService.documentId,
            industryDescription: tab.industryDescription,
            highlightTags: tab.highlightTags,
            order: tab.order,
          });
          serviceTabsLog.push(`${tab.preferredSlug} (matched)`);
        } else {
          console.warn(`  [WARN] Service "${tab.preferredSlug}" not found! Skipping tab.`);
          serviceTabsLog.push(`${tab.preferredSlug} (SKIPPED - not found)`);
        }
      }

      // C. Match case studies
      const matchedCaseStudyDocIds = [];
      const caseStudiesLog = [];
      for (const csSlug of def.caseStudies) {
        const cs = caseStudyMap.get(csSlug);
        if (cs) {
          matchedCaseStudyDocIds.push(cs.documentId);
          caseStudiesLog.push(`${csSlug} (${cs.documentId})`);
        } else {
          console.warn(`  [WARN] Case study "${csSlug}" not found!`);
        }
      }

      // Build complete payload
      const payload = {
        // CTA fields
        ctaLabel: def.hero.primaryCtaLabel || 'Book a consultation',
        ctaLink: def.hero.primaryCtaLink || '/schedule-a-call',
        // Reviewers: none for these 11
        reviewers: [],
        // Trust bar: empty
        trustBar: null,
        clientLogos: [],
        // Stats
        stats: def.stats || [],
        // Challenges
        challengesSection: {
          heading: def.challenges.heading,
          ctaLabel: def.challenges.ctaLabel,
          ctaLink: def.challenges.ctaLink,
          challenges: matchedChallenges,
        },
        // Case studies: only if matched
        caseStudiesSection: matchedCaseStudyDocIds.length > 0 ? def.caseStudiesSection : null,
        caseStudies: matchedCaseStudyDocIds,
        // Solutions
        solutionsSection: {
          heading: def.solutions.heading,
          intro: def.solutions.intro,
          categories: def.solutions.categories.map(cat => ({
            categoryName: cat.categoryName,
            items: cat.items.map(item => ({
              title: item.title,
              description: item.description,
              link: '/schedule-a-call',
            })),
          })),
        },
        // Services section
        servicesSection: {
          heading: def.services.heading,
          ctaLabel: 'Get a Scoped Estimate',
          ctaLink: '/schedule-a-call',
          services: matchedServiceTabs,
        },
        // Verticals section
        verticalsSection: {
          heading: def.verticals.heading,
          intro: def.verticals.intro,
          verticals: def.verticals.items.map(v => ({
            title: v.title,
            description: v.description,
            icon: v.icon,
          })),
        },
        // Tech stack
        techStackSection: {
          heading: def.techStack.heading,
          groups: def.techStack.groups.map(g => ({
            group: g.group,
            items: g.items,
          })),
        },
        // CTA banner
        ctaBanner: {
          heading: def.ctaBanner.heading,
          text: def.ctaBanner.text,
          buttonLabel: def.ctaBanner.buttonLabel,
          buttonLink: '/schedule-a-call',
          themeVariant: 'gradient',
        },
        // SEO
        seo: {
          metaTitle: def.seo.metaTitle,
          metaDescription: def.seo.metaDescription,
          keywords: def.seo.keywords,
        },
      };

      reportSummaries.push({
        slug,
        title: industryDoc.title,
        documentId: industryDoc.documentId,
        sections: {
          cta: `${payload.ctaLabel} -> ${payload.ctaLink}`,
          reviewers: 'Empty (0 linked - no fake reviews)',
          trustBar: 'Empty (0 logos - suppressed)',
          stats: `${payload.stats.length} item(s) (verifiable, non-numeric)`,
          challengesSection: `${matchedChallenges.length} rows (${challengesLog.join(', ')})`,
          caseStudiesSection: matchedCaseStudyDocIds.length > 0 ? `Filled (1 linked: ${caseStudiesLog.join(', ')})` : 'Empty (0 linked - hidden)',
          solutionsSection: `${payload.solutionsSection.categories.length} categories (${payload.solutionsSection.categories.reduce((acc, c) => acc + c.items.length, 0)} items)`,
          servicesSection: `${matchedServiceTabs.length} tabs (${serviceTabsLog.join(', ')})`,
          verticalsSection: `${payload.verticalsSection.verticals.length} cards (verified Lucide icons)`,
          techStackSection: `${payload.techStackSection.groups.length} tech groups`,
          ctaBanner: 'Filled (custom copy, gradient theme)',
          seo: 'Filled (metaTitle, metaDesc, keywords)',
        },
        matchedChallengesCount: matchedChallenges.length,
        matchedServiceTabsCount: matchedServiceTabs.length,
        matchedCaseStudiesCount: matchedCaseStudyDocIds.length,
      });

      if (isApply) {
        console.log(`Writing updates to [draft] ${slug} (${industryDoc.documentId})...`);
        await app.documents('api::industry.industry').update({
          documentId: industryDoc.documentId,
          status: 'draft',
          data: payload,
        });

        console.log(`Writing updates to [published] ${slug} (${industryDoc.documentId})...`);
        await app.documents('api::industry.industry').update({
          documentId: industryDoc.documentId,
          status: 'published',
          data: payload,
        });
        console.log(`✓ Updated [draft & published] for ${slug}`);
      } else {
        console.log(`[DRY-RUN] Staged payload for ${slug} (${matchedChallenges.length} challenges, ${matchedServiceTabs.length} tabs, ${matchedCaseStudyDocIds.length} case studies).`);
      }
    }

    console.log('\n========================================================================');
    console.log(`DRY-RUN SUMMARY: ALL 11 INDUSTRIES READY`);
    console.log('========================================================================\n');

    for (const r of reportSummaries) {
      console.log(`INDUSTRY: ${r.slug} ("${r.title}") [${r.documentId}]`);
      console.log(`  - CTA: ${r.sections.cta}`);
      console.log(`  - Reviewers: ${r.sections.reviewers}`);
      console.log(`  - Trust Bar: ${r.sections.trustBar}`);
      console.log(`  - Stats: ${r.sections.stats}`);
      console.log(`  - Challenges: ${r.sections.challengesSection}`);
      console.log(`  - Case Studies: ${r.sections.caseStudiesSection}`);
      console.log(`  - Solutions: ${r.sections.solutionsSection}`);
      console.log(`  - Services Tabs: ${r.sections.servicesSection}`);
      console.log(`  - Verticals: ${r.sections.verticalsSection}`);
      console.log(`  - Tech Stack: ${r.sections.techStackSection}`);
      console.log(`  - CTA Banner: ${r.sections.ctaBanner}`);
      console.log(`  - SEO: ${r.sections.seo}`);
      console.log('');
    }

    if (isDryRun) {
      console.log('------------------------------------------------------------------------');
      console.log('DRY-RUN COMPLETE. ZERO rows or fields were modified in the database.');
      console.log('Healthcare was NOT touched.');
      console.log('Awaiting user approval before applying changes.');
      console.log('To apply after approval: node scripts/seed-industries.cjs --apply');
      console.log('------------------------------------------------------------------------\n');
    } else {
      console.log('------------------------------------------------------------------------');
      console.log('APPLY COMPLETE. Successfully updated all 11 industries (draft & published).');
      console.log('------------------------------------------------------------------------\n');
    }

  } finally {
    try {
      await app.destroy();
    } catch {
      // Ignore Tarn connection pool abort during process exit
    }
  }
}

run().catch(err => {
  console.error('[FATAL ERROR]', err);
  process.exit(1);
});
