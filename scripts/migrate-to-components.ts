import { Client } from "pg";

const client = new Client({
  connectionString: "postgres://postgres:J%40i123987@localhost:5432/metaphi_cms",
});

async function migrate() {
  await client.connect();

  // 1. Load case studies maps
  const csRes = await client.query("SELECT id, slug, document_id, published_at FROM case_studies ORDER BY published_at ASC NULLS FIRST");
  const caseStudyDraftMap = new Map<string, number>();
  const caseStudyPubMap = new Map<string, number>();
  for (const row of csRes.rows) {
    if (!row.slug) continue;
    if (row.published_at) {
      caseStudyPubMap.set(row.slug, row.id);
    } else {
      caseStudyDraftMap.set(row.slug, row.id);
    }
  }

  // 2. Load industries maps
  const indRes = await client.query("SELECT id, slug, document_id, published_at FROM industries ORDER BY published_at ASC NULLS FIRST");
  const industryDraftMap = new Map<string, number>();
  const industryPubMap = new Map<string, number>();
  for (const row of indRes.rows) {
    if (!row.slug) continue;
    if (row.published_at) {
      industryPubMap.set(row.slug, row.id);
    } else {
      industryDraftMap.set(row.slug, row.id);
    }
  }

  // 3. Load services maps
  const servRes = await client.query("SELECT id, slug, document_id, published_at FROM services ORDER BY published_at ASC NULLS FIRST");
  const serviceDraftMap = new Map<string, number>();
  const servicePubMap = new Map<string, number>();
  for (const row of servRes.rows) {
    if (!row.slug) continue;
    if (row.published_at) {
      servicePubMap.set(row.slug, row.id);
    } else {
      serviceDraftMap.set(row.slug, row.id);
    }
  }

  // 4. Load all 54 rows (both draft and published)
  const allServices = await client.query(`
    SELECT id, document_id, title, slug, published_at,
           stats, challenges, offerings, solution_types, business_functions,
           process, benefits, why_us, assurances, compliance, tech_groups,
           industries, case_studies, related_services
    FROM services
    ORDER BY id ASC
  `);

  console.log(`Clearing old component entries for clean migration...`);
  await client.query(`
    DELETE FROM services_cmps WHERE field IN (
      'statsList', 'challengesList', 'offeringsList', 'solutionTypesList',
      'businessFunctionsList', 'processStepsList', 'benefitsList', 'whyUsList',
      'assurancesList', 'complianceList', 'techGroupsList', 'industryContextsList'
    );
    DELETE FROM services_related_services_list_lnk;
    DELETE FROM services_case_studies_list_lnk;
    DELETE FROM components_service_industry_contexts_industry_lnk;
    TRUNCATE TABLE
      components_service_stats,
      components_service_challenges,
      components_service_offerings,
      components_service_solution_types,
      components_service_business_functions,
      components_service_process_steps,
      components_service_benefits,
      components_service_why_uses,
      components_service_assurances,
      components_service_compliance_badges,
      components_service_tech_groups,
      components_service_industry_contexts
    CASCADE;
  `);

  console.log(`Starting migration for ${allServices.rows.length} rows (draft + published)...`);

  for (const row of allServices.rows) {
    const sId = row.id;

    // A. statsList -> components_service_stats
    if (Array.isArray(row.stats) && row.stats.length > 0) {
      for (let i = 0; i < row.stats.length; i++) {
        const item = row.stats[i];
        if (!item || !item.label) continue;
        const ins = await client.query(
          `INSERT INTO components_service_stats (value, label) VALUES ($1, $2) RETURNING id`,
          [String(item.value || ""), String(item.label || "")]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'statsList', 'service.stat', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    // B. challengesList -> components_service_challenges
    if (Array.isArray(row.challenges) && row.challenges.length > 0) {
      for (let i = 0; i < row.challenges.length; i++) {
        const item = row.challenges[i];
        if (!item || !item.title) continue;
        const ins = await client.query(
          `INSERT INTO components_service_challenges (title, solution) VALUES ($1, $2) RETURNING id`,
          [String(item.title || ""), String(item.solution || "")]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'challengesList', 'service.challenge', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    // C. offeringsList -> components_service_offerings
    if (Array.isArray(row.offerings) && row.offerings.length > 0) {
      for (let i = 0; i < row.offerings.length; i++) {
        const item = row.offerings[i];
        if (!item || !item.title) continue;
        const ins = await client.query(
          `INSERT INTO components_service_offerings (title, description) VALUES ($1, $2) RETURNING id`,
          [String(item.title || ""), String(item.description || "")]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'offeringsList', 'service.offering', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    // D. solutionTypesList -> components_service_solution_types
    if (Array.isArray(row.solution_types) && row.solution_types.length > 0) {
      for (let i = 0; i < row.solution_types.length; i++) {
        const item = row.solution_types[i];
        if (!item || !item.title) continue;
        const ins = await client.query(
          `INSERT INTO components_service_solution_types (title, description) VALUES ($1, $2) RETURNING id`,
          [String(item.title || ""), String(item.description || "")]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'solutionTypesList', 'service.solution-type', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    // E. businessFunctionsList -> components_service_business_functions
    if (Array.isArray(row.business_functions) && row.business_functions.length > 0) {
      for (let i = 0; i < row.business_functions.length; i++) {
        const item = row.business_functions[i];
        if (!item || !item.title) continue;
        const ins = await client.query(
          `INSERT INTO components_service_business_functions (title, description) VALUES ($1, $2) RETURNING id`,
          [String(item.title || ""), String(item.description || "")]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'businessFunctionsList', 'service.business-function', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    // F. processStepsList -> components_service_process_steps
    if (Array.isArray(row.process) && row.process.length > 0) {
      for (let i = 0; i < row.process.length; i++) {
        const item = row.process[i];
        if (!item || !item.title) continue;
        const ins = await client.query(
          `INSERT INTO components_service_process_steps (title, description) VALUES ($1, $2) RETURNING id`,
          [String(item.title || ""), String(item.description || "")]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'processStepsList', 'service.process-step', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    // G. benefitsList -> components_service_benefits
    if (Array.isArray(row.benefits) && row.benefits.length > 0) {
      for (let i = 0; i < row.benefits.length; i++) {
        const item = row.benefits[i];
        if (!item || !item.title) continue;
        const ins = await client.query(
          `INSERT INTO components_service_benefits (title, description) VALUES ($1, $2) RETURNING id`,
          [String(item.title || ""), String(item.description || "")]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'benefitsList', 'service.benefit', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    // H. whyUsList -> components_service_why_uses
    if (Array.isArray(row.why_us) && row.why_us.length > 0) {
      for (let i = 0; i < row.why_us.length; i++) {
        const item = row.why_us[i];
        if (!item || !item.title) continue;
        const ins = await client.query(
          `INSERT INTO components_service_why_uses (title, description) VALUES ($1, $2) RETURNING id`,
          [String(item.title || ""), String(item.description || "")]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'whyUsList', 'service.why-us', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    // I. assurancesList -> components_service_assurances
    if (Array.isArray(row.assurances) && row.assurances.length > 0) {
      for (let i = 0; i < row.assurances.length; i++) {
        const item = row.assurances[i];
        if (typeof item !== "string" || !item.trim()) continue;
        const ins = await client.query(
          `INSERT INTO components_service_assurances (text) VALUES ($1) RETURNING id`,
          [item.trim()]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'assurancesList', 'service.assurance', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    // J. complianceList -> components_service_compliance_badges
    if (Array.isArray(row.compliance) && row.compliance.length > 0) {
      for (let i = 0; i < row.compliance.length; i++) {
        const item = row.compliance[i];
        if (typeof item !== "string" || !item.trim()) continue;
        const ins = await client.query(
          `INSERT INTO components_service_compliance_badges (standard) VALUES ($1) RETURNING id`,
          [item.trim()]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'complianceList', 'service.compliance-badge', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    // K. techGroupsList -> components_service_tech_groups (multiline items)
    if (Array.isArray(row.tech_groups) && row.tech_groups.length > 0) {
      for (let i = 0; i < row.tech_groups.length; i++) {
        const tg = row.tech_groups[i];
        if (!tg || !tg.group) continue;
        const itemsStr = Array.isArray(tg.items) ? tg.items.join("\n") : "";
        const ins = await client.query(
          `INSERT INTO components_service_tech_groups ("group", items) VALUES ($1, $2) RETURNING id`,
          [String(tg.group || ""), itemsStr]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'techGroupsList', 'service.tech-group', $3)`,
          [sId, compId, i + 1]
        );
      }
    }

    const isPublished = Boolean(row.published_at);

    // L. industryContextsList -> components_service_industry_contexts (multiline bullets)
    if (Array.isArray(row.industries) && row.industries.length > 0) {
      for (let i = 0; i < row.industries.length; i++) {
        const ind = row.industries[i];
        if (!ind || !ind.slug) continue;
        const targetIndId = isPublished
          ? (industryPubMap.get(ind.slug) || industryDraftMap.get(ind.slug))
          : (industryDraftMap.get(ind.slug) || industryPubMap.get(ind.slug));
        const bulletsStr = Array.isArray(ind.bullets) ? ind.bullets.join("\n") : "";
        const ins = await client.query(
          `INSERT INTO components_service_industry_contexts (blurb, bullets) VALUES ($1, $2) RETURNING id`,
          [String(ind.blurb || ""), bulletsStr]
        );
        const compId = ins.rows[0].id;
        await client.query(
          `INSERT INTO services_cmps (entity_id, cmp_id, field, component_type, "order")
           VALUES ($1, $2, 'industryContextsList', 'service.industry-context', $3)`,
          [sId, compId, i + 1]
        );

        // Link industry relation if found
        if (targetIndId) {
          await client.query(
            `INSERT INTO components_service_industry_contexts_industry_lnk (industry_context_id, industry_id)
             VALUES ($1, $2)
             ON CONFLICT DO NOTHING`,
            [compId, targetIndId]
          );
        }
      }
    }

    // M. relatedServicesList -> services_related_services_list_lnk
    if (Array.isArray(row.related_services) && row.related_services.length > 0) {
      for (let i = 0; i < row.related_services.length; i++) {
        const relSlug = row.related_services[i];
        const targetId = isPublished
          ? (servicePubMap.get(relSlug) || serviceDraftMap.get(relSlug))
          : (serviceDraftMap.get(relSlug) || servicePubMap.get(relSlug));
        if (targetId) {
          await client.query(
            `INSERT INTO services_related_services_list_lnk (service_id, inv_service_id, service_ord)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [sId, targetId, i + 1]
          );
        }
      }
    }

    // N. caseStudiesList -> services_case_studies_list_lnk
    if (Array.isArray(row.case_studies) && row.case_studies.length > 0) {
      for (let i = 0; i < row.case_studies.length; i++) {
        const cs = row.case_studies[i];
        const csSlug = cs?.slug;
        const targetId = csSlug
          ? (isPublished
              ? (caseStudyPubMap.get(csSlug) || caseStudyDraftMap.get(csSlug))
              : (caseStudyDraftMap.get(csSlug) || caseStudyPubMap.get(csSlug)))
          : undefined;
        if (targetId) {
          await client.query(
            `INSERT INTO services_case_studies_list_lnk (service_id, case_study_id, case_study_ord)
             VALUES ($1, $2, $3)
             ON CONFLICT DO NOTHING`,
            [sId, targetId, i + 1]
          );
        }
      }
    }
  }

  console.log("Migration finished successfully!");
  await client.end();
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
