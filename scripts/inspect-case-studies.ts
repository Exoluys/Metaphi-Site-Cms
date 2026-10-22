import { Client } from "pg";

const client = new Client({
  connectionString: "postgres://postgres:J%40i123987@localhost:5432/metaphi_cms",
});

async function main() {
  await client.connect();

  console.log("=== 1. CASE STUDIES IN DB ===");
  const cs = await client.query(
    "SELECT id, document_id, title, slug, published_at FROM case_studies ORDER BY id"
  );
  console.log(cs.rows);

  console.log("\n=== 2. CASE STUDY RELATIONS TO SERVICES ===");
  const csRelations = await client.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema='public' AND table_name LIKE '%case_stud%' ORDER BY table_name"
  );
  console.log("Case study related tables:", csRelations.rows.map(r => r.table_name));

  const relTables = [
    "case_studies_related_services_lnk",
    "services_case_studies_list_lnk",
  ];

  for (const t of relTables) {
    try {
      const res = await client.query(`SELECT * FROM ${t}`);
      console.log(`Table ${t} rows count: ${res.rows.length}`);
      if (res.rows.length > 0) {
        console.log(`Table ${t} rows:`, res.rows);
      }
    } catch (e: any) {
      console.log(`Table ${t} error:`, e.message);
    }
  }

  await client.end();
}

main().catch(console.error);
