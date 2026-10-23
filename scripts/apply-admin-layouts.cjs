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

const { Client } = require('pg');

const DB = 'postgres://postgres:J%40i123987@localhost:5432/metaphi_cms';

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
    [{ name: 'slug', size: 8 }, { name: 'icon', size: 4 }],
    [{ name: 'summary', size: 12 }],
    [{ name: 'body', size: 12 }],
    [{ name: 'heroImage', size: 6 }, { name: 'seoDescription', size: 6 }],
    [{ name: 'heroSection', size: 12 }],
    [{ name: 'servicesSection', size: 12 }],
    [{ name: 'capabilitiesSection', size: 12 }],
    [{ name: 'engagementSection', size: 12 }],
    [{ name: 'caseStudies', size: 12 }],
    // 'sections' (legacy shared.section) is intentionally omitted —
    // all entries are placeholder content; field stays in schema until Phase 3.
  ],
};

const layouts = [serviceLayout, serviceCategoryLayout, caseStudyLayout, industryLayout];

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Build a minimal but valid Strapi content-manager config object.
 * We only force-overwrite the `layouts.edit` key; everything else
 * from the existing row is preserved (or a sensible default is used).
 */
function applyEditLayout(existing, newEditRows) {
  const base = existing
    ? JSON.parse(typeof existing === 'string' ? existing : JSON.stringify(existing))
    : { layouts: { edit: [], list: [] }, settings: {}, metadatas: {} };

  base.layouts = base.layouts || {};
  base.layouts.edit = newEditRows;

  return base;
}

async function main() {
  const client = new Client({ connectionString: DB });
  await client.connect();

  for (const layout of layouts) {
    // Read current config row (may not exist yet)
    const { rows } = await client.query(
      'SELECT id, value FROM strapi_core_store_settings WHERE key = $1',
      [layout.key]
    );

    const existingValue = rows.length ? rows[0].value : null;
    const updated = applyEditLayout(existingValue, layout.editRows);
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
