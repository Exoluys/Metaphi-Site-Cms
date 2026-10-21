import { Client } from "pg";

async function hideLegacyFields() {
  const client = new Client({
    connectionString: "postgres://postgres:J%40i123987@localhost:5432/metaphi_cms",
  });
  await client.connect();

  const res = await client.query(
    "SELECT id, value FROM strapi_core_store_settings WHERE key = $1",
    ["plugin_content_manager_configuration_content_types::api::service.service"]
  );

  if (res.rows.length === 0) {
    console.log("No config row found!");
    await client.end();
    return;
  }

  const row = res.rows[0];
  const conf = JSON.parse(row.value);

  const legacyFields = new Set([
    "stats",
    "challenges",
    "offerings",
    "solutionTypes",
    "caseStudies",
    "tags",
    "outcomes",
    "businessFunctions",
    "process",
    "assurances",
    "compliance",
    "techGroups",
    "benefits",
    "industries",
    "whyUs",
    "relatedServices",
    "offeringsVisual",
    "categorySlug",
  ]);

  conf.layouts.edit = conf.layouts.edit
    .map((rowArr: any[]) => rowArr.filter((col: any) => !legacyFields.has(col.name)))
    .filter((rowArr: any[]) => rowArr.length > 0);

  await client.query("UPDATE strapi_core_store_settings SET value = $1 WHERE id = $2", [
    JSON.stringify(conf),
    row.id,
  ]);

  console.log("Updated edit fields successfully!");
  console.log(conf.layouts.edit.flat().map((f: any) => f.name));

  await client.end();
}

hideLegacyFields().catch(console.error);
