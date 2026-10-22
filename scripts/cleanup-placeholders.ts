import { createStrapi } from '@strapi/strapi';

async function cleanup() {
  console.log('Initializing Strapi instance for Document Service cleanup...');
  const app = await createStrapi({ distDir: './dist' }).load();

  console.log('Fetching all 27 services with Document Service...');
  const allServices = await app.documents('api::service.service').findMany({
    fields: ['title', 'slug', 'body', 'documentId'],
    populate: {
      sections: true,
      challengesList: true,
      offeringsList: true,
      solutionTypesList: true,
      businessFunctionsList: true,
      processStepsList: true,
      benefitsList: true,
      whyUsList: true,
      industryContextsList: {
        populate: ['industry'],
      },
      statsList: true,
      techGroupsList: true,
      assurancesList: true,
      complianceList: true,
      relatedServicesList: true,
      caseStudiesList: true,
      category: true,
    },
  });

  console.log(`Retrieved ${allServices.length} distinct service documents.`);

  for (const s of allServices) {
    const docId = s.documentId;
    console.log(`Processing service: "${s.title}" (${s.slug}, docId: ${docId})`);

    // Clean body
    let cleanedBody = s.body || '';
    if (cleanedBody) {
      const paragraphs = cleanedBody.split(/\n\n+/);
      const filteredParagraphs = paragraphs.filter(
        (p: string) => !p.trim().startsWith('Placeholder content:')
      );
      cleanedBody = filteredParagraphs.join('\n\n');
    }

    // Clean challengesList
    const cleanedChallenges = Array.isArray(s.challengesList)
      ? s.challengesList.filter(
          (c: any) => !c.solution?.trim().startsWith('Placeholder content:')
        )
      : [];

    // Clean offeringsList
    const cleanedOfferings = Array.isArray(s.offeringsList)
      ? s.offeringsList.filter(
          (o: any) => !o.description?.trim().startsWith('Placeholder content:')
        )
      : [];

    // Clean solutionTypesList
    const cleanedSolutionTypes = Array.isArray(s.solutionTypesList)
      ? s.solutionTypesList.filter(
          (st: any) => !st.description?.trim().startsWith('Placeholder content:')
        )
      : [];

    // Clean businessFunctionsList
    const cleanedBusinessFunctions = Array.isArray(s.businessFunctionsList)
      ? s.businessFunctionsList.filter(
          (bf: any) => !bf.description?.trim().startsWith('Placeholder content:')
        )
      : [];

    // Clean processStepsList
    const cleanedProcessSteps = Array.isArray(s.processStepsList)
      ? s.processStepsList.filter(
          (ps: any) => !ps.description?.trim().startsWith('Placeholder content:')
        )
      : [];

    // Clean benefitsList
    const cleanedBenefits = Array.isArray(s.benefitsList)
      ? s.benefitsList.filter(
          (b: any) => !b.description?.trim().startsWith('Placeholder content:')
        )
      : [];

    // Clean whyUsList
    const cleanedWhyUs = Array.isArray(s.whyUsList)
      ? s.whyUsList.filter(
          (w: any) => !w.description?.trim().startsWith('Placeholder content:')
        )
      : [];

    // Clean industryContextsList
    const cleanedIndustryContexts = Array.isArray(s.industryContextsList)
      ? s.industryContextsList.filter((ic: any) => {
          const isPhBlurb = ic.blurb?.trim().startsWith('Placeholder content:');
          const isPhBullets = ic.bullets?.trim().startsWith('Placeholder content:');
          return !isPhBlurb && !isPhBullets;
        })
      : [];

    // Prepare update payload via Document Service
    const updateData: any = {
      body: cleanedBody,
      sections: [], // Clear all legacy sections
      challengesList: cleanedChallenges,
      offeringsList: cleanedOfferings,
      solutionTypesList: cleanedSolutionTypes,
      businessFunctionsList: cleanedBusinessFunctions,
      processStepsList: cleanedProcessSteps,
      benefitsList: cleanedBenefits,
      whyUsList: cleanedWhyUs,
      industryContextsList: cleanedIndustryContexts,
    };

    // Update draft version
    await app.documents('api::service.service').update({
      documentId: docId,
      data: updateData,
    });

    // Publish to update published version identically
    await app.documents('api::service.service').publish({
      documentId: docId,
    });

    console.log(`  ✓ Updated and published "${s.slug}".`);
  }

  console.log('All 27 services cleaned successfully via Document Service API.');
  process.exit(0);
}

cleanup().catch((err) => {
  console.error('Cleanup failed:', err);
  process.exit(1);
});
