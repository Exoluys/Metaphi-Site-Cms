const { createStrapi } = require('@strapi/strapi');

async function test() {
  const app = await createStrapi({ distDir: './dist' }).load();
  try {
    console.log('1. Checking current default-cta-banner entry...');
    const existing = await app.documents('api::default-cta-banner.default-cta-banner').findFirst();
    console.log('Existing:', existing);

    console.log('2. Creating or updating test Tier 2 default-cta-banner entry...');
    let testDoc;
    if (existing) {
      testDoc = await app.documents('api::default-cta-banner.default-cta-banner').update({
        documentId: existing.documentId,
        data: {
          heading: 'Tier 2 Default Banner: Ready to Transform Your Platform?',
          text: 'Partner with senior software engineering specialists to build resilient, scalable digital systems.',
          buttonLabel: 'Schedule an Introductory Call',
          buttonLink: '/schedule-a-call',
          themeVariant: 'gradient',
        },
      });
    } else {
      testDoc = await app.documents('api::default-cta-banner.default-cta-banner').create({
        data: {
          heading: 'Tier 2 Default Banner: Ready to Transform Your Platform?',
          text: 'Partner with senior software engineering specialists to build resilient, scalable digital systems.',
          buttonLabel: 'Schedule an Introductory Call',
          buttonLink: '/schedule-a-call',
          themeVariant: 'gradient',
        },
      });
    }
    console.log('Created test entry documentId:', testDoc.documentId);
    return { existingDocumentId: existing?.documentId, createdDocumentId: testDoc.documentId };
  } finally {
    await app.destroy();
  }
}

test().catch(err => {
  console.error(err);
  process.exit(1);
});
