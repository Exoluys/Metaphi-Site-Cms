import { Client } from 'pg';

async function main() {
  const client = new Client({ connectionString: 'postgresql://postgres:J%40i123987@localhost:5432/metaphi_cms' });
  await client.connect();

  const services = await client.query('SELECT id, slug, published_at IS NOT NULL as is_pub, body FROM services ORDER BY slug, id');

  const componentTables = [
    { field: 'challengesList', table: 'components_service_challenges', cols: ['title', 'description'] },
    { field: 'offeringsList', table: 'components_service_offerings', cols: ['title', 'description'] },
    { field: 'solutionTypesList', table: 'components_service_solution_types', cols: ['title', 'description'] },
    { field: 'businessFunctionsList', table: 'components_service_business_functions', cols: ['title', 'description'] },
    { field: 'processStepsList', table: 'components_service_process_steps', cols: ['title', 'description'] },
    { field: 'benefitsList', table: 'components_service_benefits', cols: ['title', 'description'] },
    { field: 'whyUsList', table: 'components_service_why_uses', cols: ['title', 'description'] },
    { field: 'industryContextsList', table: 'components_service_industry_contexts', cols: ['title', 'blurb', 'bullet_one', 'bullet_two'] },
  ];

  const results: Record<string, any> = {};
  const mixedItems: any[] = [];
  const purePlaceholders: any[] = [];
  const realItems: any[] = [];

  for (const s of services.rows) {
    const key = `${s.slug} [${s.is_pub ? 'PUB' : 'DRAFT'}]`;
    results[key] = {
      bodyPlaceholders: 0,
      totalListItems: 0,
      placeholderListItems: 0,
      realListItems: 0,
      countsByList: {} as Record<string, number>,
    };

    if (s.body && s.body.includes('Placeholder content:')) {
      const count = (s.body.match(/Placeholder content:/g) || []).length;
      results[key].bodyPlaceholders = count;
    }

    for (const ct of componentTables) {
      const q = await client.query(
        `SELECT t.* FROM services_cmps sc JOIN ${ct.table} t ON sc.cmp_id = t.id WHERE sc.entity_id = $1 AND sc.field = $2`,
        [s.id, ct.field]
      );

      let phCount = 0;
      for (const row of q.rows) {
        results[key].totalListItems++;
        let hasPh = false;
        for (const col of ct.cols) {
          const val = row[col];
          if (val && typeof val === 'string' && val.includes('Placeholder content:')) {
            hasPh = true;
            phCount++;
            if (val.trim().startsWith('Placeholder content:')) {
              purePlaceholders.push({ service: s.slug, id: s.id, field: ct.field, col, rowId: row.id });
            } else {
              mixedItems.push({ service: s.slug, id: s.id, field: ct.field, col, val });
            }
          }
        }
        if (hasPh) {
          results[key].placeholderListItems++;
        } else {
          results[key].realListItems++;
        }
      }
      results[key].countsByList[ct.field] = phCount;
    }
  }

  console.log('--- SUMMARY AUDIT ---');
  console.log(JSON.stringify(results, null, 2));

  console.log('\n--- MIXED ITEMS COUNT ---');
  console.log(mixedItems.length);
  if (mixedItems.length > 0) {
    console.log(JSON.stringify(mixedItems, null, 2));
  }

  await client.end();
}

main().catch(console.error);
