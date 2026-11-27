/**
 * scripts/fix-hubs-dummy-data.cjs
 *
 * Replaces dummy test strings (asd/asdasd/awdawd/dasdasd) in
 * ready_to_configure_hubs, custom_solutions_hubs, and saas_products_hubs
 * with proper copy or NULL.
 */

const path = require('path');
const { Client } = require('pg');

const appDir = path.resolve(__dirname, '..');
require('dotenv').config({ path: path.join(appDir, '.env') });

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
    // 1. Ready-to-Configure Hub
    const r1 = await client.query(
      `UPDATE ready_to_configure_hubs
       SET hero_eyebrow = NULL,
           hero_metric = NULL,
           hero_anchor_label = 'Explore Ready-to-Configure',
           portfolio_heading = 'Ready-to-Configure Solutions',
           portfolio_subtext = 'Explore proven business foundations ready to configure around your workflows.'`
    );
    console.log(`✓ ready_to_configure_hubs updated (${r1.rowCount} rows)`);

    // 2. Custom Solutions Hub
    const r2 = await client.query(
      `UPDATE custom_solutions_hubs
       SET hero_eyebrow = NULL,
           hero_metric = NULL,
           hero_anchor_label = 'Explore Custom Solutions'`
    );
    console.log(`✓ custom_solutions_hubs updated (${r2.rowCount} rows)`);

    // 3. SaaS Products Hub
    const r3 = await client.query(
      `UPDATE saas_products_hubs
       SET hero_eyebrow = NULL,
           hero_metric = NULL,
           why_saas_sla = NULL`
    );
    console.log(`✓ saas_products_hubs updated (${r3.rowCount} rows)`);

    // 4. Remove dummy why_saas_benefits links on saas_products_hubs if any
    await client.query(
      `DELETE FROM saas_products_hubs_cmps WHERE field = 'whySaasBenefits'`
    );
    console.log('✓ Cleared dummy whySaasBenefits links on saas_products_hubs');

    console.log('\n🎉 All hub dummy data cleaned!');
  } finally {
    await client.end();
  }
}

run().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
});
