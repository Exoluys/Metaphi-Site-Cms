const fs = require('fs');
const path = require('path');

const targetPath = path.join(__dirname, 'seed-industries.cjs');
let code = fs.readFileSync(targetPath, 'utf8');

// 1. STAT REPLACEMENTS
// Finance: replace Sub-millisecond with ISO 20022-ready
code = code.replace(
  `      {
        value: 'Sub-millisecond',
        title: 'Transaction Latency Targets',
        description: 'High-throughput ledger engines and low-latency API gateway architectures.',
      },`,
  `      {
        value: 'ISO 20022-ready',
        title: 'Financial Messaging Standards',
        description: 'Transactional messaging architectures aligned with international financial communication standards.',
      },`
);

// Fitness: replace Sub-second with ANT+-ready
code = code.replace(
  `      {
        value: 'Sub-second',
        title: 'Real-Time Biometric Telemetry',
        description: 'Low-latency streaming ingestion pipelines for heart rate, cadence, and power sensor streams.',
      },`,
  `      {
        value: 'ANT+-ready',
        title: 'Sensor Protocol Integration',
        description: 'Standardized wireless sensor integrations for heart rate, cadence, and power telemetry.',
      },`
);

// Logistics: replace Real-time and Multi-carrier with EDI 214-ready and GS1-ready
code = code.replace(
  `      {
        value: 'Real-time',
        title: 'Fleet & Cargo Visibility',
        description: 'GPS and telematics event streams providing end-to-end milestone and location tracking.',
      },
      {
        value: 'Multi-carrier',
        title: 'Carrier Network Integration',
        description: 'Direct EDI and API integrations connecting parcel, LTL, and ocean freight logistics partners.',
      },`,
  `      {
        value: 'EDI 214-ready',
        title: 'Shipment Status Messaging',
        description: 'Standardized electronic data interchange for shipment status notifications and carrier telemetry.',
      },
      {
        value: 'GS1-ready',
        title: 'Supply Chain Barcode Standards',
        description: 'Barcode and RFID identification architectures aligned with global logistics standards.',
      },`
);

// Manufacturing: replace Edge-capable with ISA-95-aware
code = code.replace(
  `      {
        value: 'Edge-capable',
        title: 'Factory-Floor Edge Processing',
        description: 'Resilient edge compute gateways performing local inference even during cloud network partitions.',
      },`,
  `      {
        value: 'ISA-95-aware',
        title: 'Enterprise-Control Integration',
        description: 'Standardized information models bridging shop-floor SCADA with enterprise resource planning systems.',
      },`
);

// Media: replace Multi-CDN and Sub-second with HLS / DASH-ready and C2PA-aware
code = code.replace(
  `      {
        value: 'Multi-CDN',
        title: 'Content Delivery Architecture',
        description: 'Dynamic traffic switching between edge distribution networks preventing regional streaming outages.',
      },
      {
        value: 'Sub-second',
        title: 'Live Stream Glass-to-Glass Latency',
        description: 'Low-latency HLS and WebRTC ingestion architectures built for live interactive broadcasts.',
      },`,
  `      {
        value: 'HLS / DASH-ready',
        title: 'Adaptive Bitrate Streaming',
        description: 'Standardized video packaging and delivery architectures for seamless playback across devices.',
      },
      {
        value: 'C2PA-aware',
        title: 'Content Provenance & Authenticity',
        description: 'Cryptographic metadata tracking for media authenticity and copyright governance.',
      },`
);

// Real Estate: replace Sub-second with IDX-ready
code = code.replace(
  `      {
        value: 'Sub-second',
        title: 'Geospatial Listing Query Speeds',
        description: 'Indexed spatial search engines delivering map boundaries and polygon filtering without lag.',
      },`,
  `      {
        value: 'IDX-ready',
        title: 'Real Estate Data Exchange',
        description: 'Standardized MLS data synchronization architectures for search and property display.',
      },`
);

// Retail: replace Sub-second and Omnichannel with PCI DSS-aware and EDI 850-ready
code = code.replace(
  `      {
        value: 'Sub-second',
        title: 'Headless Checkout Performance',
        description: 'Optimized serverless edge runtimes delivering rapid cart and payment response times.',
      },
      {
        value: 'Omnichannel',
        title: 'Inventory & Order Synchronization',
        description: 'Real-time stock reservation bridging digital storefronts, marketplaces, and physical POS.',
      },`,
  `      {
        value: 'PCI DSS-aware',
        title: 'Payment Card Data Security',
        description: 'Secure checkout workflows aligned with standard payment protection frameworks.',
      },
      {
        value: 'EDI 850-ready',
        title: 'Purchase Order Interoperability',
        description: 'Standardized electronic order placement architectures bridging storefronts with vendor systems.',
      },`
);

// SaaS: replace Multi-tenant with SAML 2.0-ready
code = code.replace(
  `      {
        value: 'Multi-tenant',
        title: 'Enterprise Tenant Isolation',
        description: 'Partitioned database schemas and role-based policies keeping enterprise tenant data strictly segregated.',
      },`,
  `      {
        value: 'SAML 2.0-ready',
        title: 'Enterprise Identity Federation',
        description: 'Standardized single sign-on integrations connecting Okta, Azure AD, and enterprise identity providers.',
      },`
);

// Sports & Gaming: replace Sub-100ms and Concurrent with WebRTC-ready and OAuth 2.0-ready
code = code.replace(
  `      {
        value: 'Sub-100ms',
        title: 'Matchmaking & State Sync Speeds',
        description: 'Authoritative game server loops and socket clustering preventing player desync.',
      },
      {
        value: 'Concurrent',
        title: 'High-Concurrency Match Infrastructure',
        description: 'Distributed game session managers scaling dynamically to meet peak tournament demand.',
      },`,
  `      {
        value: 'WebRTC-ready',
        title: 'Low-Latency Streaming',
        description: 'Real-time peer-to-peer audio, video, and data communication protocols.',
      },
      {
        value: 'OAuth 2.0-ready',
        title: 'Player Identity & Authorization',
        description: 'Secure authentication and player profile federation across gaming ecosystems.',
      },`
);

// Testing & Certification: replace Chain-of-Custody with 21 CFR Part 11-aware
code = code.replace(
  `      {
        value: 'Chain-of-Custody',
        title: 'Tamper-Evident Audit Trails',
        description: 'Cryptographically verifiable sample tracking from collection to final certificate generation.',
      },`,
  `      {
        value: '21 CFR Part 11-aware',
        title: 'Electronic Records & Signatures',
        description: 'Tamper-evident audit logging and digital signature workflows aligned with regulatory requirements.',
      },`
);

// 2. REMOVE FORCED / WEAK SERVICE LINKS
// Finance: challenge 4 preferredService 'cloud-migration' -> 'cloud-engineering'
code = code.replace(
  `          challenge: 'Legacy core banking systems unable to expose modern REST or GraphQL APIs for partner fintech integration.',
          costToClient: 'Stalled product innovation, slow partner onboarding, and lost open-banking market share.',
          solutionLabel: 'Open Banking API Adapters & Cloud Middleware Layers',
          preferredService: 'cloud-migration',`,
  `          challenge: 'Legacy core banking systems unable to expose modern REST or GraphQL APIs for partner fintech integration.',
          costToClient: 'Stalled product innovation, slow partner onboarding, and lost open-banking market share.',
          solutionLabel: 'Open Banking API Adapters & Cloud Middleware Layers',
          preferredService: 'cloud-engineering',`
);

// SaaS: remove crm-development from challenge row 4
code = code.replace(
  `          challenge: 'High customer churn caused by difficult onboarding workflows and slow time-to-value.',
          costToClient: 'Lost ARR, depressed net revenue retention (NRR), and negative word-of-mouth.',
          solutionLabel: 'Interactive Product Tours & In-App Lifecycle Engagement',
          preferredService: 'crm-development',`,
  `          challenge: 'High customer churn caused by difficult onboarding workflows and slow time-to-value.',
          costToClient: 'Lost ARR, depressed net revenue retention (NRR), and negative word-of-mouth.',
          solutionLabel: 'Interactive Product Tours & In-App Lifecycle Engagement',
          preferredService: null,`
);

// SaaS: remove crm-development tab
code = code.replace(
  `        {
          preferredSlug: 'crm-development',
          industryDescription: 'Customer lifecycle automation, subscription provisioning, and revenue operations syncing with Stripe and Salesforce.',
          highlightTags: 'RevOps Pipelines, Billing Provisioning, Churn Telemetry',
          order: 6,
        },`,
  ''
);

// Testing & Certification: remove web-portal-development and crm-development from challenges (rows 3 and 4)
code = code.replace(
  `          challenge: 'Slow, multi-day manual peer-review cycles delaying final certificate of analysis (CoA) issuance.',
          costToClient: 'Client shipment delays, client dissatisfaction, and backlogged laboratory throughput.',
          solutionLabel: 'Automated Multi-Tier Approval Workflows & Digital PDF Stamping',
          preferredService: 'web-portal-development',`,
  `          challenge: 'Slow, multi-day manual peer-review cycles delaying final certificate of analysis (CoA) issuance.',
          costToClient: 'Client shipment delays, client dissatisfaction, and backlogged laboratory throughput.',
          solutionLabel: 'Automated Multi-Tier Approval Workflows & Digital PDF Stamping',
          preferredService: null,`
);

code = code.replace(
  `          challenge: 'Clients bombarding laboratory phone lines inquiring about sample testing progress and completion dates.',
          costToClient: 'High lab technician administrative distraction and lower daily sample testing capacity.',
          solutionLabel: 'Self-Service Client Sample Tracking & Instant Certificate Downloads',
          preferredService: 'crm-development',`,
  `          challenge: 'Clients bombarding laboratory phone lines inquiring about sample testing progress and completion dates.',
          costToClient: 'High lab technician administrative distraction and lower daily sample testing capacity.',
          solutionLabel: 'Self-Service Client Sample Tracking & Instant Certificate Downloads',
          preferredService: null,`
);

// Testing & Certification: remove web-portal-development and mobile-app-development tabs, reorder remaining 4 tabs
const oldTestTabs = `      tabs: [
        {
          preferredSlug: 'software-development',
          industryDescription: 'Custom LIMS engineering, laboratory bench workflows, and automated certificate generation engines.',
          highlightTags: 'Custom LIMS, Sample Intake, Certificate Automation, Bench Workflows',
          order: 1,
        },
        {
          preferredSlug: 'web-portal-development',
          industryDescription: 'Secure client testing portals, sample submission forms, and digital certificate verification viewers.',
          highlightTags: 'Client Portals, Certificate Downloads, QR Verification, Order Forms',
          order: 2,
        },
        {
          preferredSlug: 'data-engineering',
          industryDescription: 'Automated laboratory instrument data parsing pipelines, telemetry ingestion, and chemical inventory tracking.',
          highlightTags: 'Instrument Data Parsing, Telemetry Ingestion, Calibration Logs',
          order: 3,
        },
        {
          preferredSlug: 'qa-testing',
          industryDescription: 'Rigorous software validation for regulatory compliance, data integrity verification, and audit trail stress tests.',
          highlightTags: 'Regulatory Validation, Audit Trail Verification, Security QA',
          order: 4,
        },
        {
          preferredSlug: 'mobile-app-development',
          industryDescription: 'Field sample collection mobile apps with GPS geotagging, photo evidence capture, barcode scanning, and offline sync.',
          highlightTags: 'Field Sampling Apps, Geotagging, Barcode Scanning, Offline Mode',
          order: 5,
        },
        {
          preferredSlug: 'cloud-engineering',
          industryDescription: 'Encrypted, compliant cloud storage archives ensuring long-term raw data preservation for accreditation audits.',
          highlightTags: 'Compliant Archival, Data Encryption, Audit-Ready Cloud',
          order: 6,
        },
      ],`;

const newTestTabs = `      tabs: [
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
      ],`;

code = code.replace(oldTestTabs, newTestTabs);

// 3. CLEAN FORBIDDEN WORDS: certified, compliant, guaranteed, accredited
code = code.replace(/Accreditation & Compliance Reporting Dashboards/g, 'Standards & Regulatory Reporting Dashboards');
code = code.replace(/compliance standards/g, 'regulatory standards');
code = code.replace(/compliance certification tracking/g, 'regulatory training tracking');
code = code.replace(/compliance audits/g, 'regulatory audits');
code = code.replace(/Automated Compliance Logging/g, 'Automated Audit Logging');
code = code.replace(/regulatory compliance/g, 'regulatory alignment');
code = code.replace(/Regulatory Compliance & RegTech/g, 'Regulatory Alignment & RegTech');
code = code.replace(/PostgreSQL \(ACID-compliant\)/g, 'PostgreSQL (ACID Transactional)');
code = code.replace(/Build Resilient, Compliant FinTech Platforms With Confidence/g, 'Build Resilient, Standards-Aligned FinTech Platforms');
code = code.replace(/HACCP compliance logging/g, 'HACCP audit logging');
code = code.replace(/continuous compliance/g, 'continuous audit readiness');
code = code.replace(/Comprehensive Audit Logs & Compliance Trails/g, 'Comprehensive Audit Logs & Governance Trails');
code = code.replace(/Security & Compliance SaaS/g, 'Security & Governance SaaS');
code = code.replace(/regulatory accreditation audits/g, 'regulatory audit reviews');
code = code.replace(/testing accreditation licenses/g, 'testing operating licenses');
code = code.replace(/Accreditation & Quality Solutions/g, 'Laboratory Quality & LIMS Solutions');
code = code.replace(/regulatory compliance and audit readiness/g, 'regulatory alignment and audit readiness');
code = code.replace(/download certified results/g, 'download validated results');
code = code.replace(/Encrypted, compliant cloud storage archives/g, 'Encrypted cloud storage archives');
code = code.replace(/accreditation audits/g, 'regulatory audits');
code = code.replace(/Compliant Archival/g, 'Secure Archival');
code = code.replace(/EPA reporting compliance/g, 'EPA reporting alignment');
code = code.replace(/ISO & Compliance Certification Bodies/g, 'ISO & Standards Audit Bodies');
code = code.replace(/official accreditation registries/g, 'official verification registries');
code = code.replace(/Quality Compliance Architecture/g, 'Quality Assurance Architecture');

fs.writeFileSync(targetPath, code, 'utf8');
console.log('Successfully patched seed-industries.cjs!');
