/**
 * migrate-7-service-components.cjs
 *
 * Idempotent migration from legacy JSON fields to the 7 empty component lists:
 *   - challengesList        (service.challenge)
 *   - offeringsList         (service.offering)
 *   - solutionTypesList     (service.solution-type)
 *   - businessFunctionsList (service.business-function)
 *   - processStepsList      (service.process-step)
 *   - benefitsList          (service.benefit)
 *   - whyUsList             (service.why-us)
 *
 * Runs by documentId for BOTH draft and published rows.
 * No invented content; maps only what exists.
 *
 * Usage:
 *   Dry-run: node scripts/migrate-7-service-components.cjs --dry-run
 *   Apply:   node scripts/migrate-7-service-components.cjs --apply
 */

const { Client } = require('pg');

const DB = 'postgres://postgres:J%40i123987@localhost:5432/metaphi_cms';

const MAPPINGS = [
  {
    field: 'challengesList',
    componentType: 'service.challenge',
    table: 'components_service_challenges',
    legacyCol: 'challenges',
    mapFn: (item) => {
      if (!item || !item.title) return null;
      return {
        title: String(item.title).trim(),
        solution: String(item.solution || '').trim(),
      };
    },
    insertSql: 'INSERT INTO components_service_challenges (title, solution) VALUES ($1, $2) RETURNING id',
    getArgs: (val) => [val.title, val.solution],
  },
  {
    field: 'offeringsList',
    componentType: 'service.offering',
    table: 'components_service_offerings',
    legacyCol: 'offerings',
    mapFn: (item) => {
      if (!item || !item.title) return null;
      return {
        title: String(item.title).trim(),
        description: String(item.description || '').trim(),
      };
    },
    insertSql: 'INSERT INTO components_service_offerings (title, description) VALUES ($1, $2) RETURNING id',
    getArgs: (val) => [val.title, val.description],
  },
  {
    field: 'solutionTypesList',
    componentType: 'service.solution-type',
    table: 'components_service_solution_types',
    legacyCol: 'solution_types',
    mapFn: (item) => {
      if (!item || !item.title) return null;
      return {
        title: String(item.title).trim(),
        description: String(item.description || '').trim(),
      };
    },
    insertSql: 'INSERT INTO components_service_solution_types (title, description) VALUES ($1, $2) RETURNING id',
    getArgs: (val) => [val.title, val.description],
  },
  {
    field: 'businessFunctionsList',
    componentType: 'service.business-function',
    table: 'components_service_business_functions',
    legacyCol: 'business_functions',
    mapFn: (item) => {
      if (!item || !item.title) return null;
      return {
        title: String(item.title).trim(),
        description: String(item.description || '').trim(),
      };
    },
    insertSql: 'INSERT INTO components_service_business_functions (title, description) VALUES ($1, $2) RETURNING id',
    getArgs: (val) => [val.title, val.description],
  },
  {
    field: 'processStepsList',
    componentType: 'service.process-step',
    table: 'components_service_process_steps',
    legacyCol: 'process',
    mapFn: (item) => {
      if (!item || !item.title) return null;
      return {
        title: String(item.title).trim(),
        description: String(item.description || '').trim(),
      };
    },
    insertSql: 'INSERT INTO components_service_process_steps (title, description) VALUES ($1, $2) RETURNING id',
    getArgs: (val) => [val.title, val.description],
  },
  {
    field: 'benefitsList',
    componentType: 'service.benefit',
    table: 'components_service_benefits',
    legacyCol: 'benefits',
    mapFn: (item) => {
      if (!item || !item.title) return null;
      return {
        title: String(item.title).trim(),
        description: String(item.description || '').trim(),
      };
    },
    insertSql: 'INSERT INTO components_service_benefits (title, description) VALUES ($1, $2) RETURNING id',
    getArgs: (val) => [val.title, val.description],
  },
  {
    field: 'whyUsList',
    componentType: 'service.why-us',
    table: 'components_service_why_uses',
    legacyCol: 'why_us',
    mapFn: (item) => {
      if (!item || !item.title) return null;
      return {
        title: String(item.title).trim(),
        description: String(item.description || '').trim(),
      };
    },
    insertSql: 'INSERT INTO components_service_why_uses (title, description) VALUES ($1, $2) RETURNING id',
    getArgs: (val) => [val.title, val.description],
  },
];

async function main() {
  const isApply = process.argv.includes('--apply');
  const isDryRun = !isApply;

  console.log(`\n============================================================`);
  console.log(`MIGRATION SCRIPT: 7 Service Component Lists`);
  console.log(`Mode: ${isDryRun ? 'DRY-RUN (read-only)' : 'APPLY (writing to database)'}`);
  console.log(`============================================================\n`);

  const client = new Client({ connectionString: DB });
  await client.connect();

  // Load all service rows ordered by slug and published status
  const svcRes = await client.query(`
    SELECT id, document_id, slug, title, published_at,
           challenges, offerings, solution_types, business_functions,
           process, benefits, why_us
    FROM services
    ORDER BY slug ASC, id ASC
  `);

  // Group by document_id
  const docsMap = new Map();
  for (const row of svcRes.rows) {
    if (!docsMap.has(row.document_id)) {
      docsMap.set(row.document_id, {
        documentId: row.document_id,
        slug: row.slug,
        title: row.title,
        draftRow: null,
        publishedRow: null,
      });
    }
    const doc = docsMap.get(row.document_id);
    if (row.published_at) {
      doc.publishedRow = row;
    } else {
      doc.draftRow = row;
    }
  }

  const docs = Array.from(docsMap.values());
  console.log(`Found ${docs.length} distinct service documents (${svcRes.rows.length} total rows: ${svcRes.rows.filter(r => !r.published_at).length} draft, ${svcRes.rows.filter(r => r.published_at).length} published).\n`);

  // Per-service plan table
  console.log('DRY RUN PLAN PER SERVICE:');
  console.log('Service Slug                           | Draft ID | Pub ID | ch | of | st | bf | pr | be | wu | Total / Row');
  console.log('---------------------------------------+----------+--------+----+----+----+----+----+----+----+------------');

  const summary = {
    servicesWithData: 0,
    servicesEmpty: 0,
    totalPerField: {
      challengesList: 0,
      offeringsList: 0,
      solutionTypesList: 0,
      businessFunctionsList: 0,
      processStepsList: 0,
      benefitsList: 0,
      whyUsList: 0,
    },
    totalComponentsCreatedPerSet: 0,
    grandTotalComponentsCreated: 0,
  };

  const migrationPlan = [];

  for (const doc of docs) {
    // Source data: prefer published row if available, fallback to draft row
    const srcRow = doc.publishedRow || doc.draftRow;

    const counts = {};
    const mappedItems = {};
    let docTotal = 0;

    for (const m of MAPPINGS) {
      const rawArr = srcRow[m.legacyCol];
      if (Array.isArray(rawArr) && rawArr.length > 0) {
        const valid = rawArr.map(m.mapFn).filter(Boolean);
        counts[m.field] = valid.length;
        mappedItems[m.field] = valid;
        summary.totalPerField[m.field] += valid.length;
        docTotal += valid.length;
      } else {
        counts[m.field] = 0;
        mappedItems[m.field] = [];
      }
    }

    if (docTotal > 0) {
      summary.servicesWithData++;
    } else {
      summary.servicesEmpty++;
    }

    summary.totalComponentsCreatedPerSet += docTotal;

    const rowCountMultiplier = (doc.draftRow ? 1 : 0) + (doc.publishedRow ? 1 : 0);
    summary.grandTotalComponentsCreated += docTotal * rowCountMultiplier;

    const dIdStr = doc.draftRow ? String(doc.draftRow.id).padStart(8) : '    none';
    const pIdStr = doc.publishedRow ? String(doc.publishedRow.id).padStart(6) : '  none';

    console.log(
      `${doc.slug.padEnd(38)} | ${dIdStr} | ${pIdStr} | ` +
      `${String(counts.challengesList).padStart(2)} | ` +
      `${String(counts.offeringsList).padStart(2)} | ` +
      `${String(counts.solutionTypesList).padStart(2)} | ` +
      `${String(counts.businessFunctionsList).padStart(2)} | ` +
      `${String(counts.processStepsList).padStart(2)} | ` +
      `${String(counts.benefitsList).padStart(2)} | ` +
      `${String(counts.whyUsList).padStart(2)} | ` +
      `${String(docTotal).padStart(4)} items`
    );

    migrationPlan.push({
      doc,
      mappedItems,
      counts,
      docTotal,
    });
  }

  console.log('---------------------------------------+----------+--------+----+----+----+----+----+----+----+------------');
  console.log(
    `TOTALS (${summary.servicesWithData} active, ${summary.servicesEmpty} empty)`.padEnd(39) +
    ` |          |        | ` +
    `${String(summary.totalPerField.challengesList).padStart(2)} | ` +
    `${String(summary.totalPerField.offeringsList).padStart(2)} | ` +
    `${String(summary.totalPerField.solutionTypesList).padStart(2)} | ` +
    `${String(summary.totalPerField.businessFunctionsList).padStart(2)} | ` +
    `${String(summary.totalPerField.processStepsList).padStart(2)} | ` +
    `${String(summary.totalPerField.benefitsList).padStart(2)} | ` +
    `${String(summary.totalPerField.whyUsList).padStart(2)} | ` +
    `${String(summary.totalComponentsCreatedPerSet).padStart(4)} / set`
  );
  console.log(`\nGrand total component records to create across all rows (draft + published): ${summary.grandTotalComponentsCreated}\n`);

  if (isDryRun) {
    console.log('DRY RUN COMPLETE. No data was modified.');
    console.log('To apply this migration, run: node scripts/migrate-7-service-components.cjs --apply');
    await client.end();
    return;
  }

  // --- APPLY MODE ---
  console.log('Applying migration inside a database transaction...');
  await client.query('BEGIN');

  try {
    for (const plan of migrationPlan) {
      const { doc, mappedItems } = plan;
      const targetRows = [doc.draftRow, doc.publishedRow].filter(Boolean);

      for (const targetRow of targetRows) {
        const entityId = targetRow.id;

        for (const m of MAPPINGS) {
          const items = mappedItems[m.field];

          // 1. Remove any existing components for this entity and field (idempotence)
          const existingLinks = await client.query(
            'SELECT cmp_id FROM services_cmps WHERE entity_id = $1 AND field = $2',
            [entityId, m.field]
          );
          if (existingLinks.rows.length > 0) {
            const cmpIds = existingLinks.rows.map(r => r.cmp_id);
            await client.query(
              'DELETE FROM services_cmps WHERE entity_id = $1 AND field = $2',
              [entityId, m.field]
            );
            await client.query(
              `DELETE FROM ${m.table} WHERE id = ANY($1)`,
              [cmpIds]
            );
          }

          // 2. Insert new components
          if (items.length > 0) {
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              const insRes = await client.query(m.insertSql, m.getArgs(item));
              const cmpId = insRes.rows[0].id;

              await client.query(
                `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
                 VALUES ($1, $2, $3, $4, $5)`,
                [entityId, cmpId, m.field, m.componentType, i + 1]
              );
            }
          }
        }
      }
    }

    await client.query('COMMIT');
    console.log('\n✓ MIGRATION APPLIED SUCCESSFULLY!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('\n✗ ERROR DURING MIGRATION, TRANSACTION ROLLED BACK:', err);
    throw err;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
