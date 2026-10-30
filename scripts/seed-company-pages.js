const { Client } = require('pg');
const crypto = require('crypto');
require('dotenv').config();

function randomDocId() {
  return crypto.randomBytes(12).toString('hex');
}

async function seedCompanyPages() {
  const client = new Client({
    host: process.env.DATABASE_HOST || '127.0.0.1',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    database: process.env.DATABASE_NAME || 'metaphi_cms',
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD,
  });

  await client.connect();

  console.log('--- Seeding All 9 Company Pages ---');

  // 1. About Page
  const exAbout = await client.query("SELECT id FROM about_pages LIMIT 1");
  if (exAbout.rows.length === 0) {
    const docId = randomDocId();
    await client.query(`
      INSERT INTO about_pages (
        document_id, hero_heading, hero_subtext, hero_eyebrow,
        mission_heading, mission_text,
        pillars_eyebrow, pillars_heading, pillars_subtext,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW(), NOW(), 'en')
    `, [
      docId,
      '[DUMMY] About Metaphi',
      '[DUMMY] Engineering high-performance software architecture, scalable platforms, and enterprise AI systems.',
      '[DUMMY] Company & Purpose',
      '[DUMMY] Mission & Technical Philosophy',
      '[DUMMY] We build durable digital products and custom systems engineered for reliability, transparency, and operational velocity.',
      '[DUMMY] Our Foundation',
      '[DUMMY] Engineering Philosophy',
      '[DUMMY] The architectural baselines and principles directing how we deliver enterprise software.'
    ]);
    console.log('Seeded about-page');
  }

  // 2. Careers Page
  const exCareers = await client.query("SELECT id FROM careers_pages LIMIT 1");
  if (exCareers.rows.length === 0) {
    const docId = randomDocId();
    await client.query(`
      INSERT INTO careers_pages (
        document_id, hero_heading, hero_subtext, hero_eyebrow,
        directory_eyebrow, directory_heading, directory_subtext, empty_state_text,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW(), 'en')
    `, [
      docId,
      '[DUMMY] Current Openings',
      '[DUMMY] Join an engineering culture dedicated to high-performance architectures, deep systems design, and collaborative product delivery.',
      '[DUMMY] Careers & Opportunities',
      '[DUMMY] Open Roles',
      '[DUMMY] Open Engineering Roles',
      '[DUMMY] Active technical positions across core infrastructure and platform architecture.',
      '[DUMMY] We are not actively hiring for additional engineering positions right now. Check back soon or reach out directly to introduce your technical work.'
    ]);
    console.log('Seeded careers-page');
  }

  // 3. Why Join Us Page
  const exWhyJoin = await client.query("SELECT id FROM why_join_us_pages LIMIT 1");
  if (exWhyJoin.rows.length === 0) {
    const docId = randomDocId();
    await client.query(`
      INSERT INTO why_join_us_pages (
        document_id, hero_heading, hero_subtext, hero_eyebrow,
        section_eyebrow, section_heading, section_subtext,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW(), 'en')
    `, [
      docId,
      '[DUMMY] Why Join Us',
      '[DUMMY] Work alongside dedicated systems architects solving complex engineering problems with high technical ownership and zero bureaucracy.',
      '[DUMMY] Culture & Philosophy',
      '[DUMMY] Culture & Impact',
      '[DUMMY] Why Build With Metaphi',
      '[DUMMY] We build durable software architectures and foster autonomous engineering environments.'
    ]);
    console.log('Seeded why-join-us-page');
  }

  // 4. Rewards Page
  const exRewards = await client.query("SELECT id FROM rewards_pages LIMIT 1");
  if (exRewards.rows.length === 0) {
    const docId = randomDocId();
    await client.query(`
      INSERT INTO rewards_pages (
        document_id, hero_heading, hero_subtext, hero_eyebrow,
        section_eyebrow, section_heading, section_subtext,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW(), 'en')
    `, [
      docId,
      '[DUMMY] Employee Rewards',
      '[DUMMY] Comprehensive growth opportunities, continuous learning allowances, and meritocratic technical advancement.',
      '[DUMMY] Growth & Recognition',
      '[DUMMY] Total Rewards',
      '[DUMMY] Comprehensive Compensation & Benefits',
      '[DUMMY] Transparent compensation, flexible remote arrangements, and continuous learning support.'
    ]);
    console.log('Seeded rewards-page');
  }

  // 5. Life at Metaphi Page
  const exLife = await client.query("SELECT id FROM life_at_metaphi_pages LIMIT 1");
  if (exLife.rows.length === 0) {
    const docId = randomDocId();
    await client.query(`
      INSERT INTO life_at_metaphi_pages (
        document_id, hero_heading, hero_subtext, hero_eyebrow,
        section_eyebrow, section_heading, section_subtext,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW(), 'en')
    `, [
      docId,
      '[DUMMY] Life @ Metaphi',
      '[DUMMY] A distributed engineering collective anchored by deep autonomy, asynchronous craft, and uncompromising architectural standards.',
      '[DUMMY] Engineering Culture',
      '[DUMMY] Cultural Values',
      '[DUMMY] How We Work Together',
      '[DUMMY] Operating principles shaping daily engineering, architectural decision-making, and collective ownership.'
    ]);
    console.log('Seeded life-at-metaphi-page');
  }

  // 6. Testimonials Page
  const exTestimonials = await client.query("SELECT id FROM testimonials_pages LIMIT 1");
  if (exTestimonials.rows.length === 0) {
    const docId = randomDocId();
    await client.query(`
      INSERT INTO testimonials_pages (
        document_id, hero_heading, hero_subtext, hero_eyebrow,
        directory_eyebrow, directory_heading, directory_subtext, empty_state_text,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW(), 'en')
    `, [
      docId,
      '[DUMMY] Client Testimonials',
      '[DUMMY] Feedback from technology leaders, founders, and engineering teams partnering with Metaphi.',
      '[DUMMY] Client Perspectives',
      '[DUMMY] Client Perspectives',
      '[DUMMY] Client Quotes & Perspectives',
      '[DUMMY] Perspectives from partners and engineering organizations delivering systems with Metaphi.',
      '[DUMMY] No client testimonials currently published. Check back soon as we publish new verified feedback.'
    ]);
    console.log('Seeded testimonials-page');
  }

  // 7. Team Page
  const exTeam = await client.query("SELECT id FROM team_pages LIMIT 1");
  if (exTeam.rows.length === 0) {
    const docId = randomDocId();
    await client.query(`
      INSERT INTO team_pages (
        document_id, hero_heading, hero_subtext, hero_eyebrow,
        directory_eyebrow, directory_heading, directory_subtext, empty_state_text,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW(), 'en')
    `, [
      docId,
      '[DUMMY] Our Leading Minds',
      '[DUMMY] Meet the engineering leads, architects, and technical strategists delivering scalable solutions.',
      '[DUMMY] Leadership & Architecture',
      '[DUMMY] Engineering Practice',
      '[DUMMY] Core Technical Contributors',
      '[DUMMY] Direct access to principal engineers and systems architects across our practices.',
      '[DUMMY] Team profiles currently updating.'
    ]);
    console.log('Seeded team-page');
  }

  // 8. Partners Page
  const exPartners = await client.query("SELECT id FROM partners_pages LIMIT 1");
  if (exPartners.rows.length === 0) {
    const docId = randomDocId();
    await client.query(`
      INSERT INTO partners_pages (
        document_id, hero_heading, hero_subtext, hero_eyebrow,
        directory_eyebrow, directory_heading, directory_subtext, empty_state_text,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW(), NOW(), 'en')
    `, [
      docId,
      '[DUMMY] Our Partnership',
      '[DUMMY] Technical ecosystems and collaborative alliances empowering modern enterprise software delivery.',
      '[DUMMY] Ecosystem & Alliances',
      '[DUMMY] Alliances',
      '[DUMMY] Technology & Industry Partners',
      '[DUMMY] Strategic technology alliances and collaborative engineering partners.',
      '[DUMMY] Partner directory currently updating.'
    ]);
    console.log('Seeded partners-page');
  }

  // 9. Compliance Page
  const exCompliance = await client.query("SELECT id FROM compliance_pages LIMIT 1");
  if (exCompliance.rows.length === 0) {
    const docId = randomDocId();
    await client.query(`
      INSERT INTO compliance_pages (
        document_id, hero_heading, hero_subtext, hero_eyebrow,
        section_eyebrow, section_heading, section_subtext,
        created_at, updated_at, published_at, locale
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW(), 'en')
    `, [
      docId,
      '[DUMMY] Certifications & Compliance',
      '[DUMMY] Engineering governance, operational controls, and architecture baseline integrity.',
      '[DUMMY] Governance & Standards',
      '[DUMMY] Frameworks & Standards',
      '[DUMMY] Architecture Governance Standards',
      '[DUMMY] Systematic operational practices and verified engineering controls safeguarding production platforms.'
    ]);
    console.log('Seeded compliance-page');
  }

  await client.end();
  console.log('--- Company Pages Seeding Completed ---');
}

seedCompanyPages().catch(err => {
  console.error('Seed error:', err);
  process.exit(1);
});
