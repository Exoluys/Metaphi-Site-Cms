require('dotenv').config();
const { Client } = require('pg');

async function grantPermissions() {
  const client = new Client({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'metaphi_cms',
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD,
  });

  await client.connect();

  const roleRes = await client.query("SELECT id FROM up_roles WHERE type = 'public'");
  const roleId = roleRes.rows[0].id;

  const actions = [
    // 9 Company Single Types
    'api::about-page.about-page.find',
    'api::careers-page.careers-page.find',
    'api::why-join-us-page.why-join-us-page.find',
    'api::rewards-page.rewards-page.find',
    'api::life-at-metaphi-page.life-at-metaphi-page.find',
    'api::compliance-page.compliance-page.find',
    'api::partners-page.partners-page.find',
    'api::team-page.team-page.find',
    'api::testimonials-page.testimonials-page.find',
    'api::work-page.work-page.find',
    'api::faq-page.faq-page.find',

    // Related collections
    'api::team-member.team-member.find',
    'api::team-member.team-member.findOne',
    'api::partner.partner.find',
    'api::partner.partner.findOne',
    'api::job-opening.job-opening.find',
    'api::job-opening.job-opening.findOne',
  ];

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
      console.log('Granted permission:', action);
    } else {
      console.log('Already granted:', action);
    }
  }

  await client.end();
  console.log('Public permissions update complete.');
}

grantPermissions().catch(console.error);
