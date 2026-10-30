/**
 * grant-public-permissions.cjs
 * 
 * Programmatically grants find / findOne permissions on the Public role
 * for all seeded content types in Strapi local PostgreSQL DB.
 */

require('dotenv').config();
const { Client } = require('pg');

async function grantPublicPermissions() {
  const client = new Client({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'metaphi_cms',
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD,
  });

  await client.connect();

  const roleRes = await client.query("SELECT id FROM up_roles WHERE type = 'public'");
  if (roleRes.rows.length === 0) {
    console.error('Public role not found in database.');
    await client.end();
    return;
  }
  const roleId = roleRes.rows[0].id;

  const actions = [
    // Single Types (find only)
    'api::home-page.home-page.find',
    'api::solutions-hub.solutions-hub.find',
    'api::custom-solutions-hub.custom-solutions-hub.find',
    'api::ready-to-configure-hub.ready-to-configure-hub.find',
    'api::saas-products-hub.saas-products-hub.find',
    'api::industries-hub.industries-hub.find',
    'api::default-cta-banner.default-cta-banner.find',

    // Collection Types (find and findOne)
    'api::industry.industry.find',
    'api::industry.industry.findOne',
    'api::solution.solution.find',
    'api::solution.solution.findOne',
    'api::case-study.case-study.find',
    'api::case-study.case-study.findOne',
    'api::testimonial.testimonial.find',
    'api::testimonial.testimonial.findOne',
    'api::faq.faq.find',
    'api::faq.faq.findOne',
  ];

  console.log(`Setting public permissions for ${actions.length} actions...`);

  for (const action of actions) {
    const ex = await client.query(
      `SELECT p.id FROM up_permissions p 
       JOIN up_permissions_role_lnk lnk ON lnk.permission_id = p.id 
       WHERE p.action = $1 AND lnk.role_id = $2`,
      [action, roleId]
    );

    if (ex.rows.length === 0) {
      let permId;
      const permRes = await client.query("SELECT id FROM up_permissions WHERE action = $1", [action]);
      if (permRes.rows.length > 0) {
        permId = permRes.rows[0].id;
      } else {
        const ins = await client.query(
          "INSERT INTO up_permissions (action, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id",
          [action]
        );
        permId = ins.rows[0].id;
      }

      await client.query(
        "INSERT INTO up_permissions_role_lnk (permission_id, role_id) VALUES ($1, $2)",
        [permId, roleId]
      );
      console.log(`✓ Granted permission: ${action}`);
    } else {
      console.log(`• Already granted: ${action}`);
    }
  }

  await client.end();
  console.log('Finished granting public permissions.\n');
}

grantPublicPermissions().catch(err => {
  console.error('Error granting permissions:', err);
  process.exit(1);
});
