const { createStrapi } = require('@strapi/strapi');

async function restore() {
  const app = await createStrapi({ distDir: './dist' }).load();
  try {
    const existing = await app.documents('api::default-cta-banner.default-cta-banner').findFirst();
    if (existing) {
      console.log('Deleting test default-cta-banner documentId:', existing.documentId);
      await app.documents('api::default-cta-banner.default-cta-banner').delete({
        documentId: existing.documentId,
      });
      console.log('Restored default-cta-banner to empty state (null).');
    }
  } finally {
    await app.destroy();
  }
}

restore().catch(err => {
  console.error(err);
  process.exit(1);
});
