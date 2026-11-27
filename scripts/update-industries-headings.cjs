/**
 * scripts/update-industries-headings.cjs
 *
 * Populates missing section heading & CTA label columns on all Industry rows
 * in Postgres (both draft and published) without overwriting existing values.
 */

const path = require('path');
const { Client } = require('pg');

const appDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(appDir, '.env') });

const DEFAULT_INDUSTRY_HEADINGS = {
  industry_context_heading: 'Industry Context',
  tech_opportunities_heading: 'Technology Opportunities',
  common_challenges_heading: 'Common Challenges',
  how_metaphi_helps_heading: 'How Metaphi Helps',
  relevant_custom_solutions_heading: 'Relevant Custom Solutions',
  ready_to_configure_solutions_heading: 'Ready-to-Configure Platforms',
  key_use_cases_heading: 'Key Operational Use Cases',
  ai_opportunities_heading: 'AI & Automation Opportunities',
  integrations_heading: 'Integration Opportunities',
  case_studies_heading: 'Relevant Case Studies',
  transformation_approach_cta_label: 'Discuss Your Approach',
  playbook_cta_label: 'Request Playbook',
};

async function run() {
  const client = new Client({
    host: process.env.DATABASE_HOST,
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DATABASE_NAME,
    user: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  });

  await client.connect();

  try {
    const colRes = await client.query(
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'industries'"
    );
    const existingCols = new Set(colRes.rows.map((r) => r.column_name));

    let totalUpdated = 0;
    for (const [col, val] of Object.entries(DEFAULT_INDUSTRY_HEADINGS)) {
      if (!existingCols.has(col)) {
        console.warn(`! Column missing in industries table: ${col}`);
        continue;
      }
      const res = await client.query(
        `UPDATE industries SET "${col}" = $1 WHERE "${col}" IS NULL OR BTRIM("${col}") = ''`,
        [val]
      );
      if (res.rowCount > 0) {
        totalUpdated += res.rowCount;
        console.log(`✓ [industries] ${col} -> updated ${res.rowCount} rows`);
      }
    }

    if (totalUpdated === 0) {
      console.log('• All industry rows already have all heading & CTA fields populated.');
    } else {
      console.log(`\n🎉 Updated ${totalUpdated} missing industry heading/CTA fields!`);
    }
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Update Error:', err);
  process.exit(1);
});
