import { Client } from 'pg';

async function updateLayout() {
  const client = new Client({ connectionString: 'postgresql://postgres:J%40i123987@localhost:5432/metaphi_cms' });
  await client.connect();

  const key = 'plugin_content_manager_configuration_content_types::api::service.service';
  const res = await client.query('SELECT value FROM strapi_core_store_settings WHERE key = $1', [key]);

  if (res.rows.length > 0) {
    const config = JSON.parse(res.rows[0].value);

    // 1. Remove sections from metadatas
    if (config.metadatas && config.metadatas.sections) {
      delete config.metadatas.sections;
      console.log('Removed sections from metadatas');
    }

    // 2. Remove sections from layouts.edit
    if (config.layouts && Array.isArray(config.layouts.edit)) {
      const newEditLayout: any[] = [];
      for (const row of config.layouts.edit) {
        if (Array.isArray(row)) {
          const filteredRow = row.filter((field: any) => field.name !== 'sections');
          if (filteredRow.length > 0) {
            newEditLayout.push(filteredRow);
          }
        }
      }
      config.layouts.edit = newEditLayout;
      console.log('Removed sections from layouts.edit');
    }

    // 3. Remove sections from layouts.list if present
    if (config.layouts && Array.isArray(config.layouts.list)) {
      config.layouts.list = config.layouts.list.filter((name: string) => name !== 'sections');
    }

    await client.query('UPDATE strapi_core_store_settings SET value = $1 WHERE key = $2', [
      JSON.stringify(config),
      key,
    ]);
    console.log('Successfully updated strapi_core_store_settings in DB.');
  }

  await client.end();
}

updateLayout().catch(console.error);
