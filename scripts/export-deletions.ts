import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

async function exportDeletions() {
  const client = new Client({ connectionString: 'postgresql://postgres:J%40i123987@localhost:5432/metaphi_cms' });
  await client.connect();

  console.log('Querying all 178 sections linked to services...');
  const secQuery = await client.query(`
    SELECT 
      s.id as service_id,
      s.document_id,
      s.slug as service_slug,
      s.title as service_title,
      (s.published_at IS NOT NULL) as is_published,
      cmp.order as section_order,
      sec.id as section_id,
      sec.heading,
      sec.anchor,
      sec.content
    FROM services s
    JOIN services_cmps cmp ON s.id = cmp.entity_id AND cmp.field = 'sections'
    JOIN components_shared_sections sec ON cmp.cmp_id = sec.id
    ORDER BY s.slug, s.id, cmp.order;
  `);

  console.log(`Found ${secQuery.rows.length} service section rows.`);

  // Write removed-sections.json
  const removedSectionsPath = path.resolve(__dirname, '../removed-sections.json');
  fs.writeFileSync(removedSectionsPath, JSON.stringify(secQuery.rows, null, 2), 'utf8');
  console.log(`Wrote ${secQuery.rows.length} sections to ${removedSectionsPath}`);

  // Query all list items to be deleted
  const componentTables = [
    { field: 'challengesList', table: 'components_service_challenges', textCols: ['solution'] },
    { field: 'offeringsList', table: 'components_service_offerings', textCols: ['description'] },
    { field: 'solutionTypesList', table: 'components_service_solution_types', textCols: ['description'] },
    { field: 'businessFunctionsList', table: 'components_service_business_functions', textCols: ['description'] },
    { field: 'processStepsList', table: 'components_service_process_steps', textCols: ['description'] },
    { field: 'benefitsList', table: 'components_service_benefits', textCols: ['description'] },
    { field: 'whyUsList', table: 'components_service_why_uses', textCols: ['description'] },
    { field: 'industryContextsList', table: 'components_service_industry_contexts', textCols: ['blurb', 'bullets'] },
  ];

  const removedListItems: any[] = [];

  for (const ct of componentTables) {
    const q = await client.query(`
      SELECT 
        s.id as service_id,
        s.document_id,
        s.slug as service_slug,
        (s.published_at IS NOT NULL) as is_published,
        sc.field,
        sc.order,
        t.*
      FROM services s
      JOIN services_cmps sc ON s.id = sc.entity_id AND sc.field = $1
      JOIN ${ct.table} t ON sc.cmp_id = t.id
      ORDER BY s.slug, s.id, sc.order;
    `, [ct.field]);

    for (const row of q.rows) {
      let isPh = false;
      let matchedCol = '';
      let matchedText = '';

      for (const col of ct.textCols) {
        const val = row[col];
        if (val && typeof val === 'string' && val.trim().startsWith('Placeholder content:')) {
          isPh = true;
          matchedCol = col;
          matchedText = val;
          break;
        }
      }

      if (isPh) {
        removedListItems.push({
          serviceSlug: row.service_slug,
          serviceId: row.service_id,
          documentId: row.document_id,
          isPublished: row.is_published,
          field: row.field,
          order: row.order,
          componentId: row.id,
          componentTitle: row.title || row.standard || row.group || undefined,
          matchedColumn: matchedCol,
          matchedText: matchedText,
          fullItem: row
        });
      }
    }
  }

  // Write removed-list-items.json
  const removedListItemsPath = path.resolve(__dirname, '../removed-list-items.json');
  fs.writeFileSync(removedListItemsPath, JSON.stringify(removedListItems, null, 2), 'utf8');
  console.log(`Wrote ${removedListItems.length} list items to ${removedListItemsPath}`);

  // Query all body placeholder paragraphs to be deleted
  const services = await client.query('SELECT id, document_id, slug, (published_at IS NOT NULL) as is_published, body FROM services ORDER BY slug, id');
  const removedBodyParagraphs: any[] = [];

  for (const s of services.rows) {
    if (s.body) {
      const paragraphs = s.body.split(/\n\n+/);
      paragraphs.forEach((p: string, idx: number) => {
        if (p.trim().startsWith('Placeholder content:')) {
          removedBodyParagraphs.push({
            serviceSlug: s.slug,
            serviceId: s.id,
            documentId: s.document_id,
            isPublished: s.is_published,
            paragraphIndex: idx,
            text: p.trim()
          });
        }
      });
    }
  }

  const removedBodyPath = path.resolve(__dirname, '../removed-body-paragraphs.json');
  fs.writeFileSync(removedBodyPath, JSON.stringify(removedBodyParagraphs, null, 2), 'utf8');
  console.log(`Wrote ${removedBodyParagraphs.length} body paragraphs to ${removedBodyPath}`);

  await client.end();
}

exportDeletions().catch(console.error);
