/**
 * seed-healthcare.cjs
 *
 * Seeds Healthcare industry with professional generic placeholder content for testing.
 * Uses Strapi v5 Document Service API.
 * Writes to both draft and published states.
 * Idempotent: re-runs overwrite/set cleanly without duplicate components.
 *
 * Safety:
 * - Default: --dry-run
 * - Write only when --apply flag is provided.
 */

const { createStrapi } = require('@strapi/strapi');

const isApply = process.argv.includes('--apply');
const isDryRun = !isApply;

// Helper: Formats today's date as YYYY-MM-DD
function getTodayDate() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

async function main() {
  console.log('================================================================');
  console.log(`PHASE 2: HEALTHCARE CONTENT SEEDING (${isDryRun ? 'DRY-RUN MODE' : '*** APPLY MODE ***'})`);
  console.log('================================================================\n');

  console.log('Bootstrapping Strapi instance...');
  const app = await createStrapi({ distDir: './dist' }).load();
  console.log('✓ Strapi bootstrapped successfully.\n');

  try {
    // 1. Fetch Healthcare industry
    const healthcareDraft = await app.documents('api::industry.industry').findFirst({
      filters: { slug: 'healthcare' },
      status: 'draft',
      populate: '*',
    });

    if (!healthcareDraft) {
      throw new Error('Healthcare industry entry not found in Strapi!');
    }

    console.log(`Found Healthcare industry: documentId=${healthcareDraft.documentId}, id=${healthcareDraft.id}`);

    // 2. Fetch all existing Services for linking
    const allServices = await app.documents('api::service.service').findMany({
      status: 'draft',
      fields: ['id', 'documentId', 'slug', 'title'],
    });
    const serviceMap = new Map();
    for (const s of allServices) {
      serviceMap.set(s.slug, s);
    }
    console.log(`Loaded ${allServices.length} existing Services for relation matching.`);

    // 3. Fetch all existing Case Studies for linking
    const allCaseStudies = await app.documents('api::case-study.case-study').findMany({
      status: 'draft',
      fields: ['id', 'documentId', 'slug', 'title', 'tags'],
      populate: ['industries'],
    });
    console.log(`Loaded ${allCaseStudies.length} existing Case Studies for relation matching.\n`);

    // 4. Match Services for 6 Challenge Rows
    console.log('--- 1. MATCHING SERVICES FOR CHALLENGES (6 Rows) ---');
    const challengeRowDefinitions = [
      {
        topic: 'disconnected patient data',
        challenge: 'Fragmented patient records across incompatible clinical systems and legacy data silos.',
        costToClient: 'Diagnostic delays and clinical handoff errors, leading to duplicate testing and provider workflow friction.',
        solutionLabel: 'Standardized Interoperability & FHIR Pipelines',
        preferredSlug: 'data-engineering',
      },
      {
        topic: 'clinician admin burden',
        challenge: 'High administrative burden and manual charting draining valuable clinician attention.',
        costToClient: 'Accelerated physician burnout, higher medical staff turnover, and reduced direct patient engagement.',
        solutionLabel: 'Clinical Workflow Automation & Intelligent Copilots',
        preferredSlug: 'ai-agent-development',
      },
      {
        topic: 'legacy infrastructure',
        challenge: 'Outdated on-premises servers and legacy technical debt hindering digital health adoption.',
        costToClient: 'Slow software iteration cycles, high operational maintenance overhead, and vulnerability during traffic spikes.',
        solutionLabel: 'Cloud Modernization & Scalable Architecture',
        preferredSlug: 'cloud-migration',
      },
      {
        topic: 'compliance and security risk',
        challenge: 'Strict regulatory compliance mandates and sensitive health data exposure risks.',
        costToClient: 'Potential regulatory penalties, audit non-compliance, and severe loss of institutional patient trust.',
        solutionLabel: 'Zero-Trust Security & Rigorous Compliance Standards',
        preferredSlug: null, // Left unlinked per user request (no genuine service covers compliance/security alone)
      },
      {
        topic: 'limited access to care',
        challenge: 'Geographic and scheduling barriers preventing timely patient access to specialized clinical care.',
        costToClient: 'Care deferral, missed early intervention opportunities, and lower patient retention rates.',
        solutionLabel: 'Virtual Care & Cross-Platform Mobile Telehealth',
        preferredSlug: 'mobile-app-development',
      },
      {
        topic: 'downtime in critical systems',
        challenge: 'Service interruptions and performance bottlenecks in critical round-the-clock clinical software.',
        costToClient: 'Halted admissions, delayed medication updates, and acute operational paralysis in care facilities.',
        solutionLabel: 'Continuous Delivery & High-Availability Infrastructure',
        preferredSlug: 'devops-and-kubernetes',
      },
    ];

    const matchedChallenges = [];
    for (const def of challengeRowDefinitions) {
      if (def.preferredSlug) {
        const match = serviceMap.get(def.preferredSlug);
        if (match) {
          console.log(`  ✓ [MATCH] "${def.topic}" -> ${match.title} (${match.slug}, ${match.documentId})`);
          matchedChallenges.push({
            challenge: def.challenge,
            costToClient: def.costToClient,
            solutionLabel: def.solutionLabel,
            linkedService: match.documentId,
          });
        } else {
          console.log(`  ○ [UNLINKED] No match found for "${def.topic}" (preferred: ${def.preferredSlug})`);
          matchedChallenges.push({
            challenge: def.challenge,
            costToClient: def.costToClient,
            solutionLabel: def.solutionLabel,
            linkedService: null,
          });
        }
      } else {
        console.log(`  ○ [UNLINKED BY DESIGN] "${def.topic}" (leaving without service link)`);
        matchedChallenges.push({
          challenge: def.challenge,
          costToClient: def.costToClient,
          solutionLabel: def.solutionLabel,
          linkedService: null,
        });
      }
    }

    // 5. Match Services for 8 Service Tabs
    console.log('\n--- 2. MATCHING SERVICES FOR SERVICES SECTION (Up to 8 Tabs) ---');
    const serviceTabDefinitions = [
      {
        role: 'software development',
        preferredSlug: 'software-development',
        industryDescription: 'Custom clinical application engineering, doctor-facing portals, and medical web platforms designed for high reliability and clean clinical UX.',
        highlightTags: 'Custom Software, Clinical Portals, Web Applications, Responsive UX',
        order: 1,
      },
      {
        role: 'consulting / transformation',
        preferredSlug: 'digital-transformation',
        industryDescription: 'Strategic healthtech advisory helping health systems modernize legacy software, reduce technical debt, and plan sustainable platform roadmaps.',
        highlightTags: 'Healthtech Advisory, Modernization Strategy, Architecture Planning',
        order: 2,
      },
      {
        role: 'AI / Machine Learning',
        preferredSlug: 'generative-ai-development',
        industryDescription: 'Specialized clinical intelligence solutions, ambient documentation models, and predictive risk stratification pipelines adhering to medical guidance.',
        highlightTags: 'Clinical AI, Ambient Documentation, Predictive Models',
        order: 3,
      },
      {
        role: 'mobile applications',
        preferredSlug: 'mobile-app-development',
        industryDescription: 'HIPAA-conscious iOS and Android applications for patient engagement, remote care monitoring, medication adherence, and caregiver communications.',
        highlightTags: 'Patient Portals, Caregiver Apps, Cross-Platform Mobile',
        order: 4,
      },
      {
        role: 'cloud / infrastructure',
        preferredSlug: 'cloud-engineering',
        industryDescription: 'Resilient cloud landing zones with encrypted health data storage, high availability configurations, and automated compliance policies.',
        highlightTags: 'Secure Cloud, Scalability, High Availability, Encrypted Storage',
        order: 5,
      },
      {
        role: 'testing / QA',
        preferredSlug: 'qa-testing',
        industryDescription: 'End-to-end automated testing, load testing for high-concurrency patient traffic, and rigorous security verification for critical care pathways.',
        highlightTags: 'Automated QA, Concurrency Testing, Security Audits',
        order: 6,
      },
      {
        role: 'integration / data pipelines',
        preferredSlug: 'data-engineering',
        industryDescription: 'Scalable data ingestion pipelines supporting HL7 v2, FHIR R4, and secure interoperability between legacy hospital systems and modern apps.',
        highlightTags: 'FHIR Pipelines, HL7 Standards, Data Integration, Interoperability',
        order: 7,
      },
    ];

    const matchedServiceTabs = [];
    for (const def of serviceTabDefinitions) {
      const match = serviceMap.get(def.preferredSlug);
      if (match) {
        console.log(`  ✓ [MATCH] "${def.role}" -> ${match.title} (${match.slug}, ${match.documentId})`);
        matchedServiceTabs.push({
          service: match.documentId,
          industryDescription: def.industryDescription,
          highlightTags: def.highlightTags,
          order: def.order,
        });
      } else {
        console.log(`  ✗ [SKIPPED] No match found for "${def.role}" (preferred: ${def.preferredSlug})`);
      }
    }

    // 6. Match Case Studies (Max 6 related to healthcare, medical, clinical, wellness or fitness)
    console.log('\n--- 3. MATCHING CASE STUDIES ---');
    const matchedCaseStudyDocIds = [];
    const matchedCaseStudiesLog = [];
    const skippedCaseStudiesLog = [];

    const healthKeywords = ['health', 'medical', 'clinic', 'wellness', 'fitness', 'doctor', 'patient', 'scan', 'diagnostic'];

    for (const cs of allCaseStudies) {
      const titleLower = (cs.title || '').toLowerCase();
      const slugLower = (cs.slug || '').toLowerCase();
      const tagsLower = (cs.tags || '').toLowerCase();

      const isHealthRelated = healthKeywords.some(kw => 
        titleLower.includes(kw) || slugLower.includes(kw) || tagsLower.includes(kw)
      );

      if (isHealthRelated && matchedCaseStudyDocIds.length < 6) {
        matchedCaseStudyDocIds.push(cs.documentId);
        matchedCaseStudiesLog.push({ slug: cs.slug, title: cs.title, documentId: cs.documentId });
        console.log(`  ✓ [MATCH] ${cs.slug} - "${cs.title}" (${cs.documentId})`);
      } else {
        skippedCaseStudiesLog.push({ slug: cs.slug, reason: isHealthRelated ? 'Max 6 limit reached' : 'Not related to healthcare/medical' });
        console.log(`  ✗ [SKIPPED] ${cs.slug} (${isHealthRelated ? 'Max 6 limit' : 'Non-healthcare scope'})`);
      }
    }

    // 7. Reviewers Setup
    console.log('\n--- 4. REVIEWERS SETUP ---');
    const reviewerDefinitions = [
      { name: 'Sample Reviewer One', role: 'Healthcare Solutions Lead' },
      { name: 'Sample Reviewer Two', role: 'Senior Engineering Manager' },
    ];

    const reviewerDocIds = [];
    for (const rDef of reviewerDefinitions) {
      const existing = await app.documents('api::reviewer.reviewer').findFirst({
        filters: { name: rDef.name },
      });

      if (existing) {
        console.log(`  ✓ Reviewer "${rDef.name}" already exists (${existing.documentId}).`);
        reviewerDocIds.push(existing.documentId);
      } else {
        console.log(`  + Reviewer "${rDef.name}" will be created in apply mode.`);
        if (isApply) {
          const created = await app.documents('api::reviewer.reviewer').create({
            data: {
              name: rDef.name,
              role: rDef.role,
            },
          });
          reviewerDocIds.push(created.documentId);
          console.log(`    Created: ${created.documentId}`);
        } else {
          reviewerDocIds.push('MOCK_REVIEWER_DOC_ID');
        }
      }
    }

    // 8. Build complete Industry payload
    console.log('\n--- 5. BUILDING COMPLETE HEALTHCARE PAYLOAD ---');
    const healthcareDataPayload = {
      // CTA & review date
      ctaLabel: 'Talk to a Healthcare Expert',
      ctaLink: '/schedule-a-call',
      lastReviewedDate: getTodayDate(),

      // Reviewers
      reviewers: reviewerDocIds,

      // Trust bar: heading only, clientLogos empty
      trustBar: {
        heading: 'Trusted by Healthcare Organizations & Healthtech Innovators',
      },
      clientLogos: [],

      // Stats: 3 generic items
      stats: [
        {
          value: '10+',
          title: 'Years Engineering Healthcare Systems',
          description: 'Delivering reliable clinical and operational software platforms.',
        },
        {
          value: '50+',
          title: 'Healthtech Deployments Delivered',
          description: 'Modernized provider portals, integrations, and clinical tools.',
        },
        {
          value: 'HIPAA-aware',
          title: 'Engineering Practices',
          description: 'Development methodologies aligned with healthcare compliance frameworks.',
        },
      ],

      // Challenges: heading, cta, 6 matched rows
      challengesSection: {
        heading: 'Navigating Key Operational Challenges in Healthcare Software',
        ctaLabel: 'Discuss Your Healthcare Engineering Needs',
        ctaLink: '/schedule-a-call',
        challenges: matchedChallenges,
      },

      // Case studies section: heading, intro, cta, relation
      caseStudiesSection: {
        heading: 'Featured Healthcare Engagements',
        intro: 'Case studies highlighting modern engineering practices for clinical workflows, telemetry, and platform reliability.',
        ctaLabel: 'View all healthcare case studies',
      },
      caseStudies: matchedCaseStudyDocIds,

      // Solutions: 3 categories, 3 items each, no images
      solutionsSection: {
        heading: 'Tailored Engineering Solutions for Healthcare',
        intro: 'Comprehensive digital health capabilities designed for clinical precision and operational resilience.',
        categories: [
          {
            categoryName: 'Clinical and Care Delivery',
            items: [
              {
                title: 'Telehealth & Virtual Care Platforms',
                description: 'Secure consultation portals designed for high-availability video consultations and asynchronous clinician communication.',
                link: '/schedule-a-call',
              },
              {
                title: 'Clinical Decision Support Systems',
                description: 'Embedded intelligence tools providing real-time alerts, guideline checks, and diagnostic prompts within provider workflows.',
                link: '/schedule-a-call',
              },
              {
                title: 'Remote Patient Monitoring (RPM)',
                description: 'Connected device telemetry ingestion pipelines supporting continuous vital sign tracking and threshold-based alerts.',
                link: '/schedule-a-call',
              },
            ],
          },
          {
            categoryName: 'Administrative and Operations',
            items: [
              {
                title: 'EHR & System Integration',
                description: 'Bi-directional data exchange pipelines bridging disparate electronic health record platforms using modern FHIR standards.',
                link: '/schedule-a-call',
              },
              {
                title: 'Patient Intake & Scheduling Portals',
                description: 'Streamlined digital check-in, automated eligibility verification, and self-service appointment scheduling tools.',
                link: '/schedule-a-call',
              },
              {
                title: 'Clinical Billing & Claims Workflow',
                description: 'Automated billing reconciliation and claim preparation engines designed to reduce rejection rates.',
                link: '/schedule-a-call',
              },
            ],
          },
          {
            categoryName: 'Specialty and Vertical-Specific',
            items: [
              {
                title: 'Laboratory Information Systems (LIMS)',
                description: 'High-throughput specimen tracking, automated analyzer integration, and structured lab result delivery portals.',
                link: '/schedule-a-call',
              },
              {
                title: 'Medical Device Companion Applications',
                description: 'Mobile and embedded software designed to securely interface with diagnostic hardware and therapeutic equipment.',
                link: '/schedule-a-call',
              },
              {
                title: 'Population Health & Analytics Hubs',
                description: 'Consolidated health data reporting platforms enabling care teams to track quality metrics and manage chronic conditions.',
                link: '/schedule-a-call',
              },
            ],
          },
        ],
      },

      // Services section: heading, cta, up to 8 matched tabs
      servicesSection: {
        heading: 'Core Services for Healthcare Organizations',
        ctaLabel: 'Get a Scoped Estimate',
        ctaLink: '/schedule-a-call',
        services: matchedServiceTabs,
      },

      // Verticals: 12 cards with verified Lucide icons
      verticalsSection: {
        heading: 'Healthcare Sectors and Verticals We Serve',
        intro: 'Engineering solutions tailored to the operational demands and regulatory environments across the healthcare ecosystem.',
        verticals: [
          {
            title: 'Hospitals and Health Systems',
            description: 'Enterprise modernization, clinical workflow orchestration, and core infrastructure scaling for acute care networks.',
            icon: 'Hospital',
          },
          {
            title: 'Health Insurance and Payers',
            description: 'Claims processing automation, eligibility verification engines, and secure member portal architectures.',
            icon: 'ShieldCheck',
          },
          {
            title: 'Diagnostics and Laboratories',
            description: 'Automated LIMS connectivity, instrument telemetry pipelines, and fast digital result delivery systems.',
            icon: 'FlaskConical',
          },
          {
            title: 'Medical Device Companies',
            description: 'Embedded device software, secure Bluetooth pairing apps, and cloud telemetry ingestion backends.',
            icon: 'Activity',
          },
          {
            title: 'Medical Billing and RCM',
            description: 'Automated revenue cycle management, charge capture verification, and electronic billing integrations.',
            icon: 'Receipt',
          },
          {
            title: 'Digital Health SaaS',
            description: 'Multi-tenant B2B healthcare software engineering with built-in audit trails and role-based access control.',
            icon: 'Cloud',
          },
          {
            title: 'Clinics and Physician Practices',
            description: 'Intuitive practice management dashboards, digital check-in kiosks, and lightweight telehealth portals.',
            icon: 'Stethoscope',
          },
          {
            title: 'Telehealth and Virtual Care',
            description: 'High-concurrency video consultation platforms, asynchronous messaging, and integrated e-prescribing.',
            icon: 'MonitorPlay',
          },
          {
            title: 'Pharmacy and e-Pharmacy',
            description: 'Prescription fulfillment workflows, inventory management systems, and automated refill reminder engines.',
            icon: 'Pill',
          },
          {
            title: 'Senior Living and Long-Term Care',
            description: 'Resident care coordination platforms, medication administration tracking, and family portal systems.',
            icon: 'HeartHandshake',
          },
          {
            title: 'Home Healthcare Providers',
            description: 'Mobile field workforce management, electronic visit verification (EVV), and offline-first charting tools.',
            icon: 'House',
          },
          {
            title: 'Fitness and Wellness',
            description: 'Wearable device data integration, habit tracking applications, and secure wellness member platforms.',
            icon: 'HeartPulse',
          },
        ],
      },

      // Tech Stack: heading + 5 groups
      techStackSection: {
        heading: 'Healthcare Technology & Engineering Stack',
        groups: [
          {
            group: 'Interoperability & Standards',
            items: 'HL7 v2.x\nHL7 FHIR R4\nSMART on FHIR\nDICOM\nMirth Connect / NextGen Connect',
          },
          {
            group: 'AI & Clinical Data',
            items: 'PyTorch\nHugging Face Transformers\nApache Kafka\nPostgreSQL\nSnowflake',
          },
          {
            group: 'Back-End & Microservices',
            items: 'Node.js\nTypeScript\nGo\nPython\nRESTful & GraphQL APIs',
          },
          {
            group: 'Front-End & Mobile',
            items: 'React\nNext.js\nReact Native\nTailwind CSS\nWebRTC',
          },
          {
            group: 'Cloud, Infrastructure & Security',
            items: 'AWS (HIPAA Eligible Services)\nGoogle Cloud Healthcare API\nDocker & Kubernetes\nTerraform\nHashiCorp Vault',
          },
        ],
      },

      // CTA Banner
      ctaBanner: {
        heading: "Let's Discuss Your Healthcare Project",
        text: 'Connect with our healthcare software engineering practice to review your architecture, compliance requirements, and delivery milestones.',
        buttonLabel: 'Schedule an Introductory Call',
        buttonLink: '/schedule-a-call',
        themeVariant: 'gradient',
      },

      // SEO
      seo: {
        metaTitle: 'Healthcare Software Development & Engineering | Metaphi',
        metaDescription: 'Specialized healthcare software engineering services delivering compliant clinical platforms, FHIR interoperability, and digital health applications.',
        keywords: 'healthcare software engineering, digital health development, medical software, FHIR integration, telehealth platform',
      },
    };

    console.log('Payload summary:');
    console.log(`  - CTA: "${healthcareDataPayload.ctaLabel}" -> ${healthcareDataPayload.ctaLink}`);
    console.log(`  - reviewers: ${healthcareDataPayload.reviewers.length} reviewer(s) linked`);
    console.log(`  - trustBar: heading="${healthcareDataPayload.trustBar.heading}", clientLogos=${healthcareDataPayload.clientLogos.length}`);
    console.log(`  - stats: ${healthcareDataPayload.stats.length} items`);
    console.log(`  - challengesSection: ${healthcareDataPayload.challengesSection.challenges.length} challenge rows with linked services`);
    console.log(`  - caseStudiesSection: heading="${healthcareDataPayload.caseStudiesSection.heading}"`);
    console.log(`  - caseStudies: ${healthcareDataPayload.caseStudies.length} case study relation(s) linked`);
    console.log(`  - solutionsSection: ${healthcareDataPayload.solutionsSection.categories.length} categories (${healthcareDataPayload.solutionsSection.categories.reduce((acc, c) => acc + c.items.length, 0)} total items)`);
    console.log(`  - servicesSection: ${healthcareDataPayload.servicesSection.services.length} service tabs with linked services`);
    console.log(`  - verticalsSection: ${healthcareDataPayload.verticalsSection.verticals.length} vertical cards with verified Lucide icons`);
    console.log(`  - techStackSection: ${healthcareDataPayload.techStackSection.groups.length} tech groups`);
    console.log(`  - ctaBanner: heading="${healthcareDataPayload.ctaBanner.heading}", themeVariant="${healthcareDataPayload.ctaBanner.themeVariant}"`);
    console.log(`  - seo: metaTitle="${healthcareDataPayload.seo.metaTitle}"\n`);

    if (isDryRun) {
      console.log('----------------------------------------------------------------');
      console.log('DRY-RUN COMPLETE. ZERO rows or fields were modified in the database.');
      console.log('Awaiting user approval before applying changes.');
      console.log('To apply after approval: node scripts/seed-healthcare.cjs --apply');
      console.log('----------------------------------------------------------------');
      return;
    }

    // APPLY MODE
    console.log('Applying updates to Healthcare [draft] via Document Service API...');
    await app.documents('api::industry.industry').update({
      documentId: healthcareDraft.documentId,
      status: 'draft',
      data: healthcareDataPayload,
    });
    console.log('✓ Successfully updated Healthcare [draft].');

    console.log('Applying updates to Healthcare [published] via Document Service API...');
    await app.documents('api::industry.industry').update({
      documentId: healthcareDraft.documentId,
      status: 'published',
      data: healthcareDataPayload,
    });
    console.log('✓ Successfully updated Healthcare [published].');

    // Also ensure case study side has healthcare connected
    for (const csDocId of matchedCaseStudyDocIds) {
      console.log(`Syncing case study ${csDocId} with Healthcare relation...`);
      await app.documents('api::case-study.case-study').update({
        documentId: csDocId,
        status: 'draft',
        data: {
          industries: [healthcareDraft.documentId],
        },
      });
      await app.documents('api::case-study.case-study').update({
        documentId: csDocId,
        status: 'published',
        data: {
          industries: [healthcareDraft.documentId],
        },
      });
    }

    console.log('\n================================================================');
    console.log('✓ ALL HEALTHCARE SEEDING UPDATES APPLIED SUCCESSFULLY!');
    console.log('================================================================\n');

  } catch (err) {
    console.error('Error during seeding execution:', err);
    process.exit(1);
  } finally {
    await app.destroy();
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
