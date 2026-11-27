/**
 * scripts/reset-and-seed-industries-solutions.cjs
 *
 * Clears all rows from `industries` and `solutions` (and their link/component rows),
 * then cleanly seeds from `parsed_docs_seed.json` (10 Industries, 5 Custom Solutions,
 * 10 Ready-to-Configure Solutions, 2 SaaS Products + SaaS Hub) while preserving
 * existing uploaded media links (`heroImage`, etc.) and `caseStudies` relations.
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
  const t = (raw || '').trim().toLowerCase();
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
  const t = (raw || '').trim().toLowerCase();
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

function slugify(str) {
  return (str || '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function run() {
  const strapi = await createStrapi({
    appDir,
    distDir: path.join(appDir, 'dist'),
  }).load();

  try {
    const knex = strapi.db.connection;

    // ── 0. Snapshot existing media links & case-study relations by title ──
    const savedIndMedia = {}; // titleLower -> { field -> [fileId] }
    const savedSolMedia = {}; // titleLower -> { field -> [fileId] }
    const savedSolCaseStudies = {}; // solTitleLower -> Set<csDocumentId>

    const indMediaRows = await knex('files_related_mph as frm')
      .join('industries as i', function () {
        this.on('i.id', '=', 'frm.related_id').andOnVal('frm.related_type', '=', 'api::industry.industry');
      })
      .select('i.title', 'frm.field', 'frm.file_id', 'frm.order');

    for (const r of indMediaRows) {
      const k = (r.title || '').trim().toLowerCase();
      savedIndMedia[k] = savedIndMedia[k] || {};
      savedIndMedia[k][r.field] = savedIndMedia[k][r.field] || [];
      if (!savedIndMedia[k][r.field].includes(r.file_id)) {
        savedIndMedia[k][r.field].push(r.file_id);
      }
    }

    const solMediaRows = await knex('files_related_mph as frm')
      .join('solutions as s', function () {
        this.on('s.id', '=', 'frm.related_id').andOnVal('frm.related_type', '=', 'api::solution.solution');
      })
      .select('s.title', 'frm.field', 'frm.file_id', 'frm.order');

    for (const r of solMediaRows) {
      const k = (r.title || '').trim().toLowerCase();
      savedSolMedia[k] = savedSolMedia[k] || {};
      savedSolMedia[k][r.field] = savedSolMedia[k][r.field] || [];
      if (!savedSolMedia[k][r.field].includes(r.file_id)) {
        savedSolMedia[k][r.field].push(r.file_id);
      }
    }

    const csSolRows = await knex('case_studies_solutions_lnk as l')
      .join('case_studies as c', 'c.id', 'l.case_study_id')
      .join('solutions as s', 's.id', 'l.solution_id')
      .select('c.document_id as cs_doc_id', 's.title as sol_title');

    for (const r of csSolRows) {
      const k = (r.sol_title || '').trim().toLowerCase();
      savedSolCaseStudies[k] = savedSolCaseStudies[k] || new Set();
      savedSolCaseStudies[k].add(r.cs_doc_id);
    }

    // ── 1. Clear industries and solutions completely ──
    const indService = strapi.documents('api::industry.industry');
    const solService = strapi.documents('api::solution.solution');

    const oldInds = await indService.findMany({ status: 'draft', limit: 500 });
    for (const doc of oldInds) {
      await indService.delete({ documentId: doc.documentId });
    }
    const oldSols = await solService.findMany({ status: 'draft', limit: 500 });
    for (const doc of oldSols) {
      await solService.delete({ documentId: doc.documentId });
    }

    // Safety sweep in SQL in case any orphan rows/links remained
    await knex('files_related_mph').whereIn('related_type', ['api::industry.industry', 'api::solution.solution']).del();
    await knex('industries').del();
    await knex('solutions').del();
    console.log(`✓ Cleared ${oldInds.length} old industries and ${oldSols.length} old solutions`);

    // ── 2. Ensure FAQ Category & Upsert FAQs ──
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
        let match = allExistingFaqs.find(
          f =>
            f.question.trim().toLowerCase() === qTrim.toLowerCase() &&
            (f.answer || '').trim().toLowerCase() === answer.trim().toLowerCase()
        );
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

    // ── 3. Seed 10 Industries cleanly ──
    const indMap = {}; // title -> documentId
    for (const ind of seedData.industries) {
      const faqIds = await upsertFaqs(ind.faqs);
      const media = savedIndMedia[ind.title.trim().toLowerCase()] || {};
      const payload = {
        title: ind.title,
        slug: slugify(ind.title),
        order: ind.order,
        summary: (ind.summary || '').slice(0, 295),
        heroHeadline: ind.heroHeadline,
        heroSubtext: ind.heroSubtext,
        ctaPrimaryLabel: ind.ctaPrimaryLabel,
        ctaSecondaryLabel: ind.ctaSecondaryLabel,
        industryContextHeading: ind.industryContextHeading,
        industryContext: ind.industryContext,
        commonChallengesHeading: ind.commonChallengesHeading,
        commonChallenges: ind.commonChallenges,
        techOpportunitiesHeading: ind.techOpportunitiesHeading,
        techOpportunities: ind.techOpportunities,
        howMetaphiHelpsHeading: ind.howMetaphiHelpsHeading,
        howMetaphiHelps: ind.howMetaphiHelps,
        relevantCustomSolutionsHeading: ind.relevantCustomSolutionsHeading,
        relevantCustomSolutions: ind.relevantCustomSolutions,
        readyToConfigureSolutionsHeading: ind.readyToConfigureSolutionsHeading,
        keyUseCasesHeading: ind.keyUseCasesHeading,
        keyUseCases: ind.keyUseCases,
        aiOpportunitiesHeading: ind.aiOpportunitiesHeading,
        aiOpportunities: ind.aiOpportunities,
        integrationsHeading: ind.integrationsHeading,
        integrations: ind.integrations,
        caseStudiesHeading: ind.caseStudiesHeading,
        transformationApproachHeading: ind.transformationApproachHeading,
        transformationApproachText: ind.transformationApproachText,
        transformationApproachCtaLabel: ind.transformationApproachCtaLabel,
        playbookHeading: ind.playbookHeading,
        playbookSubtext: ind.playbookSubtext,
        playbookCtaLabel: ind.playbookCtaLabel,
        faqs: faqIds,
        primarySeoTheme: ind.primarySeoTheme,
        seo: ind.seo,
        ...(media.heroImage?.[0] ? { heroImage: media.heroImage[0] } : {}),
        ...(media.howMetaphiHelpsImage?.[0] ? { howMetaphiHelpsImage: media.howMetaphiHelpsImage[0] } : {}),
        ...(media.readyToConfigureSolutionsImage?.[0] ? { readyToConfigureSolutionsImage: media.readyToConfigureSolutionsImage[0] } : {}),
      };

      for (const key of Object.keys(payload)) {
        if (payload[key] === undefined) delete payload[key];
      }

      const doc = await indService.create({ data: payload });
      await indService.publish({ documentId: doc.documentId });
      indMap[ind.title] = doc.documentId;
      console.log(`✓ Industry: ${ind.title} (${doc.documentId})`);
    }

    // ── 4. Seed All 17 Solutions cleanly (5 Custom + 10 Ready + 2 SaaS) ──
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
      const k = sol.title.trim().toLowerCase();
      const media = savedSolMedia[k] || {};
      const csDocIds = savedSolCaseStudies[k] ? [...savedSolCaseStudies[k]] : [];

      const payload = {
        title: sol.title,
        slug: slugify(sol.title),
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
        industriesHeading: sol.industriesHeading,
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
        whoItIsForHeading: sol.whoItIsForHeading,
        whoItIsFor: sol.whoItIsFor,
        solutionOverviewHeading: sol.solutionOverviewHeading,
        solutionOverview: sol.solutionOverview,
        exampleWorkflowHeading: sol.exampleWorkflowHeading,
        exampleWorkflow: sol.exampleWorkflow,
        coreModulesHeading: sol.coreModulesHeading,
        coreModules: sol.coreModules,
        configurationHeading: sol.configurationHeading,
        whatIsAlreadyAvailableHeading: sol.whatIsAlreadyAvailableHeading,
        whatIsAlreadyAvailable: sol.whatIsAlreadyAvailable,
        whatCanBeConfiguredHeading: sol.whatCanBeConfiguredHeading,
        whatCanBeConfigured: sol.whatCanBeConfigured,
        whatCanBeExtendedHeading: sol.whatCanBeExtendedHeading,
        whatCanBeExtended: sol.whatCanBeExtended,
        whoItIsForText: sol.whoItIsForText,
        notRightFitHeading: sol.notRightFitHeading,
        notRightFitText: sol.notRightFitText,
        relatedResourcesHeading: sol.relatedResourcesHeading,
        relatedResources: sol.relatedResources,
        faqs: faqIds,
        caseStudiesHeading: sol.caseStudiesHeading,
        caseStudies: csDocIds.length ? csDocIds : undefined,
        finalCtaHeading: sol.finalCtaHeading,
        finalCtaText: sol.finalCtaText,
        finalCtaButtonLabel: sol.finalCtaButtonLabel,
        finalCtaSecondaryLabel: sol.finalCtaSecondaryLabel,
        primarySeoTheme: sol.primarySeoTheme,
        seo: sol.seo,
        ...(media.heroImage?.[0] ? { heroImage: media.heroImage[0] } : {}),
        ...(media.productScreenshots?.length ? { productScreenshots: media.productScreenshots } : {}),
      };

      for (const key of Object.keys(payload)) {
        if (payload[key] === undefined) delete payload[key];
      }

      const doc = await solService.create({ data: payload });
      await solService.publish({ documentId: doc.documentId });
      solMap[sol.title] = doc.documentId;
      console.log(`✓ Solution [${sol.modelType}]: ${sol.title} (${doc.documentId})`);
    }

    // ── 5. Link readyToConfigureSolutions on Industries ──
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

    // ── 6. Update SaaS Products Hub ──
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

    // ── 7. Verify final published counts ──
    const finalInds = await indService.findMany({ status: 'published', limit: 100 });
    const finalSols = await solService.findMany({ status: 'published', limit: 100 });
    console.log(`\n🎉 DONE! Published Industries: ${finalInds.length}, Published Solutions: ${finalSols.length}`);
  } finally {
    await strapi.destroy();
  }
}

run().catch((err) => {
  console.error('Reset & Seed Error:', err);
  process.exit(1);
});
