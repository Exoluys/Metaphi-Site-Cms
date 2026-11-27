/**
 * scripts/update-solutions-headings.cjs
 *
 * Populates missing section heading columns on all Solution rows in Postgres
 * (both draft and published) without overwriting existing values.
 */

const path = require('path');
const { Client } = require('pg');

const appDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(appDir, '.env') });

const CUSTOM_HEADINGS = {
  industries_heading: 'Industries We Support',
  case_studies_heading: 'Relevant Case Studies',
  related_resources_heading: 'Related Resources',
};

const READY_HEADINGS = {
  who_it_is_for_heading: 'Who It Is For',
  solution_overview_heading: 'Solution Overview',
  example_workflow_heading: 'Example Workflow',
  core_modules_heading: 'Core Modules',
  configuration_heading: 'Built to Configure & Extend',
  what_is_already_available_heading: 'What Is Already Available',
  what_can_be_configured_heading: 'What Can Be Configured',
  what_can_be_extended_heading: 'What Can Be Extended',
  industries_heading: 'Relevant Industries',
  case_studies_heading: 'Relevant Case Studies',
  related_resources_heading: 'Related Resources',
};

const SAAS_HEADINGS = {
  product_experience_heading: 'Product Experience',
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
      "SELECT column_name FROM information_schema.columns WHERE table_name = 'solutions'"
    );
    const existingCols = new Set(colRes.rows.map((r) => r.column_name));

    const groups = [
      { modelType: 'custom', headings: CUSTOM_HEADINGS },
      { modelType: 'ready-to-configure', headings: READY_HEADINGS },
      { modelType: 'saas', headings: SAAS_HEADINGS },
    ];

    for (const { modelType, headings } of groups) {
      for (const [col, val] of Object.entries(headings)) {
        if (!existingCols.has(col)) {
          console.warn(`! Column missing in solutions table: ${col}`);
          continue;
        }
        const res = await client.query(
          `UPDATE solutions SET "${col}" = $1 WHERE model_type = $2 AND ("${col}" IS NULL OR BTRIM("${col}") = '')`,
          [val, modelType]
        );
        if (res.rowCount > 0) {
          console.log(`✓ [${modelType}] ${col} -> updated ${res.rowCount} rows`);
        }
      }
    }

    console.log('\n🎉 Solutions headings populated in Postgres!');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Update Error:', err);
  process.exit(1);
});
