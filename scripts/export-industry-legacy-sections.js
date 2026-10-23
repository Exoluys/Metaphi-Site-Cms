const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgres://postgres:J%40i123987@localhost:5432/metaphi_cms',
});

async function main() {
  await client.connect();

  const query = `
    SELECT 
      i.id AS industry_id,
      i.slug AS industry_slug,
      i.document_id AS industry_document_id,
      CASE WHEN i.published_at IS NOT NULL THEN 'published' ELSE 'draft' END AS status,
      ic.order AS section_order,
      s.id AS section_id,
      s.heading,
      s.anchor,
      s.content
    FROM industries_cmps ic
    JOIN industries i ON ic.entity_id = i.id
    JOIN components_shared_sections s ON ic.cmp_id = s.id
    WHERE ic.field = 'sections'
    ORDER BY i.slug, i.published_at NULLS FIRST, ic.order;
  `;

  const res = await client.query(query);
  console.log(`Found ${res.rows.length} legacy section rows used by industries.`);

  const outputPath = path.join(__dirname, '..', 'backups', 'removed-industry-legacy-sections.json');
  fs.writeFileSync(outputPath, JSON.stringify(res.rows, null, 2), 'utf-8');
  console.log(`Exported successfully to: ${outputPath}`);

  await client.end();
}

main().catch(err => {
  console.error('Export failed:', err);
  process.exit(1);
});
