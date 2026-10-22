import { createStrapi } from '@strapi/strapi';
import { Client } from 'pg';

async function linkCaseStudiesToServices() {
  console.log('Connecting to PostgreSQL to read legacy JSON case_studies...');
  const client = new Client({
    connectionString: 'postgres://postgres:J%40i123987@localhost:5432/metaphi_cms',
  });
  await client.connect();

  const csCol = await client.query(
    "SELECT slug, document_id, case_studies FROM services WHERE published_at IS NOT NULL AND case_studies IS NOT NULL AND case_studies::text != '[]' AND case_studies::text != 'null'"
  );
  console.log(`Found ${csCol.rows.length} published services with case studies JSON.`);

  const csToServicesMap = new Map<string, string[]>();
  for (const r of csCol.rows) {
    let parsed: any[] = [];
    try {
      parsed = typeof r.case_studies === 'string' ? JSON.parse(r.case_studies) : r.case_studies;
    } catch (e) {
      parsed = [];
    }

    for (const ref of parsed) {
      if (ref?.slug) {
        if (!csToServicesMap.has(ref.slug)) {
          csToServicesMap.set(ref.slug, []);
        }
        csToServicesMap.get(ref.slug)!.push(r.document_id);
      }
    }
  }

  await client.end();

  console.log('Case studies to link:');
  for (const [slug, docIds] of csToServicesMap.entries()) {
    console.log(`  - "${slug}": ${docIds.length} services`);
  }

  const app = await createStrapi({ distDir: './dist' }).load();

  for (const [slug, serviceDocIds] of csToServicesMap.entries()) {
    const cs = await app.documents('api::case-study.case-study').findFirst({
      filters: { slug },
    });

    if (!cs) {
      console.warn(`  Warning: Case study "${slug}" not found in Strapi.`);
      continue;
    }

    console.log(`\nLinking ${serviceDocIds.length} services to case study "${slug}" (docId: ${cs.documentId})...`);

    // Update draft version
    await app.documents('api::case-study.case-study').update({
      documentId: cs.documentId,
      data: {
        relatedServices: serviceDocIds,
      },
    });

    // Publish
    await app.documents('api::case-study.case-study').publish({
      documentId: cs.documentId,
    });

    console.log(`  ✓ Successfully updated and published relations for "${slug}".`);
  }

  console.log('\nAll service relations linked successfully!');
  process.exit(0);
}

linkCaseStudiesToServices().catch((err) => {
  console.error('Failed to link relations:', err);
  process.exit(1);
});
