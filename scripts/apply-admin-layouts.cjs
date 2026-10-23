/**
 * apply-admin-layouts.cjs
 *
 * Idempotent script that sets the Strapi Content-Manager edit-form layout
 * for: Service, ServiceCategory, CaseStudy, Industry.
 *
 * Safe to run multiple times. It reads the current config, applies the
 * desired layout, and writes it back. Fields not in the layout are hidden
 * (legacy JSON fields, categorySlug, offeringsVisual stay in schema but
 * are not shown in the edit form).
 *
 * Run: node apply-admin-layouts.cjs
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { Client } = require('pg');

const clientConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DATABASE_HOST || process.env.PGHOST || '127.0.0.1',
      port: parseInt(process.env.DATABASE_PORT || process.env.PGPORT || '5432', 10),
      database: process.env.DATABASE_NAME || process.env.PGDATABASE || 'metaphi_cms',
      user: process.env.DATABASE_USERNAME || process.env.PGUSER || 'postgres',
      password: process.env.DATABASE_PASSWORD || process.env.PGPASSWORD || '',
    };

// ─── Layout definitions ──────────────────────────────────────────────────────

const serviceLayout = {
  key: 'plugin_content_manager_configuration_content_types::api::service.service',
  editRows: [
    [{ name: 'title', size: 6 }, { name: 'category', size: 6 }],
    [{ name: 'slug', size: 4 }, { name: 'order', size: 4 }, { name: 'icon', size: 4 }],
    [{ name: 'summary', size: 12 }],
    [{ name: 'body', size: 12 }],
    [{ name: 'heroImage', size: 6 }, { name: 'seoDescription', size: 6 }],
    // Component repeatable zones — each on its own row
    [{ name: 'statsList', size: 12 }],
    [{ name: 'challengesList', size: 12 }],
    [{ name: 'offeringsList', size: 12 }],
    [{ name: 'solutionTypesList', size: 12 }],
    [{ name: 'businessFunctionsList', size: 12 }],
    [{ name: 'processStepsList', size: 12 }],
    [{ name: 'benefitsList', size: 12 }],
    [{ name: 'whyUsList', size: 12 }],
    [{ name: 'assurancesList', size: 12 }],
    [{ name: 'complianceList', size: 12 }],
    [{ name: 'techGroupsList', size: 12 }],
    [{ name: 'industryContextsList', size: 12 }],
    [{ name: 'relatedServicesList', size: 6 }, { name: 'caseStudiesList', size: 6 }],
    // Legacy JSON fields are intentionally omitted here — they stay in the
    // schema for backward compat but should not appear in the edit form.
  ],
};

const serviceCategoryLayout = {
  key: 'plugin_content_manager_configuration_content_types::api::service-category.service-category',
  editRows: [
    [{ name: 'name', size: 8 }, { name: 'order', size: 4 }],
    [{ name: 'slug', size: 12 }],
  ],
};

const caseStudyLayout = {
  key: 'plugin_content_manager_configuration_content_types::api::case-study.case-study',
  editRows: [
    [{ name: 'title', size: 8 }, { name: 'order', size: 4 }],
    [{ name: 'slug', size: 12 }],
    [{ name: 'subtitle', size: 12 }],
    [{ name: 'summary', size: 12 }],
    [{ name: 'body', size: 12 }],
    [{ name: 'tags', size: 8 }, { name: 'heroImage', size: 4 }],
    [{ name: 'seoDescription', size: 12 }],
    [{ name: 'projectSummary', size: 12 }],
    [{ name: 'challengeSection', size: 12 }],
    [{ name: 'solutionSection', size: 12 }],
    [{ name: 'workflowSection', size: 12 }],
    [{ name: 'technologySection', size: 12 }],
    [{ name: 'impactSection', size: 12 }],
    [{ name: 'takeawaysSection', size: 12 }],
    [{ name: 'relatedServices', size: 6 }, { name: 'industries', size: 6 }],
  ],
};

const industryLayout = {
  key: 'plugin_content_manager_configuration_content_types::api::industry.industry',
  editRows: [
    [{ name: 'title', size: 8 }, { name: 'order', size: 4 }],
    [{ name: 'slug', size: 12 }],
    [{ name: 'summary', size: 12 }],
    [{ name: 'heroImage', size: 12 }],
    [{ name: 'ctaLabel', size: 6 }, { name: 'ctaLink', size: 6 }],
    [{ name: 'lastReviewedDate', size: 6 }],
    [{ name: 'reviewers', size: 12 }],
    [{ name: 'trustBar', size: 12 }],
    [{ name: 'clientLogos', size: 12 }],
    [{ name: 'stats', size: 12 }],
    [{ name: 'challengesSection', size: 12 }],
    [{ name: 'caseStudiesSection', size: 12 }],
    [{ name: 'solutionsSection', size: 12 }],
    [{ name: 'servicesSection', size: 12 }],
    [{ name: 'verticalsSection', size: 12 }],
    [{ name: 'techStackSection', size: 12 }],
    [{ name: 'ctaBanner', size: 12 }],
    [{ name: 'caseStudies', size: 12 }],
    [{ name: 'seo', size: 12 }],
  ],
};

const trustBarComponentLayout = {
  key: 'plugin_content_manager_configuration_components::industry-page.trust-bar',
  editRows: [
    [{ name: 'heading', size: 12 }],
  ],
};

const layouts = [serviceLayout, serviceCategoryLayout, caseStudyLayout, industryLayout, trustBarComponentLayout];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TRUST_BAR_HELP_TEXT =
  'Add at least one client logo. If no logos are added, the trust bar will not be shown on the page.';

/**
 * Build a minimal but valid Strapi content-manager config object.
 * We only force-overwrite the `layouts.edit` key; everything else
 * from the existing row is preserved (or a sensible default is used).
 * Enforces slug.edit.editable = false for locked content types.
 */
function applyEditLayout(existing, newEditRows, lockSlug = false, key = '') {
  const base = existing
    ? JSON.parse(typeof existing === 'string' ? existing : JSON.stringify(existing))
    : { layouts: { edit: [], list: [] }, settings: {}, metadatas: {} };

  base.layouts = base.layouts || {};
  base.layouts.edit = newEditRows;
  base.metadatas = base.metadatas || {};

  if (lockSlug && base.metadatas?.slug) {
    base.metadatas.slug.edit = {
      ...base.metadatas.slug.edit,
      editable: false,
      description: 'Automatically generated from title on creation. Never typed, immutable.',
    };
  }

  // Help text for clientLogos on Industry
  if (key.includes('industry.industry')) {
    base.metadatas.clientLogos = base.metadatas.clientLogos || {};
    base.metadatas.clientLogos.edit = {
      ...base.metadatas.clientLogos.edit,
      description: TRUST_BAR_HELP_TEXT,
    };
  }

  // Help text for heading on Trust Bar component
  if (key.includes('industry-page.trust-bar')) {
    base.metadatas.heading = base.metadatas.heading || {};
    base.metadatas.heading.edit = {
      ...base.metadatas.heading.edit,
      description: TRUST_BAR_HELP_TEXT,
    };
  }

  return base;
}

async function main() {
  const client = new Client(clientConfig);
  await client.connect();

  for (const layout of layouts) {
    // Read current config row (may not exist yet)
    const { rows } = await client.query(
      'SELECT id, value FROM strapi_core_store_settings WHERE key = $1',
      [layout.key]
    );

    const existingValue = rows.length ? rows[0].value : null;
    const lockSlug = layout.key.includes('industry') || layout.key.includes('service.service') || layout.key.includes('case-study');
    const updated = applyEditLayout(existingValue, layout.editRows, lockSlug, layout.key);
    const json = JSON.stringify(updated);

    if (rows.length === 0) {
      await client.query(
        'INSERT INTO strapi_core_store_settings (key, value, type, environment, tag) VALUES ($1, $2, $3, $4, $5)',
        [layout.key, json, 'object', null, null]
      );
      console.log(`[INSERT] ${layout.key}`);
    } else {
      await client.query(
        'UPDATE strapi_core_store_settings SET value = $1 WHERE id = $2',
        [json, rows[0].id]
      );
      console.log(`[UPDATE] ${layout.key}`);
    }
  }

  console.log('\nDone. Restart Strapi (or hard-refresh the admin) to see the new layouts.');
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
