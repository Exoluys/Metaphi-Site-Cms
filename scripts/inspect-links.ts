import { Client } from "pg";

const client = new Client({
  connectionString: "postgres://postgres:J%40i123987@localhost:5432/metaphi_cms",
});

async function run() {
  await client.connect();
  const tables = [
    "services_related_services_list_lnk",
    "services_case_studies_list_lnk",
    "components_service_industry_contexts_industry_lnk",
    "services_cmps",
  ];
  for (const t of tables) {
    const res = await client.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = $1",
      [t]
    );
    console.log(`Table ${t}:`, res.rows);
  }
  await client.end();
}

run().catch(console.error);
