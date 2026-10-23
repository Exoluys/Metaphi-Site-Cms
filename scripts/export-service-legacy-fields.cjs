/**
 * export-service-legacy-fields.cjs
 * 
 * Exports ALL 16 legacy JSON fields for every service row (draft + published)
 * to metaphi-cms/removed-service-legacy-fields.json
 * 
 * Also reports per-service comparison between legacy JSON and component lists
 * for the 5 fields already migrated to components.
 *
 * Run: node scripts/export-service-legacy-fields.cjs
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DB = 'postgres://postgres:J%40i123987@localhost:5432/metaphi_cms';

const LEGACY_COLS = [
  'stats',
  'challenges',
  'offerings',
  'solution_types',
  'case_studies',
  'tags',
  'outcomes',
  'business_functions',
  'process',
  'assurances',
  'compliance',
  'tech_groups',
  'benefits',
  'industries',
  'why_us',
  'related_services',
];

// Component data by component_type, keyed as entity_id -> array of component rows
async function fetchComponentsByType(client, componentType) {
  const tableMap = {
    'service.stat':             'components_service_stats',
    'service.challenge':        'components_service_challenges',
    'service.offering':         'components_service_offerings',
    'service.solution-type':    'components_service_solution_types',
    'service.business-function':'components_service_business_functions',
    'service.process-step':     'components_service_process_steps',
    'service.benefit':          'components_service_benefits',
    'service.why-us':           'components_service_why_uses',
    'service.assurance':        'components_service_assurances',
    'service.compliance-badge': 'components_service_compliance_badges',
    'service.tech-group':       'components_service_tech_groups',
    'service.industry-context': 'components_service_industry_contexts',
  };

  // Get entity_id -> component_id links from services_cmps
  const linksRes = await client.query(
    'SELECT entity_id, cmp_id, field FROM services_cmps WHERE component_type = $1 ORDER BY entity_id, "order" ASC',
    [componentType]
  );

  const table = tableMap[componentType];
  if (!table || linksRes.rows.length === 0) {
    return {};
  }

  const componentIds = linksRes.rows.map(r => r.cmp_id);

  const compRes = await client.query(
    `SELECT * FROM ${table} WHERE id = ANY($1)`,
    [componentIds]
  );

  const compById = {};
  for (const row of compRes.rows) {
    compById[row.id] = row;
  }

  const result = {};
  for (const link of linksRes.rows) {
    if (!result[link.entity_id]) result[link.entity_id] = [];
    const comp = compById[link.cmp_id];
    if (comp) result[link.entity_id].push(comp);
  }

  return result;
}

async function main() {
  const client = new Client({ connectionString: DB });
  await client.connect();

  // 1. Get all service rows (draft + published)
  const svcRes = await client.query(`
    SELECT id, document_id, slug, title, published_at,
      ${LEGACY_COLS.join(', ')}
    FROM services
    ORDER BY document_id, id ASC
  `);

  console.log(`\nTotal service rows (draft+published): ${svcRes.rows.length}`);

  // 2. Build export object
  const exportData = {
    exportedAt: new Date().toISOString(),
    totalRows: svcRes.rows.length,
    publishedRows: svcRes.rows.filter(r => r.published_at).length,
    draftRows: svcRes.rows.filter(r => !r.published_at).length,
    services: svcRes.rows.map(row => ({
      id: row.id,
      documentId: row.document_id,
      slug: row.slug,
      title: row.title,
      isDraft: !row.published_at,
      legacyFields: {
        stats: row.stats,
        challenges: row.challenges,
        offerings: row.offerings,
        solutionTypes: row.solution_types,
        caseStudies: row.case_studies,
        tags: row.tags,
        outcomes: row.outcomes,
        businessFunctions: row.business_functions,
        process: row.process,
        assurances: row.assurances,
        compliance: row.compliance,
        techGroups: row.tech_groups,
        benefits: row.benefits,
        industries: row.industries,
        whyUs: row.why_us,
        relatedServices: row.related_services,
      },
    })),
  };

  const outPath = path.resolve(__dirname, '../removed-service-legacy-fields.json');
  fs.writeFileSync(outPath, JSON.stringify(exportData, null, 2), 'utf8');
  console.log(`\n✓ Exported to ${outPath}`);
  const backupOutPath = path.resolve(__dirname, '../backups/removed-service-legacy-fields.json');
  fs.writeFileSync(backupOutPath, JSON.stringify(exportData, null, 2), 'utf8');

  // 3. Compare legacy vs components for 5 already-migrated fields
  // Only check published rows (the canonical 27)
  const publishedRows = svcRes.rows.filter(r => r.published_at);

  // Fetch component data for the 5 migrated fields
  const statsComps   = await fetchComponentsByType(client, 'service.stat');
  const assureComps  = await fetchComponentsByType(client, 'service.assurance');
  const compliComps  = await fetchComponentsByType(client, 'service.compliance-badge');
  const techComps    = await fetchComponentsByType(client, 'service.tech-group');
  const indComps     = await fetchComponentsByType(client, 'service.industry-context');

  console.log('\n════════════════════════════════════════════════════════════');
  console.log('COMPARISON: Legacy JSON vs Component Lists (5 migrated fields)');
  console.log('════════════════════════════════════════════════════════════');
  console.log('Columns: slug | stats L/C | assurances L/C | compliance L/C | techGroups L/C | industryContexts L/C');
  console.log('(L = legacy count, C = component count, ≠ = mismatch)\n');

  let mismatches = 0;

  for (const row of publishedRows) {
    const legStats   = Array.isArray(row.stats)      ? row.stats.length      : 0;
    const legAssure  = Array.isArray(row.assurances)  ? row.assurances.length  : 0;
    const legCompli  = Array.isArray(row.compliance)  ? row.compliance.length  : 0;
    const legTech    = Array.isArray(row.tech_groups) ? row.tech_groups.length : 0;
    const legInd     = Array.isArray(row.industries)  ? row.industries.length  : 0;

    const cmpStats   = (statsComps[row.id]  || []).length;
    const cmpAssure  = (assureComps[row.id] || []).length;
    const cmpCompli  = (compliComps[row.id] || []).length;
    const cmpTech    = (techComps[row.id]   || []).length;
    const cmpInd     = (indComps[row.id]    || []).length;

    const statsMark   = legStats  === cmpStats  ? '✓' : '≠';
    const assureMark  = legAssure === cmpAssure ? '✓' : '≠';
    const compliMark  = legCompli === cmpCompli ? '✓' : '≠';
    const techMark    = legTech   === cmpTech   ? '✓' : '≠';
    const indMark     = legInd    === cmpInd    ? '✓' : '≠';

    const hasMismatch = [statsMark, assureMark, compliMark, techMark, indMark].some(m => m === '≠');
    if (hasMismatch) mismatches++;

    const flag = hasMismatch ? '  ← MISMATCH' : '';
    console.log(
      `${row.slug.padEnd(38)} | stats ${legStats}/${cmpStats}${statsMark} | assur ${legAssure}/${cmpAssure}${assureMark} | compl ${legCompli}/${cmpCompli}${compliMark} | tech ${legTech}/${cmpTech}${techMark} | ind ${legInd}/${cmpInd}${indMark}${flag}`
    );
  }

  console.log(`\nTotal mismatches: ${mismatches} / ${publishedRows.length}`);

  // 4. Summary of 7 unmigrated legacy JSON fields
  console.log('\n════════════════════════════════════════════════════════════');
  console.log('UNMIGRATED LEGACY FIELDS — item counts per published service');
  console.log('(challenges, offerings, solutionTypes, businessFunctions, process, benefits, whyUs)');
  console.log('════════════════════════════════════════════════════════════');

  for (const row of publishedRows) {
    const ch = Array.isArray(row.challenges)        ? row.challenges.length        : 0;
    const of = Array.isArray(row.offerings)          ? row.offerings.length          : 0;
    const st = Array.isArray(row.solution_types)     ? row.solution_types.length     : 0;
    const bf = Array.isArray(row.business_functions) ? row.business_functions.length : 0;
    const pr = Array.isArray(row.process)            ? row.process.length            : 0;
    const be = Array.isArray(row.benefits)           ? row.benefits.length           : 0;
    const wu = Array.isArray(row.why_us)             ? row.why_us.length             : 0;
    console.log(
      `${row.slug.padEnd(38)} ch:${ch} of:${of} st:${st} bf:${bf} pr:${pr} be:${be} wu:${wu}`
    );
  }

  await client.end();
  console.log('\nDone.');
}

main().catch(err => { console.error(err); process.exit(1); });
