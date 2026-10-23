const { createStrapi } = require('@strapi/strapi');

async function main() {
  const app = await createStrapi({ distDir: './dist' }).load();
  try {
    const roles = await app.query('plugin::users-permissions.role').findMany({
      populate: ['permissions'],
    });
    const pub = roles.find(r => r.type === 'public');
    const existing = pub?.permissions?.filter(p => p.action.includes('default-cta-banner'));
    console.log('Public permissions for default-cta-banner:', existing);

    // If find is missing, enable it
    const hasFind = existing?.some(p => p.action === 'api::default-cta-banner.default-cta-banner.find');
    if (!hasFind && pub) {
      console.log('Enabling api::default-cta-banner.default-cta-banner.find for public role...');
      await app.query('plugin::users-permissions.permission').create({
        data: {
          action: 'api::default-cta-banner.default-cta-banner.find',
          role: pub.id,
        },
      });
      console.log('Granted find permission to Public role.');
    }

    // Check if default-cta-banner single type has content in DB
    const banner = await app.documents('api::default-cta-banner.default-cta-banner').findFirst();
    console.log('Current default-cta-banner entry:', banner);
  } finally {
    await app.destroy();
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
