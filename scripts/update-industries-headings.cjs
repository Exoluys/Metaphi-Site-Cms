/**
 * scripts/update-industries-headings.cjs
 *
 * Populates the newly added section heading & CTA label fields on all Industry
 * entries (without overwriting existing content, images, or relations) and
 * adds SEO metadata to Industries Hub.
 */

const { createStrapi } = require('@strapi/strapi');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(appDir, '.env') });

const DEFAULT_INDUSTRY_HEADINGS = {
  industryContextHeading: 'Navigating operational complexity and legacy friction.',
  techOpportunitiesHeading: 'Technology Opportunities',
  commonChallengesHeading: 'Common Operational Challenges',
  howMetaphiHelpsHeading: 'How Metaphi Helps',
  relevantCustomSolutionsHeading: 'Relevant Custom Solutions',
  readyToConfigureSolutionsHeading: 'Ready-to-Configure Platforms',
  keyUseCasesHeading: 'Key Operational Use Cases',
  aiOpportunitiesHeading: 'AI & Automation Opportunities',
  integrationsHeading: 'Integration Opportunities',
  caseStudiesHeading: 'Relevant Case Studies',
  transformationApproachCtaLabel: 'Discuss Your Approach',
  playbookCtaLabel: 'Request Playbook',
};

async function run() {
  const strapi = await createStrapi({
    appDir,
    distDir: path.join(appDir, 'dist'),
  }).load();

  try {
    // 1. Update Industries Hub SEO if missing
    const indHubSvc = strapi.documents('api::industries-hub.industries-hub');
    const hub = await indHubSvc.findFirst({
      status: 'draft',
      populate: ['seo'],
    });

    if (hub) {
      const hasSeo = hub.seo && (hub.seo.metaTitle || hub.seo.metaDescription);
      if (!hasSeo) {
        await indHubSvc.update({
          documentId: hub.documentId,
          data: {
            seo: {
              metaTitle: 'Industry-Specific Software & AI Solutions | Metaphi',
              metaDescription:
                hub.heroSubtext ||
                'Explore how Metaphi engineers custom software, AI, and connected platforms across industries.',
            },
          },
        });
        await indHubSvc.publish({ documentId: hub.documentId });
        console.log('✓ Updated Industries Hub SEO');
      } else {
        console.log('• Industries Hub SEO already present, skipped');
      }
    }

    // 2. Update all Industries with section headings & CTA labels where missing
    const indSvc = strapi.documents('api::industry.industry');
    const industries = await indSvc.findMany({ status: 'draft', limit: 100 });

    for (const ind of industries) {
      const patch = {};
      for (const [key, defaultVal] of Object.entries(DEFAULT_INDUSTRY_HEADINGS)) {
        if (!ind[key] || String(ind[key]).trim() === '') {
          patch[key] = defaultVal;
        }
      }

      if (Object.keys(patch).length > 0) {
        await indSvc.update({
          documentId: ind.documentId,
          data: patch,
        });
        await indSvc.publish({ documentId: ind.documentId });
        console.log(
          `✓ Updated Industry: ${ind.title} (${Object.keys(patch).length} fields)`
        );
      } else {
        console.log(`• Industry ${ind.title} already has all headings`);
      }
    }

    console.log('\n🎉 Industries Strapi update complete!');
  } finally {
    await strapi.destroy();
  }
}

run().catch((err) => {
  console.error('Update Error:', err);
  process.exit(1);
});
