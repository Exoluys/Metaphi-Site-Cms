/**
 * scripts/seed-docs.cjs
 *
 * Seeds Task 9B (10 Industries), Task 9C (5 Custom Solutions),
 * Task 9D (10 Ready-to-Configure Solutions), and Task 9E (SaaS Hub + Stockiphi + Taskiphi)
 * strictly preserving any existing images (leaving missing images empty).
 */

const { createStrapi } = require('@strapi/strapi');
const fs = require('fs');
const path = require('path');

const appDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(appDir, '.env') });

const seedData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'parsed_docs_seed.json'), 'utf8')
);

function mapIndustryTitle(raw) {
  const t = raw.trim().toLowerCase();
  if (t.includes('manufactur')) return 'Manufacturing';
  if (t.includes('healthcare') || t.includes('diagnostic') || t.includes('lifesciences')) return 'Healthcare & Diagnostics';
  if (t.includes('logistics') || t.includes('3pl')) return 'Logistics & 3PL';
  if (t.includes('fintech') || t.includes('financial')) return 'Financial Services & FinTech';
  if (t.includes('professional')) return 'Professional Services';
  if (t.includes('retail') || t.includes('ecommerce')) return 'Retail & Ecommerce';
  if (t.includes('consumer') || t.includes('marketplace')) return 'Consumer Platforms & Marketplaces';
  if (t.includes('association') || t.includes('communit') || t.includes('membership')) return 'Associations & Communities';
  if (t.includes('education') || t.includes('training')) return 'Education & Training';
  if (t.includes('government') || t.includes('public')) return 'Government & Public Sector';
  return null;
}

function mapReadyTitle(raw) {
  const t = raw.trim().toLowerCase();
  if (t.includes('manufacturing')) return 'Manufacturing Operations Management';
  if (t.includes('inventory')) return 'Inventory & Distribution Management';
  if (t.includes('warehouse') || t.includes('logistics')) return 'Warehouse & Logistics Management';
  if (t.includes('laboratory') || t.includes('lims')) return 'Laboratory Information Management System';
  if (t.includes('sales force')) return 'Sales Force Automation';
  if (t.includes('project')) return 'Project & Service Management';
  if (t.includes('customer portal')) return 'Customer Portal';
  if (t.includes('association') || t.includes('membership')) return 'Association & Membership Management';
  if (t.includes('financial')) return 'Financial Operations Management';
  if (t.includes('healthcare')) return 'Healthcare Operations Management';
  return null;
}

async function run() {
  const strapi = await createStrapi({
    appDir,
    distDir: path.join(appDir, 'dist'),
  }).load();

  try {
    // ── 1. Ensure FAQ Category exists ──
    const faqCatService = strapi.documents('api::faq-category.faq-category');
    const existingCats = await faqCatService.findMany({ status: 'published' });
    let generalCat = existingCats.find(c => c.name === 'Solutions & Industries') || existingCats[0];
    if (!generalCat) {
      generalCat = await faqCatService.create({
        data: { name: 'Solutions & Industries', order: 5 },
      });
      await faqCatService.publish({ documentId: generalCat.documentId });
    }

    const faqService = strapi.documents('api::faq.faq');
    const allExistingFaqs = await faqService.findMany({ status: 'draft', limit: 500 });

    async function upsertFaqs(faqList) {
      const ids = [];
      for (let i = 0; i < (faqList || []).length; i++) {
        const { question, answer } = faqList[i];
        if (!question || !answer) continue;
        const qTrim = question.slice(0, 160);
        let match = allExistingFaqs.find(f => f.question.trim().toLowerCase() === qTrim.toLowerCase());
        if (match) {
          await faqService.update({
            documentId: match.documentId,
            data: { question: qTrim, answer },
          });
          await faqService.publish({ documentId: match.documentId });
          ids.push(match.documentId);
        } else {
          const created = await faqService.create({
            data: { question: qTrim, answer, faqCategory: generalCat.documentId, order: i + 1 },
          });
          await faqService.publish({ documentId: created.documentId });
          allExistingFaqs.push(created);
          ids.push(created.documentId);
        }
      }
      return ids;
    }

    // ── 2. Upsert 10 Industries (preserving existing heroImage) ──
    const indService = strapi.documents('api::industry.industry');
    const existingInds = await indService.findMany({ status: 'draft', limit: 100 });
    const indMap = {}; // title -> documentId

    for (const ind of seedData.industries) {
      const faqIds = await upsertFaqs(ind.faqs);
      const match = existingInds.find(
        x => x.title.trim().toLowerCase() === ind.title.trim().toLowerCase()
      );
      const payload = {
        title: ind.title,
        order: ind.order,
        summary: (ind.summary || '').slice(0, 295),
        heroHeadline: ind.heroHeadline,
        heroSubtext: ind.heroSubtext,
        ctaPrimaryLabel: ind.ctaPrimaryLabel,
        ctaSecondaryLabel: ind.ctaSecondaryLabel,
        industryContext: ind.industryContext,
        commonChallenges: ind.commonChallenges,
        techOpportunities: ind.techOpportunities,
        howMetaphiHelps: ind.howMetaphiHelps,
        relevantCustomSolutions: ind.relevantCustomSolutions,
        keyUseCases: ind.keyUseCases,
        aiOpportunities: ind.aiOpportunities,
        integrations: ind.integrations,
        transformationApproachHeading: ind.transformationApproachHeading,
        transformationApproachText: ind.transformationApproachText,
        playbookHeading: ind.playbookHeading,
        playbookSubtext: ind.playbookSubtext,
        faqs: faqIds,
        primarySeoTheme: ind.primarySeoTheme,
        seo: ind.seo,
      };

      let doc;
      if (match) {
        doc = await indService.update({ documentId: match.documentId, data: payload });
      } else {
        doc = await indService.create({ data: payload });
      }
      await indService.publish({ documentId: doc.documentId });
      indMap[ind.title] = doc.documentId;
      console.log(`✓ Industry: ${ind.title} (${doc.documentId})`);
    }

    // ── 3. Upsert All 17 Solutions (5 Custom + 10 Ready + 2 SaaS, preserving existing images) ──
    const solService = strapi.documents('api::solution.solution');
    const existingSols = await solService.findMany({ status: 'draft', limit: 100 });
    const solMap = {}; // title -> documentId

    const allSolutions = [
      ...seedData.customSolutions,
      ...seedData.readySolutions,
      ...seedData.saasProducts,
    ];

    for (const sol of allSolutions) {
      const faqIds = await upsertFaqs(sol.faqs);
      const indIds = [...new Set(
        (sol.industryTitles || [])
          .map(mapIndustryTitle)
          .filter(Boolean)
          .map(t => indMap[t])
          .filter(Boolean)
      )];

      const match = existingSols.find(
        x => x.title.trim().toLowerCase() === sol.title.trim().toLowerCase()
      );

      const payload = {
        title: sol.title,
        modelType: sol.modelType,
        order: sol.order,
        heroHeadline: sol.heroHeadline,
        summary: sol.summary,
        ctaLabel: sol.ctaLabel,
        ctaSecondaryLabel: sol.ctaSecondaryLabel,
        problemHeading: sol.problemHeading,
        problemText: sol.problemText,
        problemItems: sol.problemItems,
        offeringsHeading: sol.offeringsHeading,
        offerings: sol.offerings,
        useCasesHeading: sol.useCasesHeading,
        useCasesSubtext: sol.useCasesSubtext,
        useCases: sol.useCases,
        outcomesHeading: sol.outcomesHeading,
        outcomesSubtext: sol.outcomesSubtext,
        outcomes: sol.outcomes,
        industries: indIds,
        approachHeading: sol.approachHeading,
        approachSubtext: sol.approachSubtext,
        approachSteps: sol.approachSteps,
        capabilitiesHeading: sol.capabilitiesHeading,
        capabilitiesSubtext: sol.capabilitiesSubtext,
        capabilities: sol.capabilities,
        techApproachHeading: sol.techApproachHeading,
        techApproachText: sol.techApproachText,
        techApproachItems: sol.techApproachItems,
        aiOpportunitiesHeading: sol.aiOpportunitiesHeading,
        aiOpportunitiesSubtext: sol.aiOpportunitiesSubtext,
        aiOpportunities: sol.aiOpportunities,
        secondaryNarrativeHeading: sol.secondaryNarrativeHeading,
        secondaryNarrativeText: sol.secondaryNarrativeText,
        modernisationHeading: sol.modernisationHeading,
        modernisationSubtext: sol.modernisationSubtext,
        modernisationItems: sol.modernisationItems,
        whoItIsFor: sol.whoItIsFor,
        solutionOverview: sol.solutionOverview,
        exampleWorkflow: sol.exampleWorkflow,
        coreModules: sol.coreModules,
        whatIsAlreadyAvailable: sol.whatIsAlreadyAvailable,
        whatCanBeConfigured: sol.whatCanBeConfigured,
        whatCanBeExtended: sol.whatCanBeExtended,
        whoItIsForText: sol.whoItIsForText,
        notRightFitHeading: sol.notRightFitHeading,
        notRightFitText: sol.notRightFitText,
        relatedResources: sol.relatedResources,
        faqs: faqIds,
        finalCtaHeading: sol.finalCtaHeading,
        finalCtaButtonLabel: sol.finalCtaButtonLabel,
        finalCtaSecondaryLabel: sol.finalCtaSecondaryLabel,
        primarySeoTheme: sol.primarySeoTheme,
        seo: sol.seo,
      };

      // Clean undefined keys so existing fields aren't cleared unintentionally if omitted
      for (const k of Object.keys(payload)) {
        if (payload[k] === undefined) delete payload[k];
      }

      let doc;
      if (match) {
        doc = await solService.update({ documentId: match.documentId, data: payload });
      } else {
        doc = await solService.create({ data: payload });
      }
      await solService.publish({ documentId: doc.documentId });
      solMap[sol.title] = doc.documentId;
      console.log(`✓ Solution [${sol.modelType}]: ${sol.title} (${doc.documentId})`);
    }

    // ── 4. Link readyToConfigureSolutions on Industries ──
    for (const ind of seedData.industries) {
      const readyIds = [...new Set(
        (ind.readyToConfigureTitles || [])
          .map(mapReadyTitle)
          .filter(Boolean)
          .map(t => solMap[t])
          .filter(Boolean)
      )];
      if (readyIds.length > 0 && indMap[ind.title]) {
        await indService.update({
          documentId: indMap[ind.title],
          data: { readyToConfigureSolutions: readyIds },
        });
        await indService.publish({ documentId: indMap[ind.title] });
      }
    }

    // ── 5. Update SaaS Products Hub (preserving existing heroImage) ──
    const saasHubService = strapi.documents('api::saas-products-hub.saas-products-hub');
    const existingHub = await saasHubService.findFirst({ status: 'draft' });
    if (existingHub) {
      const hubPayload = {
        ...seedData.saasHub,
        otherModels: seedData.saasHub.otherModels
          ? {
              ...seedData.saasHub.otherModels,
              items: (seedData.saasHub.otherModels.items || []).slice(-2),
            }
          : undefined,
      };
      await saasHubService.update({
        documentId: existingHub.documentId,
        data: hubPayload,
      });
      await saasHubService.publish({ documentId: existingHub.documentId });
      console.log('✓ Updated SaaS Products Hub');
    }

    console.log('\n🎉 ALL DOCS SEEDED & PUBLISHED SUCCESSFULLY (existing images preserved)!');
  } finally {
    await strapi.destroy();
  }
}

run().catch((err) => {
  console.error('Seed Error:', err);
  process.exit(1);
});
