const { createStrapi } = require('@strapi/strapi');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(appDir, '.env') });

function imgId(media) {
  if (!media) return undefined;
  return media.id || media.documentId || undefined;
}

function isDummy(val) {
  if (!val || typeof val !== 'string') return false;
  const s = val.trim();
  if (!s) return true;
  if (/^(as+d|da+s|sd+a|lasdas|asd|sdasd|dasda)/i.test(s)) return true;
  if (/^[asdfghjkl]{3,12}$/i.test(s) && !/^(saas|faqs?)$/i.test(s)) return true;
  return false;
}

function cleanText(val, fallback = null) {
  if (!val || typeof val !== 'string') return fallback;
  return isDummy(val) ? fallback : val.trim();
}

async function run() {
  const strapi = await createStrapi({
    appDir,
    distDir: path.join(appDir, 'dist'),
  }).load();

  try {
    // Look up a default published Case Study to link Proof blocks cleanly
    const csSvc = strapi.documents('api::case-study.case-study');
    const publishedCases = await csSvc.findMany({
      status: 'published',
      limit: 5,
      sort: 'order:asc',
    });
    const fallbackCaseDocId = publishedCases?.[0]?.documentId || undefined;

    // Look up uploaded photo assets in case Industries Hub heroImage currently holds a client logo
    const uploadedFiles = await strapi.db.query('plugin::upload.file').findMany({
      select: ['id', 'name'],
    });
    const logisticsPhoto =
      uploadedFiles.find((f) => f.name === 'showcase-logistics-ai.jpg') ||
      uploadedFiles.find((f) => f.name === 'showcase-wind-farm.jpg') ||
      uploadedFiles.find((f) => f.name === 'hero-team.jpg');

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
          heroDescription:
            'We design, engineer and evolve custom software, digital products and enterprise AI solutions that solve real operational problems, connect fragmented workflows and create the technology foundation for growth.',
          primaryButtonLabel: 'Discuss Your Technology Initiative',
          secondaryButtonLabel: 'Explore Case Studies',
          trustHeading: 'Business-first thinking.',
          trustHighlight: 'Engineering-led execution.',
          trustSubtext:
            'From operational systems and digital products to AI-enabled workflows and connected business platforms, Metaphi works at the intersection of technology, process and business outcomes.',
          trustPills: [
            { text: 'Business Applications' },
            { text: 'Product Engineering' },
            { text: 'Enterprise AI' },
            { text: 'Cloud, Data & Integrations' },
            { text: 'Managed Services' },
          ],
          businessProblemsHeading: 'Technology should remove complexity—',
          businessProblemsHighlight: 'not add another layer of it.',
          businessProblemsSubtext:
            'Businesses typically come to us when existing tools, manual processes or disconnected systems begin limiting visibility, productivity or growth.',
          businessProblems: [
            {
              title: 'Fragmented Operations',
              description:
                'Critical workflows spread across spreadsheets, disconnected applications and manual coordination.',
            },
            {
              title: 'Legacy Technology',
              description:
                'Existing systems are difficult to integrate, scale or adapt to changing business requirements.',
            },
            {
              title: 'Product Ideas That Need Execution',
              description:
                'A digital product or SaaS idea exists, but turning it into a reliable, scalable platform requires structured product engineering.',
            },
            {
              title: 'AI Opportunities Without a Practical Roadmap',
              description:
                'Teams see the potential of AI but need help identifying where it can create measurable operational value.',
            },
            {
              title: 'Growing Beyond Existing Systems',
              description:
                'Standard software no longer fits the way the business operates.',
            },
            {
              title: 'Technology Without Business Visibility',
              description:
                'Data exists across systems, but management still lacks timely, actionable information.',
            },
          ],
          solutionModelsHeading: 'Choose the technology model',
          solutionModelsHighlight: 'that fits your business.',
          solutionModelsSubtext:
            'Not every technology problem should be solved the same way. Metaphi offers three engagement models depending on how unique your requirements are, how quickly you need to move and how much configuration your business requires.',
          industriesSection: {
            heading: 'Technology grounded in',
            highlight: 'industry context.',
            subtext:
              'Technology decisions work better when they reflect how an industry actually operates. Metaphi combines engineering capability with practical understanding of business workflows across ten industry groups.',
            ctaLabel: 'Explore Industries',
            image: imgId(curHome.industriesSection?.image),
          },
          whyMetaphiHeading: 'A technology partner—',
          whyMetaphiHighlight: 'not another development vendor.',
          whyMetaphiSubtext: null,
          whyMetaphiPillars: [
            {
              title: 'Business Before Technology',
              description:
                'We begin by understanding the operating problem, not by prescribing a technology stack.',
            },
            {
              title: 'Structured Product Thinking',
              description:
                'Requirements, workflows and priorities are translated into clear product and engineering decisions.',
            },
            {
              title: 'Integrated Capability',
              description:
                'Software, AI, cloud, data and integrations are considered as parts of one technology ecosystem.',
            },
            {
              title: 'Built for Evolution',
              description:
                'Solutions are designed so that new workflows, integrations and capabilities can be introduced as the business changes.',
            },
            {
              title: 'Long-Term Partnership',
              description:
                'We can continue supporting, improving and extending the technology after launch.',
            },
          ],
          deliveryApproachHeading: 'From business problem',
          deliveryApproachHighlight: 'to working technology.',
          deliveryApproachSubtext:
            'Structured enough for control. Flexible enough for reality.',
          workShowcaseHeading: 'Proof through',
          workShowcaseHighlight: 'execution.',
          workShowcaseIntro:
            'Explore how we have translated complex operational and digital requirements into working business platforms.',
          insightsResourcesSection: {
            heading: 'Practical thinking for better',
            highlight: 'technology decisions.',
            subtext:
              'Explore industry playbooks, implementation guides and perspectives on enterprise software, product engineering, AI and digital transformation.',
            ctaLabel: 'Explore Insights',
            image: imgId(curHome.insightsResourcesSection?.image),
          },
          finalCta: {
            heading:
              'Have a technology initiative you’re trying to move forward?',
            subtext:
              'Tell us what you are trying to improve, automate, build or scale. We’ll help you evaluate the right technology approach.',
            ctaLabel: 'Discuss Your Technology Initiative',
            secondaryCtaLabel: 'Book a Discovery Call',
          },
        },
      });
      await homeSvc.publish({ documentId: curHome.documentId });
      console.log('✓ Updated Home Page (verbatim Task 9A copy, images preserved)');
    }

    // ── 2. Industries Hub ──
    const indHubSvc = strapi.documents('api::industries-hub.industries-hub');
    const curIndHub = await indHubSvc.findFirst({
      status: 'draft',
      populate: {
        heroImage: true,
        transformationThemes: { populate: '*' },
        relevantSolutions: { populate: '*' },
        proof: { populate: '*' },
        resources: { populate: '*' },
        finalCta: true,
        seo: true,
      },
    });
    if (curIndHub) {
      const currentIndImgName = curIndHub.heroImage?.name || '';
      const resolvedIndHeroId =
        curIndHub.heroImage && !/logo/i.test(currentIndImgName)
          ? imgId(curIndHub.heroImage)
          : imgId(logisticsPhoto) || imgId(curIndHub.heroImage);

      await indHubSvc.update({
        documentId: curIndHub.documentId,
        data: {
          heroHeading:
            'Technology Solutions Built Around Industry Reality',
          heroSubtext:
            'Every industry has different workflows, constraints, customer expectations and opportunities. Metaphi combines software engineering, AI and automation capabilities with industry-specific solution thinking.',
          heroCtaLabel: 'Explore Your Industry',
          heroImage: resolvedIndHeroId,
          gridHeading: cleanText(
            curIndHub.gridHeading,
            'Ten industries. Purpose-built technology solutions.'
          ),
          gridSubtext: cleanText(
            curIndHub.gridSubtext,
            'Technology decisions work better when they reflect how an industry actually operates.'
          ),
          gridCardActionLabel: 'Explore Your Industry',
          relatedSolutionsHeading: cleanText(
            curIndHub.relatedSolutionsHeading,
            'From industry context to working technology.'
          ),
          servedIndustriesHeading: cleanText(
            curIndHub.servedIndustriesHeading,
            'Ten industries. Purpose-built technology solutions.'
          ),
          transformationThemes: {
            heading:
              'Different industries. Recurring transformation opportunities.',
            featuredEyebrow:
              cleanText(curIndHub.transformationThemes?.featuredEyebrow) ||
              'Common Transformation Themes',
            featuredNote: cleanText(
              curIndHub.transformationThemes?.featuredNote,
              null
            ),
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
            subtext:
              'Our industry work is supported by a common engineering foundation across Custom Business Applications, Product Engineering, Enterprise AI, Cloud & Integrations and Managed Services.',
            ctaLabel: 'Explore Custom Solutions',
            image: imgId(curIndHub.relevantSolutions?.image),
          },
          proof: {
            heading:
              'Explore industry experience through real implementations.',
            subtext: null,
            ctaLabel: 'View Case Studies',
            caseStudy:
              curIndHub.proof?.caseStudy?.documentId || fallbackCaseDocId,
          },
          resources: {
            heading: 'Go deeper with',
            highlight: 'industry playbooks.',
            subtext:
              'Our industry playbooks explore common operational challenges, technology opportunities and practical transformation paths.',
            ctaLabel: 'Browse Industry Playbooks',
            image: imgId(curIndHub.resources?.image),
          },
          finalCta: {
            heading: 'Discuss Your Industry Technology Initiative',
            subtext: null,
            ctaLabel: 'Discuss Your Industry Technology Initiative',
          },
          seo: {
            metaTitle:
              'Industry-Specific Software & AI Solutions | Metaphi',
            metaDescription:
              'Every industry has different workflows, constraints, customer expectations and opportunities. Metaphi combines software engineering, AI and automation capabilities with industry-specific solution thinking.',
          },
        },
      });
      await indHubSvc.publish({ documentId: curIndHub.documentId });
      console.log('✓ Updated Industries Hub (verbatim Task 9A copy & SEO)');
    }

    // ── 3. Solutions Hub ──
    const solHubSvc = strapi.documents('api::solutions-hub.solutions-hub');
    const curSolHub = await solHubSvc.findFirst({
      status: 'draft',
      populate: {
        heroImage: true,
        proof: { populate: '*' },
        howToChoose: { populate: '*' },
        customModel: true,
        readyModel: true,
        saasModel: true,
        finalCta: true,
      },
    });
    if (curSolHub) {
      await solHubSvc.update({
        documentId: curSolHub.documentId,
        data: {
          heroHeading: 'Three Ways to Solve Your Technology Challenge',
          heroSubtext:
            'The right solution depends on how unique your requirements are, how quickly you need to implement and how much control your business needs over the resulting technology.',
          heroCtaLabel: 'Explore Solution Models',
          modelsHeading: cleanText(
            curSolHub.modelsHeading,
            'Choose the technology model that fits your business.'
          ),
          modelsSubtext: cleanText(
            curSolHub.modelsSubtext,
            'Metaphi offers three engagement models based on workflow uniqueness, implementation speed and required system control.'
          ),
          customModel: {
            title: 'Custom Solutions',
            tagline: 'Build around your requirements.',
            description:
              'Choose Custom Solutions when your business processes, product vision, integrations or competitive requirements demand bespoke technology. Typical needs include bespoke ERP or operational software, new SaaS or digital products, AI-enabled workflows, legacy modernisation and complex system integrations.',
            ctaLabel: 'Explore Custom Solutions',
          },
          readyModel: {
            title: 'Ready-to-Configure Solutions',
            tagline: 'Start from a proven foundation.',
            description:
              'Choose Ready-to-Configure when Metaphi has already built significant reusable capability for the problem you are trying to solve. You gain a faster starting point, configurable workflows, bespoke extensions, integration flexibility and lower implementation uncertainty.',
            ctaLabel: 'Explore Ready-to-Configure Solutions',
          },
          saasModel: {
            title: 'SaaS Products',
            tagline: 'Use a standardised product.',
            description:
              'Choose SaaS where the business requirement is common enough to be addressed through a subscription product without significant custom engineering.',
            ctaLabel: 'Explore SaaS Products',
          },
          howToChoose: {
            heading: 'Not sure which model fits?',
            subtext: null,
            customRuleTitle: 'Choose Custom',
            customRule:
              'Choose Custom when your process or product is strategically unique.',
            customSummary:
              'Choose Custom Solutions when your business processes, product vision, integrations or competitive requirements demand bespoke technology.',
            readyRuleTitle: 'Choose Ready-to-Configure',
            readyRule:
              'Choose Ready-to-Configure when you want faster implementation but still need significant business configuration.',
            readySummary:
              'Choose Ready-to-Configure when Metaphi has already built significant reusable capability for the problem you are trying to solve.',
            saasRuleTitle: 'Choose SaaS',
            saasRule:
              'Choose SaaS when your requirement is standard and speed/simplicity matter more than deep customisation.',
            saasSummary:
              'Choose SaaS where the business requirement is common enough to be addressed through a subscription product without significant custom engineering.',
            ctaLabel: 'Discuss the Right Approach',
          },
          proof: {
            heading:
              'See how different technology models translate into execution.',
            subtext: null,
            ctaLabel: 'Explore Case Studies',
            caseStudy:
              curSolHub.proof?.caseStudy?.documentId || fallbackCaseDocId,
          },
          finalCta: {
            heading: 'Discuss Your Technology Initiative',
            subtext: null,
            ctaLabel: 'Discuss Your Technology Initiative',
          },
        },
      });
      await solHubSvc.publish({ documentId: curSolHub.documentId });
      console.log('✓ Updated Solutions Hub (verbatim Task 9A copy & Case Study linked)');
    }

    // ── 4. Custom Solutions Hub ──
    const custHubSvc = strapi.documents(
      'api::custom-solutions-hub.custom-solutions-hub'
    );
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
          heroHeading:
            'Technology Designed Around the Way Your Business Works',
          heroSubtext:
            'When standard software cannot accommodate your processes, product strategy or integration requirements, Metaphi designs and engineers technology around your business instead of forcing your business around the software.',
          whenCustomMakesSense: {
            heading: 'When Custom Makes Sense',
            featuredEyebrow:
              cleanText(curCustHub.whenCustomMakesSense?.featuredEyebrow) ||
              'When Bespoke Engineering Fits',
            featuredNote: cleanText(
              curCustHub.whenCustomMakesSense?.featuredNote,
              null
            ),
            items: [
              { text: 'Your workflows create competitive differentiation.' },
              { text: 'Multiple existing systems need to work together.' },
              { text: 'Standard software requires excessive workarounds.' },
              { text: 'You are creating a new digital product.' },
              {
                text: 'Your business requires specialised automation or AI.',
              },
              { text: 'Existing technology needs modernisation.' },
              {
                text: 'You need full control over evolution and integrations.',
              },
            ],
          },
          businessOutcomes: {
            heading: 'Custom technology should create business leverage.',
            featuredEyebrow:
              cleanText(curCustHub.businessOutcomes?.featuredEyebrow) || null,
            featuredNote: cleanText(
              curCustHub.businessOutcomes?.featuredNote,
              null
            ),
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
            subtext:
              'Technology decisions work better when they reflect how an industry actually operates. Metaphi combines engineering capability with practical understanding of business workflows across ten industry groups.',
            ctaLabel: 'Explore Industries',
            image: imgId(curCustHub.industriesBlock?.image),
          },
          deliveryProcess: {
            heading:
              'Structured enough for control. Flexible enough for reality.',
            subtext:
              'Discover → Define → Design → Build → Integrate → Launch → Evolve',
            phase1Title: cleanText(
              curCustHub.deliveryProcess?.phase1Title,
              'Strategy & Architecture'
            ),
            phase1Description: cleanText(
              curCustHub.deliveryProcess?.phase1Description,
              'Align business requirements, workflows and technical architecture before engineering begins.'
            ),
            phase2Title: cleanText(
              curCustHub.deliveryProcess?.phase2Title,
              'Design & Engineering'
            ),
            phase2Description: cleanText(
              curCustHub.deliveryProcess?.phase2Description,
              'Shape intuitive interfaces and engineer quality-controlled workflows iteratively.'
            ),
            phase3Title: cleanText(
              curCustHub.deliveryProcess?.phase3Title,
              'Integration, Launch & Evolution'
            ),
            phase3Description: cleanText(
              curCustHub.deliveryProcess?.phase3Description,
              'Connect existing systems, validate readiness, deploy cleanly and evolve post-launch.'
            ),
            steps: [
              {
                title: 'Discover',
                description:
                  'Understand the business, users, processes, constraints and desired outcomes.',
              },
              {
                title: 'Define',
                description:
                  'Translate requirements into priorities, workflows, architecture and implementation scope.',
              },
              {
                title: 'Design',
                description:
                  'Shape the experience, system behaviour and solution architecture.',
              },
              {
                title: 'Build',
                description:
                  'Engineer the platform using an iterative, quality-controlled development process.',
              },
              {
                title: 'Integrate',
                description:
                  'Connect the solution with existing business systems, data and external services.',
              },
              {
                title: 'Launch',
                description:
                  'Validate, migrate, train and deploy with production-readiness checks.',
              },
              {
                title: 'Evolve',
                description:
                  'Support, improve and extend the solution as business requirements change.',
              },
            ],
          },
          proof: {
            heading:
              cleanText(curCustHub.proof?.heading) ||
              'Explore how custom engineering translates into operational results.',
            subtext: null,
            ctaLabel: 'Explore Custom Solution Case Studies',
            caseStudy:
              curCustHub.proof?.caseStudy?.documentId || fallbackCaseDocId,
          },
          finalCta: {
            heading: 'Discuss Your Custom Software Requirement',
            subtext: null,
            ctaLabel: 'Discuss Your Custom Software Requirement',
          },
        },
      });
      await custHubSvc.publish({ documentId: curCustHub.documentId });
      console.log('✓ Updated Custom Solutions Hub (verbatim Task 9A copy)');
    }

    // ── 5. Ready-to-Configure Hub ──
    const readyHubSvc = strapi.documents(
      'api::ready-to-configure-hub.ready-to-configure-hub'
    );
    const curReadyHub = await readyHubSvc.findFirst({
      status: 'draft',
      populate: {
        heroImage: true,
        whatItMeans: true,
        comparisonMatrix: true,
        proof: { populate: '*' },
        implementationFlow: { populate: '*' },
        finalCta: true,
      },
    });
    if (curReadyHub) {
      await readyHubSvc.update({
        documentId: curReadyHub.documentId,
        data: {
          heroHeading:
            'Start With a Proven Foundation. Configure It Around Your Business.',
          heroSubtext:
            'Not every implementation needs to begin from zero. Metaphi’s Ready-to-Configure solutions combine reusable software foundations with the flexibility to adapt workflows, modules, integrations and reporting around your operating model.',
          whatItMeans: [
            {
              title: 'Already Available',
              description:
                'Core workflows, modules and system foundations based on previous implementation experience.',
            },
            {
              title: 'Configurable',
              description:
                'Business rules, workflows, roles, reports and user journeys can be aligned to your organisation.',
            },
            {
              title: 'Extendable',
              description:
                'New functionality can be engineered where your requirements go beyond the existing foundation.',
            },
            {
              title: 'Integrable',
              description:
                'The solution can connect with your existing applications, devices and external platforms.',
            },
          ],
          comparisonMatrix: {
            heading: 'Different From SaaS',
            subtext:
              'More flexible than SaaS. Faster than starting completely from scratch.',
            saasColumn: 'Standard product with limited configuration.',
            readyColumn:
              'Reusable solution foundation with substantial business configuration and extension.',
            customColumn:
              'Designed primarily from your unique requirements.',
          },
          implementationFlow: {
            heading: 'Configure. Integrate. Validate. Launch.',
            subtext:
              'Assess → Configure → Integrate → Migrate → Train → Go Live',
            phase1Title: cleanText(
              curReadyHub.implementationFlow?.phase1Title,
              'Assessment & Configuration'
            ),
            phase1Description: cleanText(
              curReadyHub.implementationFlow?.phase1Description,
              'Map operational requirements against proven modules and configure core rules and workflows.'
            ),
            phase2Title: cleanText(
              curReadyHub.implementationFlow?.phase2Title,
              'Integration & Migration'
            ),
            phase2Description: cleanText(
              curReadyHub.implementationFlow?.phase2Description,
              'Connect existing ERPs, devices and third-party APIs while cleanly migrating business data.'
            ),
            phase3Title: cleanText(
              curReadyHub.implementationFlow?.phase3Title,
              'Enablement & Launch'
            ),
            phase3Description: cleanText(
              curReadyHub.implementationFlow?.phase3Description,
              'Train operational teams on configured dashboards and roll out into production reliably.'
            ),
            steps: [
              {
                title: 'Assess',
                description:
                  'Map your processes against the ready-to-configure foundation.',
              },
              {
                title: 'Configure',
                description:
                  'Align workflows, roles, rules and reports to your business.',
              },
              {
                title: 'Integrate',
                description:
                  'Connect accounting, ERP, CRM, devices and external APIs.',
              },
              {
                title: 'Migrate',
                description:
                  'Cleanly transition existing master and operational data.',
              },
              {
                title: 'Train',
                description:
                  'Onboard teams on configured workflows and dashboards.',
              },
              {
                title: 'Go Live',
                description:
                  'Launch with production support and ongoing evolution.',
              },
            ],
          },
          proof: {
            heading: 'Built from implementation experience—not theory.',
            subtext: null,
            ctaLabel: 'Explore Relevant Case Studies',
            caseStudy:
              curReadyHub.proof?.caseStudy?.documentId || fallbackCaseDocId,
          },
          finalCta: {
            heading: 'Request a Solution Walkthrough',
            subtext: null,
            ctaLabel: 'Request a Solution Walkthrough',
          },
        },
      });
      await readyHubSvc.publish({ documentId: curReadyHub.documentId });
      console.log('✓ Updated Ready-to-Configure Hub (verbatim Task 9A copy)');
    }

    console.log('\n🎉 TASK 9A HOME PAGE & CORE HUBS CLEANLY UPDATED!');
  } finally {
    await strapi.destroy();
  }
}

run().catch((err) => {
  console.error(
    'Seed 9A Error:',
    err.message,
    JSON.stringify(err.details, null, 2)
  );
  process.exit(1);
});
