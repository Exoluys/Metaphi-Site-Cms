const { createStrapi } = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(appDir, '.env') });

function trimMax(str, max) {
  if (!str) return str;
  const s = str.trim();
  if (s.length <= max) return s;
  const sub = s.slice(0, max - 1);
  const sp = sub.lastIndexOf(' ');
  return (sp > 0 ? sub.slice(0, sp) : sub) + '…';
}

function imgId(media) {
  if (!media) return undefined;
  return media.id || media.documentId || undefined;
}

async function run() {
  const strapi = await createStrapi({
    appDir,
    distDir: path.join(appDir, 'dist'),
  }).load();

  try {
    // ── 1. Home Page ──
    const homeSvc = strapi.documents('api::home-page.home-page');
    const curHome = await homeSvc.findFirst({
      status: 'draft',
      populate: {
        clientLogos: { populate: '*' },
        industriesSection: { populate: '*' },
        insightsResourcesSection: { populate: '*' },
        finalCta: { populate: '*' },
        solutionModelsImage: true,
        businessProblems: true,
        whyMetaphiPillars: true,
        trustPills: true,
        companyStats: true,
      },
    });

    if (curHome) {
      await homeSvc.update({
        documentId: curHome.documentId,
        data: {
          heroTitle: 'Technology Built',
          heroHighlight: 'Around Your Business',
          heroDescription: trimMax(
            'We design, engineer and evolve custom software, digital products and enterprise AI solutions for growing organisations.',
            120
          ),
          primaryButtonLabel: 'Discuss Your Technology Initiative',
          secondaryButtonLabel: 'Explore Case Studies',
          trustHeading: 'Business-first thinking.',
          trustHighlight: 'Engineering-led execution.',
          trustSubtext: trimMax(
            'From operational systems and digital products to AI-enabled workflows and connected enterprise platforms.',
            160
          ),
          trustPills: [
            { text: 'Business Applications' },
            { text: 'Product Engineering' },
            { text: 'Enterprise AI' },
            { text: 'Cloud, Data & Integrations' },
            { text: 'Managed Services' },
          ],
          businessProblemsHeading: 'Technology should remove complexity—',
          businessProblemsHighlight: 'not add another layer of it.',
          businessProblemsSubtext: trimMax(
            'Businesses typically come to us when existing tools, manual processes or disconnected systems can no longer support growth.',
            160
          ),
          businessProblems: [
            { title: 'Fragmented Operations', description: 'Critical workflows spread across spreadsheets, disconnected applications and manual follow-ups.' },
            { title: 'Legacy Technology', description: 'Existing systems are difficult to integrate, scale or adapt to changing business needs.' },
            { title: 'Product Ideas That Need Execution', description: 'A digital product or SaaS idea exists, but turning it into a reliable, scalable platform requires structured engineering.' },
            { title: 'AI Opportunities Without a Practical Roadmap', description: 'Teams see the potential of AI but need help identifying where it can create measurable value.' },
            { title: 'Growing Beyond Existing Systems', description: 'Standard software no longer fits the way the business operates.' },
            { title: 'Technology Without Business Visibility', description: 'Data exists across systems, but management still lacks timely, actionable information.' },
          ],
          solutionModelsHeading: 'Choose the technology model',
          solutionModelsHighlight: 'that fits your business.',
          solutionModelsSubtext: trimMax(
            'Not every technology problem should be solved the same way. Metaphi offers three distinct ways to adopt or build technology.',
            160
          ),
          industriesSection: {
            heading: 'Technology grounded in',
            highlight: 'industry context.',
            subtext: 'Technology decisions work better when they reflect how an industry actually operates.',
            ctaLabel: 'Explore Industries',
            image: imgId(curHome.industriesSection?.image),
          },
          whyMetaphiHeading: 'A technology partner—',
          whyMetaphiHighlight: 'not another development vendor.',
          whyMetaphiSubtext: 'Clear product thinking, integrated engineering, and long-term technical ownership.',
          whyMetaphiPillars: [
            { title: 'Business Before Technology', description: 'We begin by understanding the operating problem, not by prescribing a technology stack.' },
            { title: 'Structured Product Thinking', description: 'Requirements, workflows and priorities are translated into clear product and engineering scope.' },
            { title: 'Integrated Capability', description: 'Software, AI, cloud, data and integrations are considered as parts of one technology ecosystem.' },
            { title: 'Built for Evolution', description: 'Solutions are designed so that new workflows, integrations and capabilities can be added over time.' },
            { title: 'Long-Term Partnership', description: 'We can continue supporting, improving and extending the technology after launch.' },
          ],
          deliveryApproachHeading: 'From business problem',
          deliveryApproachHighlight: 'to working technology.',
          deliveryApproachSubtext: 'Structured enough for control. Flexible enough for reality.',
          workShowcaseHeading: 'Proof through',
          workShowcaseHighlight: 'execution.',
          workShowcaseIntro: trimMax(
            'Explore how we have translated complex operational and digital requirements into working technology platforms.',
            160
          ),
          insightsResourcesSection: {
            heading: 'Practical thinking for better',
            highlight: 'technology decisions.',
            subtext: 'Explore industry playbooks, implementation guides and perspectives on enterprise software, digital products and applied AI.',
            ctaLabel: 'Explore Insights',
            image: imgId(curHome.insightsResourcesSection?.image),
          },
          finalCta: {
            heading: 'Have a technology initiative you’re trying to move forward?',
            subtext: 'Tell us what you are trying to improve, automate, build or scale. We’ll help you identify the right starting point.',
            ctaLabel: 'Discuss Your Technology Initiative',
            secondaryCtaLabel: 'Book a Discovery Call',
          },
        },
      });
      await homeSvc.publish({ documentId: curHome.documentId });
      console.log('✓ Updated Home Page (images preserved)');
    }

    // ── 2. Industries Hub ──
    const indHubSvc = strapi.documents('api::industries-hub.industries-hub');
    const curIndHub = await indHubSvc.findFirst({
      status: 'draft',
      populate: {
        heroImage: true,
        relevantSolutions: { populate: '*' },
        proof: { populate: '*' },
        resources: { populate: '*' },
        finalCta: true,
      },
    });
    if (curIndHub) {
      await indHubSvc.update({
        documentId: curIndHub.documentId,
        data: {
          heroHeading: 'Technology Solutions Built Around Industry Reality',
          heroSubtext: trimMax(
            'Every industry has different workflows, constraints, customer expectations and operating realities. Metaphi combines domain understanding with custom engineering and AI.',
            160
          ),
          gridCardActionLabel: 'Explore Your Industry',
          transformationThemes: {
            heading: 'Different industries. Recurring transformation opportunities.',
            subtext: curIndHub.transformationThemes?.subtext || '',
            items: [
              { text: 'Replace spreadsheet-led processes' },
              { text: 'Connect fragmented business applications' },
              { text: 'Automate repetitive workflows' },
              { text: 'Improve management visibility' },
              { text: 'Build customer and partner portals' },
              { text: 'Modernise legacy systems' },
              { text: 'Introduce practical AI' },
              { text: 'Improve data availability' },
              { text: 'Build scalable digital products' },
            ],
          },
          relevantSolutions: {
            heading: 'Capability that travels',
            highlight: 'across industries.',
            subtext: trimMax(
              'Our industry work is supported by a common engineering foundation across Custom Business Applications, Product Engineering, Enterprise AI, Cloud & Integrations and Managed Services.',
              160
            ),
            ctaLabel: 'Explore Custom Solutions',
            image: imgId(curIndHub.relevantSolutions?.image),
          },
          proof: {
            heading: 'Explore industry experience through real implementations.',
            subtext: curIndHub.proof?.subtext || '',
            ctaLabel: 'View Case Studies',
            image: imgId(curIndHub.proof?.image),
            caseStudy: curIndHub.proof?.caseStudy?.documentId || undefined,
          },
          resources: {
            heading: 'Go deeper with',
            highlight: 'industry playbooks.',
            subtext: trimMax(
              'Our industry playbooks explore common operational challenges, technology opportunities and practical starting points for digital transformation.',
              160
            ),
            ctaLabel: 'Browse Industry Playbooks',
            image: imgId(curIndHub.resources?.image),
          },
          finalCta: {
            heading: 'Discuss Your Industry Technology Initiative',
            subtext: curIndHub.finalCta?.subtext || '',
            ctaLabel: 'Discuss Your Industry Technology Initiative',
          },
        },
      });
      await indHubSvc.publish({ documentId: curIndHub.documentId });
      console.log('✓ Updated Industries Hub (images preserved)');
    }

    // ── 3. Solutions Hub ──
    const solHubSvc = strapi.documents('api::solutions-hub.solutions-hub');
    const curSolHub = await solHubSvc.findFirst({
      status: 'draft',
      populate: { heroImage: true, proof: { populate: '*' }, howToChoose: { populate: '*' }, customModel: true, readyModel: true, saasModel: true, finalCta: true },
    });
    if (curSolHub) {
      await solHubSvc.update({
        documentId: curSolHub.documentId,
        data: {
          heroHeading: 'Three Ways to Solve Your Technology Challenge',
          heroSubtext: trimMax(
            'The right solution depends on how unique your requirements are, how quickly you need to implement and how much control you need over the technology.',
            160
          ),
          customModel: {
            ...(curSolHub.customModel || {}),
            title: 'Custom Solutions',
            description: trimMax(
              'Build around your requirements. Choose Custom Solutions when your business processes, digital product or AI initiative require bespoke architecture and control.',
              160
            ),
          },
          readyModel: {
            ...(curSolHub.readyModel || {}),
            title: 'Ready-to-Configure Solutions',
            description: trimMax(
              'Start from a proven foundation. Choose Ready-to-Configure when Metaphi has already built the core foundation for your domain but still needs business configuration.',
              160
            ),
          },
          saasModel: {
            ...(curSolHub.saasModel || {}),
            title: 'SaaS Products',
            description: trimMax(
              'Use a standardised product. Choose SaaS where the business requirement is common and speed with minimal setup matters most.',
              160
            ),
          },
          howToChoose: {
            ...(curSolHub.howToChoose || {}),
            heading: 'Not sure which model fits?',
            subtext: 'Choose Custom for strategic uniqueness, Ready-to-Configure for faster tailored implementation, or SaaS for standard operational speed.',
            customRule: 'Choose Custom when your process or product is strategically unique.',
            readyRule: 'Choose Ready-to-Configure when you want faster implementation but still need significant configuration.',
            saasRule: 'Choose SaaS when your requirement is standard and speed/simplicity matter more than deep customisation.',
            ctaLabel: 'Discuss the Right Approach',
          },
          proof: {
            heading: 'See how different technology models translate into execution.',
            subtext: curSolHub.proof?.subtext || '',
            ctaLabel: 'Explore Case Studies',
            image: imgId(curSolHub.proof?.image),
            caseStudy: curSolHub.proof?.caseStudy?.documentId || undefined,
          },
          finalCta: {
            heading: 'Discuss Your Technology Initiative',
            subtext: curSolHub.finalCta?.subtext || '',
            ctaLabel: 'Discuss Your Technology Initiative',
          },
        },
      });
      await solHubSvc.publish({ documentId: curSolHub.documentId });
      console.log('✓ Updated Solutions Hub (images preserved)');
    }

    // ── 4. Custom Solutions Hub ──
    const custHubSvc = strapi.documents('api::custom-solutions-hub.custom-solutions-hub');
    const curCustHub = await custHubSvc.findFirst({
      status: 'draft',
      populate: {
        heroImage: true,
        whenCustomMakesSense: { populate: '*' },
        businessOutcomes: { populate: '*' },
        industriesBlock: { populate: '*' },
        proof: { populate: '*' },
        deliveryProcess: { populate: '*' },
        finalCta: true,
      },
    });
    if (curCustHub) {
      await custHubSvc.update({
        documentId: curCustHub.documentId,
        data: {
          heroHeading: 'Technology Designed Around the Way Your Business Works',
          heroSubtext: trimMax(
            'When standard software cannot accommodate your processes, product strategy or integration requirements, Metaphi designs and engineers custom technology.',
            160
          ),
          whenCustomMakesSense: {
            heading: curCustHub.whenCustomMakesSense?.heading || 'When Custom Makes Sense',
            subtext: curCustHub.whenCustomMakesSense?.subtext || '',
            items: [
              { text: 'Your workflows create competitive differentiation.' },
              { text: 'Multiple existing systems need to work together.' },
              { text: 'Standard software requires excessive workarounds.' },
              { text: 'You are creating a new digital product.' },
              { text: 'Your business requires specialised automation or AI.' },
              { text: 'Existing technology needs modernisation.' },
              { text: 'You need full control over evolution and integrations.' },
            ],
          },
          businessOutcomes: {
            heading: curCustHub.businessOutcomes?.heading || 'Custom technology should create business leverage.',
            subtext: curCustHub.businessOutcomes?.subtext || '',
            items: [
              { text: 'Fewer manual hand-offs' },
              { text: 'Better operational visibility' },
              { text: 'Connected data' },
              { text: 'Faster workflows' },
              { text: 'Better customer experience' },
              { text: 'Scalable digital operations' },
              { text: 'Reduced dependence on spreadsheets' },
              { text: 'Technology aligned to future growth' },
            ],
          },
          industriesBlock: {
            heading: 'Built across different',
            highlight: 'operating environments.',
            subtext: curCustHub.industriesBlock?.subtext || '',
            ctaLabel: 'Explore Industries',
            image: imgId(curCustHub.industriesBlock?.image),
          },
          deliveryProcess: {
            heading: 'Structured enough for control. Flexible enough for reality.',
            subtext: 'Discover → Define → Design → Build → Integrate → Launch → Evolve',
            steps: [
              { title: 'Discover', description: 'Understand workflows, users, constraints and business objectives.' },
              { title: 'Define', description: 'Translate requirements into scope, priorities and architecture.' },
              { title: 'Design', description: 'Shape the user experience, data structures and workflows.' },
              { title: 'Build', description: 'Engineer the platform iteratively with continuous validation.' },
              { title: 'Integrate', description: 'Connect with ERPs, accounting, APIs and existing systems.' },
              { title: 'Launch', description: 'Validate, migrate and deploy with production readiness checks.' },
              { title: 'Evolve', description: 'Support, optimise and extend as requirements evolve.' },
            ],
          },
          proof: {
            heading: curCustHub.proof?.heading || 'Proven Custom Execution',
            subtext: curCustHub.proof?.subtext || '',
            ctaLabel: 'Explore Custom Solution Case Studies',
            image: imgId(curCustHub.proof?.image),
            caseStudy: curCustHub.proof?.caseStudy?.documentId || undefined,
          },
          finalCta: {
            heading: 'Discuss Your Custom Software Requirement',
            subtext: curCustHub.finalCta?.subtext || '',
            ctaLabel: 'Discuss Your Custom Software Requirement',
          },
        },
      });
      await custHubSvc.publish({ documentId: curCustHub.documentId });
      console.log('✓ Updated Custom Solutions Hub (images preserved)');
    }

    // ── 5. Ready-to-Configure Hub ──
    const readyHubSvc = strapi.documents('api::ready-to-configure-hub.ready-to-configure-hub');
    const curReadyHub = await readyHubSvc.findFirst({
      status: 'draft',
      populate: {
        heroImage: true,
        comparisonMatrix: { populate: '*' },
        proof: { populate: '*' },
        implementationFlow: { populate: '*' },
        finalCta: true,
      },
    });
    if (curReadyHub) {
      await readyHubSvc.update({
        documentId: curReadyHub.documentId,
        data: {
          heroHeading: 'Start With a Proven Foundation. Configure It Around Your Business.',
          heroSubtext: trimMax(
            'Not every implementation needs to begin from zero. Metaphi’s Ready-to-Configure solutions combine proven architecture with business-specific configuration.',
            160
          ),
          whatItMeans: [
            { title: 'Already Available', description: 'Core workflows, modules and system foundations based on previous implementation experience.' },
            { title: 'Configurable', description: 'Business rules, workflows, roles, reports and user journeys can be aligned to your processes.' },
            { title: 'Extendable', description: 'New functionality can be engineered where your requirements go beyond the existing foundation.' },
            { title: 'Integrable', description: 'The solution can connect with your existing applications, devices and external platforms.' },
          ],
          comparisonMatrix: {
            ...(curReadyHub.comparisonMatrix || {}),
            heading: 'Different From SaaS',
            subtext: 'More flexible than SaaS. Faster than starting completely from scratch.',
            saasColumn: 'Standard product with limited configuration.',
            readyColumn: 'Reusable solution foundation with substantial business configuration and extensibility.',
            customColumn: 'Designed primarily from your unique requirements.',
          },
          implementationFlow: {
            heading: 'Configure. Integrate. Validate. Launch.',
            subtext: 'Assess → Configure → Integrate → Migrate → Train → Go Live',
            steps: [
              { title: 'Assess', description: 'Map your processes against the ready-to-configure foundation.' },
              { title: 'Configure', description: 'Align workflows, roles, rules and reports to your business.' },
              { title: 'Integrate', description: 'Connect accounting, ERP, CRM, devices and external APIs.' },
              { title: 'Migrate', description: 'Cleanly transition existing master and operational data.' },
              { title: 'Train', description: 'Onboard teams on configured workflows and dashboards.' },
              { title: 'Go Live', description: 'Launch with production support and ongoing evolution.' },
            ],
          },
          proof: {
            heading: 'Built from implementation experience—not theory.',
            subtext: curReadyHub.proof?.subtext || '',
            ctaLabel: 'Explore Relevant Case Studies',
            image: imgId(curReadyHub.proof?.image),
            caseStudy: curReadyHub.proof?.caseStudy?.documentId || undefined,
          },
          finalCta: {
            heading: 'Request a Solution Walkthrough',
            subtext: curReadyHub.finalCta?.subtext || '',
            ctaLabel: 'Request a Solution Walkthrough',
          },
        },
      });
      await readyHubSvc.publish({ documentId: curReadyHub.documentId });
      console.log('✓ Updated Ready-to-Configure Hub (images preserved)');
    }

    console.log('\n🎉 TASK 9A HOME PAGE & CORE HUBS OVERRIDDEN (images preserved)!');
  } finally {
    await strapi.destroy();
  }
}

run().catch((err) => {
  console.error('Seed 9A Error:', err.message, JSON.stringify(err.details, null, 2));
  process.exit(1);
});
