/**
 * migrate-services-document-service.cjs
 *
 * Idempotent migration from legacy JSON fields to the 7 component lists using
 * the Strapi Document Service API (Strapi v5).
 *
 * Keyed by documentId, handling BOTH draft and published rows.
 * Default mode: --dry-run. Writes only with --apply.
 * Skips any list that is already non-empty (never appends or overwrites).
 * Maps only existing legacy items; unmappable items are logged and skipped.
 */

const { createStrapi } = require('@strapi/strapi');

const COMPONENT_MAPPINGS = [
  {
    targetList: 'challengesList',
    legacyKey: 'challenges',
    displayName: 'Challenges',
    validateAndMap: (item, idx) => {
      if (!item || typeof item !== 'object') return { valid: false, reason: `Item at index ${idx} is not an object` };
      if (!item.title || String(item.title).trim() === '') return { valid: false, reason: `Item at index ${idx} missing required 'title'` };
      return {
        valid: true,
        data: {
          title: String(item.title).trim(),
          solution: String(item.solution || '').trim(),
        },
      };
    },
  },
  {
    targetList: 'offeringsList',
    legacyKey: 'offerings',
    displayName: 'Offerings',
    validateAndMap: (item, idx) => {
      if (!item || typeof item !== 'object') return { valid: false, reason: `Item at index ${idx} is not an object` };
      if (!item.title || String(item.title).trim() === '') return { valid: false, reason: `Item at index ${idx} missing required 'title'` };
      return {
        valid: true,
        data: {
          title: String(item.title).trim(),
          description: String(item.description || '').trim(),
        },
      };
    },
  },
  {
    targetList: 'solutionTypesList',
    legacyKey: 'solutionTypes',
    altLegacyKey: 'solution_types',
    displayName: 'Solution Types',
    validateAndMap: (item, idx) => {
      if (!item || typeof item !== 'object') return { valid: false, reason: `Item at index ${idx} is not an object` };
      if (!item.title || String(item.title).trim() === '') return { valid: false, reason: `Item at index ${idx} missing required 'title'` };
      return {
        valid: true,
        data: {
          title: String(item.title).trim(),
          description: String(item.description || '').trim(),
        },
      };
    },
  },
  {
    targetList: 'businessFunctionsList',
    legacyKey: 'businessFunctions',
    altLegacyKey: 'business_functions',
    displayName: 'Business Functions',
    validateAndMap: (item, idx) => {
      if (!item || typeof item !== 'object') return { valid: false, reason: `Item at index ${idx} is not an object` };
      if (!item.title || String(item.title).trim() === '') return { valid: false, reason: `Item at index ${idx} missing required 'title'` };
      return {
        valid: true,
        data: {
          title: String(item.title).trim(),
          description: String(item.description || '').trim(),
        },
      };
    },
  },
  {
    targetList: 'processStepsList',
    legacyKey: 'process',
    displayName: 'Process Steps',
    validateAndMap: (item, idx) => {
      if (!item || typeof item !== 'object') return { valid: false, reason: `Item at index ${idx} is not an object` };
      if (!item.title || String(item.title).trim() === '') return { valid: false, reason: `Item at index ${idx} missing required 'title'` };
      return {
        valid: true,
        data: {
          title: String(item.title).trim(),
          description: String(item.description || '').trim(),
        },
      };
    },
  },
  {
    targetList: 'benefitsList',
    legacyKey: 'benefits',
    displayName: 'Benefits',
    validateAndMap: (item, idx) => {
      if (!item || typeof item !== 'object') return { valid: false, reason: `Item at index ${idx} is not an object` };
      if (!item.title || String(item.title).trim() === '') return { valid: false, reason: `Item at index ${idx} missing required 'title'` };
      return {
        valid: true,
        data: {
          title: String(item.title).trim(),
          description: String(item.description || '').trim(),
        },
      };
    },
  },
  {
    targetList: 'whyUsList',
    legacyKey: 'whyUs',
    altLegacyKey: 'why_us',
    displayName: 'Why Us',
    validateAndMap: (item, idx) => {
      if (!item || typeof item !== 'object') return { valid: false, reason: `Item at index ${idx} is not an object` };
      if (!item.title || String(item.title).trim() === '') return { valid: false, reason: `Item at index ${idx} missing required 'title'` };
      return {
        valid: true,
        data: {
          title: String(item.title).trim(),
          description: String(item.description || '').trim(),
        },
      };
    },
  },
];

async function run() {
  const isApply = process.argv.includes('--apply');
  const isDryRun = !isApply;

  console.log('========================================================================');
  console.log(`MIGRATION SCRIPT: Strapi Document Service API (Strapi v5)`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (default, read-only)' : 'APPLY (writing via Document Service)'}`);
  console.log('========================================================================\n');

  console.log('Bootstrapping Strapi instance...');
  const app = await createStrapi({ distDir: './dist' }).load();
  console.log('✓ Strapi bootstrapped successfully.\n');

  try {
    const populateFields = COMPONENT_MAPPINGS.map(m => m.targetList);

    const [draftEntries, publishedEntries] = await Promise.all([
      app.documents('api::service.service').findMany({
        status: 'draft',
        limit: 100,
        populate: populateFields,
      }),
      app.documents('api::service.service').findMany({
        status: 'published',
        limit: 100,
        populate: populateFields,
      }),
    ]);

    console.log(`Fetched ${draftEntries.length} draft entries and ${publishedEntries.length} published entries.\n`);

    // Group by documentId
    const docs = new Map();
    for (const d of draftEntries) {
      if (!docs.has(d.documentId)) {
        docs.set(d.documentId, { documentId: d.documentId, slug: d.slug, title: d.title, draft: null, published: null });
      }
      docs.get(d.documentId).draft = d;
    }
    for (const p of publishedEntries) {
      if (!docs.has(p.documentId)) {
        docs.set(p.documentId, { documentId: p.documentId, slug: p.slug, title: p.title, draft: null, published: null });
      }
      docs.get(p.documentId).published = p;
    }

    const docList = Array.from(docs.values()).sort((a, b) => a.slug.localeCompare(b.slug));

    const grandTotals = {
      challengesList: { draft: 0, published: 0 },
      offeringsList: { draft: 0, published: 0 },
      solutionTypesList: { draft: 0, published: 0 },
      businessFunctionsList: { draft: 0, published: 0 },
      processStepsList: { draft: 0, published: 0 },
      benefitsList: { draft: 0, published: 0 },
      whyUsList: { draft: 0, published: 0 },
      totalDraftItems: 0,
      totalPublishedItems: 0,
    };

    const skippedReasons = [];
    const executionPlan = [];

    console.log('PER-SERVICE DRY-RUN REPORT:');
    console.log('Service Slug                           | Status    | ch | of | st | bf | pr | be | wu | Total Items');
    console.log('---------------------------------------+-----------+----+----+----+----+----+----+----+------------');

    for (const item of docList) {
      const statuses = [
        { name: 'draft', entry: item.draft },
        { name: 'published', entry: item.published },
      ];

      for (const { name: statusName, entry } of statuses) {
        if (!entry) {
          console.log(`${item.slug.padEnd(38)} | ${statusName.padEnd(9)} |  - |  - |  - |  - |  - |  - |  - | (not present)`);
          continue;
        }

        const counts = {};
        const updatePayload = {};
        let rowTotal = 0;

        for (const mapping of COMPONENT_MAPPINGS) {
          const { targetList, legacyKey, altLegacyKey, validateAndMap, displayName } = mapping;

          // Rule: Skip if already non-empty
          const existingList = entry[targetList];
          if (Array.isArray(existingList) && existingList.length > 0) {
            counts[targetList] = 0;
            skippedReasons.push({
              service: item.slug,
              documentId: item.documentId,
              status: statusName,
              list: targetList,
              reason: `Already non-empty (${existingList.length} items present). Skipped to prevent overwrite/append.`,
            });
            continue;
          }

          // Read legacy source data from the entry (fallback to altLegacyKey if present)
          const rawLegacy = entry[legacyKey] || (altLegacyKey ? entry[altLegacyKey] : null);

          if (!Array.isArray(rawLegacy) || rawLegacy.length === 0) {
            counts[targetList] = 0;
            continue;
          }

          const validMapped = [];
          for (let idx = 0; idx < rawLegacy.length; idx++) {
            const rawItem = rawLegacy[idx];
            const result = validateAndMap(rawItem, idx);
            if (result.valid) {
              validMapped.push(result.data);
            } else {
              skippedReasons.push({
                service: item.slug,
                documentId: item.documentId,
                status: statusName,
                list: targetList,
                reason: `Unmappable item skipped: ${result.reason}`,
              });
            }
          }

          counts[targetList] = validMapped.length;
          rowTotal += validMapped.length;
          grandTotals[targetList][statusName] += validMapped.length;

          if (validMapped.length > 0) {
            updatePayload[targetList] = validMapped;
          }
        }

        if (statusName === 'draft') grandTotals.totalDraftItems += rowTotal;
        else grandTotals.totalPublishedItems += rowTotal;

        console.log(
          `${item.slug.padEnd(38)} | ${statusName.padEnd(9)} | ` +
          `${String(counts.challengesList).padStart(2)} | ` +
          `${String(counts.offeringsList).padStart(2)} | ` +
          `${String(counts.solutionTypesList).padStart(2)} | ` +
          `${String(counts.businessFunctionsList).padStart(2)} | ` +
          `${String(counts.processStepsList).padStart(2)} | ` +
          `${String(counts.benefitsList).padStart(2)} | ` +
          `${String(counts.whyUsList).padStart(2)} | ` +
          `${String(rowTotal).padStart(4)} items`
        );

        if (Object.keys(updatePayload).length > 0) {
          executionPlan.push({
            documentId: item.documentId,
            status: statusName,
            slug: item.slug,
            data: updatePayload,
            totalItems: rowTotal,
          });
        }
      }
    }

    console.log('---------------------------------------+-----------+----+----+----+----+----+----+----+------------');
    console.log(
      `TOTAL DRAFT ITEMS`.padEnd(51) + ` | ` +
      `${String(grandTotals.challengesList.draft).padStart(2)} | ` +
      `${String(grandTotals.offeringsList.draft).padStart(2)} | ` +
      `${String(grandTotals.solutionTypesList.draft).padStart(2)} | ` +
      `${String(grandTotals.businessFunctionsList.draft).padStart(2)} | ` +
      `${String(grandTotals.processStepsList.draft).padStart(2)} | ` +
      `${String(grandTotals.benefitsList.draft).padStart(2)} | ` +
      `${String(grandTotals.whyUsList.draft).padStart(2)} | ` +
      `${String(grandTotals.totalDraftItems).padStart(4)} items`
    );
    console.log(
      `TOTAL PUBLISHED ITEMS`.padEnd(51) + ` | ` +
      `${String(grandTotals.challengesList.published).padStart(2)} | ` +
      `${String(grandTotals.offeringsList.published).padStart(2)} | ` +
      `${String(grandTotals.solutionTypesList.published).padStart(2)} | ` +
      `${String(grandTotals.businessFunctionsList.published).padStart(2)} | ` +
      `${String(grandTotals.processStepsList.published).padStart(2)} | ` +
      `${String(grandTotals.benefitsList.published).padStart(2)} | ` +
      `${String(grandTotals.whyUsList.published).padStart(2)} | ` +
      `${String(grandTotals.totalPublishedItems).padStart(4)} items`
    );
    console.log(`\nGRAND TOTAL COMPONENT ITEMS TO CREATE: ${grandTotals.totalDraftItems + grandTotals.totalPublishedItems} (${grandTotals.totalDraftItems} draft + ${grandTotals.totalPublishedItems} published)\n`);

    if (skippedReasons.length > 0) {
      console.log(`SKIPPED ITEMS / LISTS LOG (${skippedReasons.length}):`);
      for (const s of skippedReasons) {
        console.log(`  - [${s.status}] ${s.service} -> ${s.list}: ${s.reason}`);
      }
      console.log('');
    } else {
      console.log('SKIPPED ITEMS: 0 items were skipped or unmappable. All items mapped cleanly.\n');
    }

    if (isDryRun) {
      console.log('DRY-RUN COMPLETE. No data was modified.');
      console.log('To execute this migration after approval, run:');
      console.log('  node scripts/migrate-services-document-service.cjs --apply\n');
      return;
    }

    // Apply mode
    console.log(`APPLYING MIGRATION (${executionPlan.length} document updates)...`);
    let successCount = 0;
    for (const plan of executionPlan) {
      console.log(`Updating [${plan.status}] ${plan.slug} (${plan.documentId}) with ${plan.totalItems} components...`);
      await app.documents('api::service.service').update({
        documentId: plan.documentId,
        status: plan.status,
        data: plan.data,
      });
      successCount++;
    }
    console.log(`\n✓ SUCCESS: Applied updates to ${successCount} entries via Strapi Document Service API.`);

  } finally {
    await app.destroy();
  }
}

run().catch(err => {
  console.error('Fatal error in migration runner:', err);
  process.exit(1);
});
