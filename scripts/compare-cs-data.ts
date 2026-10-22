import { Client } from "pg";

const client = new Client({
  connectionString: "postgres://postgres:J%40i123987@localhost:5432/metaphi_cms",
});

async function main() {
  await client.connect();

  console.log("=== 1. SERVICES WITH CASE STUDIES JSON ===");
  const servicesRes = await client.query(`
    SELECT id, document_id, slug, title, published_at, case_studies
    FROM services
    WHERE case_studies IS NOT NULL AND case_studies::text != '[]' AND case_studies::text != 'null'
    ORDER BY slug, published_at NULLS FIRST
  `);
  
  console.log(`Found ${servicesRes.rows.length} service rows with case studies JSON:`);
  const serviceJsonMap = new Map();
  for (const row of servicesRes.rows) {
    const isPub = Boolean(row.published_at);
    const key = `${row.slug} (${isPub ? 'published' : 'draft'})`;
    let parsed = [];
    try {
      parsed = typeof row.case_studies === 'string' ? JSON.parse(row.case_studies) : row.case_studies;
    } catch (e) {
      parsed = row.case_studies;
    }
    serviceJsonMap.set(key, parsed);
    console.log(`- ${key}:`, parsed.map((c: any) => c.slug).join(', '));
  }

  console.log("\n=== 2. CASE STUDIES IN DB ===");
  const csRes = await client.query(`
    SELECT id, document_id, slug, title, published_at
    FROM case_studies
    ORDER BY id
  `);
  for (const cs of csRes.rows) {
    console.log(`- CaseStudy ID ${cs.id} (${cs.published_at ? 'published' : 'draft'}): ${cs.slug} (docId: ${cs.document_id})`);
  }

  console.log("\n=== 3. RELATIONAL TABLE case_studies_related_services_lnk ===");
  const relRes = await client.query(`
    SELECT * FROM case_studies_related_services_lnk
  `);
  console.log(`Rows in case_studies_related_services_lnk: ${relRes.rows.length}`);
  if (relRes.rows.length > 0) {
    console.table(relRes.rows);
  }

  await client.end();
}

main().catch(console.error);
