const { Client } = require('pg');

async function grantPermissions() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'metaphi_cms',
    user: 'postgres',
    password: 'J@i123987',
  });

  await client.connect();

  const roleRes = await client.query("SELECT id FROM up_roles WHERE type = 'public'");
  const roleId = roleRes.rows[0].id;

  const actions = [
    'api::team-page.team-page.find',
    'api::team-member.team-member.find',
    'api::team-member.team-member.findOne',
    'api::partners-page.partners-page.find',
    'api::partner.partner.find',
    'api::partner.partner.findOne',
    'api::compliance-page.compliance-page.find',
  ];

  for (const action of actions) {
    const ex = await client.query(
      `SELECT p.id FROM up_permissions p 
       JOIN up_permissions_role_lnk lnk ON lnk.permission_id = p.id 
       WHERE p.action = $1 AND lnk.role_id = $2`,
      [action, roleId]
    );

    if (ex.rows.length === 0) {
      const ins = await client.query(
        "INSERT INTO up_permissions (action, created_at, updated_at) VALUES ($1, NOW(), NOW()) RETURNING id",
        [action]
      );
      const permId = ins.rows[0].id;
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
}

grantPermissions().catch(console.error);
