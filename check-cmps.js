const { Client } = require('pg');
const client = new Client({ connectionString: 'postgres://postgres:J%40i123987@localhost:5432/metaphi_cms' });

const cmps = [
  ['statsList', 'service.stat'],
  ['challengesList', 'service.challenge'],
  ['offeringsList', 'service.offering'],
  ['solutionTypesList', 'service.solution-type'],
  ['businessFunctionsList', 'service.business-function'],
  ['processStepsList', 'service.process-step'],
  ['benefitsList', 'service.benefit'],
  ['whyUsList', 'service.why-us'],
  ['assurancesList', 'service.assurance'],
  ['complianceList', 'service.compliance-badge'],
  ['techGroupsList', 'service.tech-group'],
  ['industryContextsList', 'service.industry-context'],
];

async function main() {
  await client.connect();
  console.log('--- COMPONENT LISTS (distinct service entity_ids in services_cmps) ---');
  for (const [name, ctype] of cmps) {
    const r = await client.query(
      'SELECT COUNT(DISTINCT entity_id) FROM services_cmps WHERE component_type = $1',
      [ctype]
    );
    console.log(name.padEnd(24) + ': ' + r.rows[0].count + ' services');
  }
  
  // Also: relatedServicesList and caseStudiesList are relations, check the link tables
  const rl = await client.query('SELECT COUNT(DISTINCT service_id) FROM services_related_services_lnk');
  console.log('relatedServicesList (lnk): ' + rl.rows[0].count + ' services');
  
  await client.end();
}

main().catch(console.error);
