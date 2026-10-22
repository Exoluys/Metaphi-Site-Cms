import { Client } from "pg";

const client = new Client({
  connectionString: "postgres://postgres:J%40i123987@localhost:5432/metaphi_cms",
});

async function main() {
  await client.connect();

  console.log("=== CHECK case_studies_related_services_lnk IN DB ===");
  const cols = await client.query(
    "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'case_studies_related_services_lnk'"
  );
  console.log("Columns:", cols.rows);

  const rows = await client.query("SELECT * FROM case_studies_related_services_lnk");
  console.log("Rows in case_studies_related_services_lnk:", rows.rows);

  console.log("\n=== CHECK case_studies COLUMN ON services TABLE ===");
  const csCol = await client.query(
    "SELECT slug, published_at, case_studies FROM services WHERE case_studies IS NOT NULL AND case_studies::text != '[]' AND case_studies::text != 'null'"
  );
  console.log("Services with non-empty case_studies JSON:", csCol.rows.length);
  for (const r of csCol.rows) {
    console.log(`- ${r.slug} (${r.published_at ? 'published' : 'draft'}):`, r.case_studies);
  }

  await client.end();
}

main().catch(console.error);
