const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

function randomDocId() {
  return crypto.randomBytes(12).toString('hex');
}

async function seedWorkPage() {
  const client = new Client({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'metaphi_cms',
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD,
  });

  await client.connect();

  console.log('--- Seeding Work Page ---');

  const exWork = await client.query("SELECT id FROM work_pages LIMIT 1");
  if (exWork.rows.length === 0) {
    const docId = randomDocId();
    // Insert Draft
    await client.query(`
      INSERT INTO work_pages (
        document_id, heading, highlight, intro, empty_state_text,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NULL, 'en')
    `, [
      docId,
      "Results We're Accountable For.",
      "Work You Can Verify.",
      "Metaphi delivers proven, production-grade systems across industries—from high-fidelity digital twins to HIPAA-compliant clinical platforms and autonomous agent workflows.",
      "No case studies are currently published. Check back soon for verified engineering results."
    ]);

    // Insert Published
    await client.query(`
      INSERT INTO work_pages (
        document_id, heading, highlight, intro, empty_state_text,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), NOW(), 'en')
    `, [
      docId,
      "Results We're Accountable For.",
      "Work You Can Verify.",
      "Metaphi delivers proven, production-grade systems across industries—from high-fidelity digital twins to HIPAA-compliant clinical platforms and autonomous agent workflows.",
      "No case studies are currently published. Check back soon for verified engineering results."
    ]);

    console.log('Seeded work-page (Draft & Published matching)');
  } else {
    console.log('work-page already seeded');
  }

  await client.end();
}

seedWorkPage().catch(console.error);
