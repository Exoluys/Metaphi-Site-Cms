const { Client } = require('pg');
const crypto = require('crypto');

function randomDocId() {
  return crypto.randomBytes(12).toString('hex');
}

async function seedPagesAndDrafts() {
  const client = new Client({
    host: '127.0.0.1',
    port: 5432,
    database: 'metaphi_cms',
    user: 'postgres',
    password: 'J@i123987',
  });

  await client.connect();

  // 1. Team Page (Single Type) - Published
  const exTeamPage = await client.query("SELECT id FROM team_pages LIMIT 1");
  if (exTeamPage.rows.length === 0) {
    const docId = randomDocId();
    await client.query(
      `INSERT INTO team_pages (document_id, hero_heading, hero_subtext, created_at, updated_at, published_at, locale)
       VALUES ($1, $2, $3, NOW(), NOW(), NOW(), 'en')`,
      [docId, '[DUMMY] Our Leading Minds', '[DUMMY] Meet the engineering leads, architects, and technical strategists delivering scalable solutions.']
    );
    console.log('Created and published team-page single type');
  }

  // 2. Partners Page (Single Type) - Published
  const exPartnersPage = await client.query("SELECT id FROM partners_pages LIMIT 1");
  if (exPartnersPage.rows.length === 0) {
    const docId = randomDocId();
    await client.query(
      `INSERT INTO partners_pages (document_id, hero_heading, hero_subtext, created_at, updated_at, published_at, locale)
       VALUES ($1, $2, $3, NOW(), NOW(), NOW(), 'en')`,
      [docId, '[DUMMY] Our Partnership', '[DUMMY] Technical ecosystems and collaborative alliances empowering modern enterprise software delivery.']
    );
    console.log('Created and published partners-page single type');
  }

  // 3. Compliance Page (Single Type) - Published
  const exCompliancePage = await client.query("SELECT id FROM compliance_pages LIMIT 1");
  if (exCompliancePage.rows.length === 0) {
    const docId = randomDocId();
    await client.query(
      `INSERT INTO compliance_pages (document_id, hero_heading, hero_subtext, created_at, updated_at, published_at, locale)
       VALUES ($1, $2, $3, NOW(), NOW(), NOW(), 'en')`,
      [docId, '[DUMMY] Certifications & Compliance', '[DUMMY] Engineering governance, operational controls, and architecture baseline integrity.']
    );
    console.log('Created and published compliance-page single type');
  }

  // 4. Team Members (Collection Type)
  // Per rules: create dummy entries as DRAFTS, publish only what the page needs in order to render for testing.
  // We publish 3 entries for testing, and leave 2 as DRAFTS.
  const teamItems = [
    { name: '[DUMMY] Engineering Director 1', role: '[DUMMY] Practice Lead', department: '[DUMMY] Architecture', bio: '[DUMMY] Leads distributed systems engineering and core platform architecture.', order: 1, publish: true },
    { name: '[DUMMY] Solutions Architect 2', role: '[DUMMY] Technical Architect', department: '[DUMMY] Cloud & Data', bio: '[DUMMY] Oversees enterprise integrations, pipeline automation, and data topology.', order: 2, publish: true },
    { name: '[DUMMY] Delivery Lead 3', role: '[DUMMY] Product Delivery Director', department: '[DUMMY] Engineering', bio: '[DUMMY] Directs sprint velocity, quality assurance standards, and release predictability.', order: 3, publish: true },
    { name: '[DUMMY] Principal Consultant 4 (Draft)', role: '[DUMMY] Technology Strategist', department: '[DUMMY] Advisory', bio: '[DUMMY] Strategic advisory lead for roadmap definitions.', order: 4, publish: false },
    { name: '[DUMMY] AI Research Lead 5 (Draft)', role: '[DUMMY] Machine Learning Lead', department: '[DUMMY] AI Practice', bio: '[DUMMY] Leads applied machine learning evaluations.', order: 5, publish: false },
  ];

  for (const item of teamItems) {
    const ex = await client.query("SELECT id FROM team_members WHERE name = $1", [item.name]);
    if (ex.rows.length === 0) {
      const docId = randomDocId();
      await client.query(
        `INSERT INTO team_members (document_id, name, role, department, bio, "order", created_at, updated_at, published_at, locale)
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7, 'en')`,
        [docId, item.name, item.role, item.department, item.bio, item.order, item.publish ? new Date() : null]
      );
      console.log(`Created team member "${item.name}" (${item.publish ? 'PUBLISHED' : 'DRAFT'})`);
    }
  }

  // 5. Partners (Collection Type)
  // 3 published for test rendering, 2 drafts. Generic category and dummy values only.
  const partnerItems = [
    { name: '[DUMMY] Organization Alpha', category: '[DUMMY] Category 1', description: '[DUMMY] Technical collaboration on scalable distributed backends and runtime frameworks.', order: 1, publish: true },
    { name: '[DUMMY] Network Beta', category: '[DUMMY] Category 2', description: '[DUMMY] Co-engineering initiative focused on enterprise data pipelines and analytics tooling.', order: 2, publish: true },
    { name: '[DUMMY] Alliance Gamma', category: '[DUMMY] Category 3', description: '[DUMMY] Infrastructure orchestration and continuous delivery automation collaboration.', order: 3, publish: true },
    { name: '[DUMMY] Partner Delta (Draft)', category: '[DUMMY] Category 1', description: '[DUMMY] Collaborative evaluation in pipeline telemetry.', order: 4, publish: false },
    { name: '[DUMMY] Partner Epsilon (Draft)', category: '[DUMMY] Category 2', description: '[DUMMY] Exploratory interoperability baseline testing.', order: 5, publish: false },
  ];

  for (const p of partnerItems) {
    const ex = await client.query("SELECT id FROM partners WHERE name = $1", [p.name]);
    if (ex.rows.length === 0) {
      const docId = randomDocId();
      await client.query(
        `INSERT INTO partners (document_id, name, category, description, "order", created_at, updated_at, published_at, locale)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), $6, 'en')`,
        [docId, p.name, p.category, p.description, p.order, p.publish ? new Date() : null]
      );
      console.log(`Created partner "${p.name}" (${p.publish ? 'PUBLISHED' : 'DRAFT'})`);
    }
  }

  await client.end();
}

seedPagesAndDrafts().catch(console.error);
