import { Client } from "pg";

const client = new Client({
  connectionString: "postgres://postgres:J%40i123987@localhost:5432/metaphi_cms",
});

async function main() {
  await client.connect();

  console.log("=== 1. VERIFY CASE STUDY & INDUSTRY TABLES ===");
  const csTables = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND (table_name LIKE 'case_studies%' OR table_name LIKE 'industries%') ORDER BY table_name"
  );
  console.log("Case study & industry tables:", csTables.rows.map(r => r.table_name));

  const csSectionsCol = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'case_studies' AND column_name = 'sections'"
  );
  console.log("case_studies.sections column intact:", csSectionsCol.rows);

  const indSectionsCol = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'industries' AND column_name = 'sections'"
  );
  console.log("industries.sections column intact:", indSectionsCol.rows);

  console.log("\n=== 2. VERIFY SERVICE FIELDS IN DB ===");
  const serviceCols = await client.query(
    "SELECT column_name FROM information_schema.columns WHERE table_name = 'services' ORDER BY column_name"
  );
  console.log("services columns count:", serviceCols.rows.length);
  console.log("services columns:", serviceCols.rows.map(r => r.column_name));

  const serviceRows = await client.query(
    "SELECT count(*) as total, count(distinct slug) as distinct_slugs, count(category_slug) as with_category_slug FROM services"
  );
  console.log("services rows summary:", serviceRows.rows[0]);

  const catLinks = await client.query(
    "SELECT count(*) as total_links FROM services_category_lnk"
  );
  console.log("services_category_lnk total links:", catLinks.rows[0]);

  console.log("\n=== 3. VERIFY COMPONENT ASSOCIATIONS ===");
  const cmpsSummary = await client.query(
    "SELECT field, count(*) as count FROM services_cmps GROUP BY field ORDER BY field"
  );
  console.log("services component counts:", cmpsSummary.rows);

  await client.end();
}

main().catch(console.error);
