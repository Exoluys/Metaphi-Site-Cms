import { Client } from "pg";

const client = new Client({
  connectionString: "postgres://postgres:J%40i123987@localhost:5432/metaphi_cms",
});

async function main() {
  await client.connect();

  const res = await client.query("SELECT id, name, url FROM files");
  console.log("Strapi files table:", res.rows);

  const fileMorph = await client.query("SELECT * FROM files_related_mph");
  console.log("files_related_mph table:", fileMorph.rows);

  await client.end();
}

main().catch(console.error);
