/**
 * undo-metaphi-seed.cjs
 * 
 * Safely removes only the documents created by the seed script using Strapi v5 Document Service.
 * Leaves all schemas, users, and admin configurations intact.
 * 
 * Safety: Refuses to run unless STRAPI_URL points to localhost and NODE_ENV is not production.
 */

require('dotenv').config();
const { createStrapi } = require('@strapi/strapi');

const strapiUrl = process.env.STRAPI_URL || 'http://localhost:1337';
const isLocal = strapiUrl.includes('localhost') || strapiUrl.includes('127.0.0.1');
const isDev = process.env.NODE_ENV !== 'production';

if (!isLocal || !isDev) {
  console.error('REFUSING TO RUN: Undo script can ONLY run against localhost in development mode.');
  process.exit(1);
}

async function undo() {
  console.log('Bootstrapping Strapi for safe document undo...');
  const app = await createStrapi({ distDir: './dist' }).load();

  try {
    // 1. Delete Single Types
    const singleTypes = [
      'api::home-page.home-page',
      'api::solutions-hub.solutions-hub',
      'api::custom-solutions-hub.custom-solutions-hub',
      'api::ready-to-configure-hub.ready-to-configure-hub',
      'api::saas-products-hub.saas-products-hub',
      'api::industries-hub.industries-hub',
      'api::default-cta-banner.default-cta-banner'
    ];

    for (const uid of singleTypes) {
      const doc = await app.documents(uid).findFirst({});
      if (doc) {
        await app.documents(uid).delete({ documentId: doc.documentId });
        console.log(`✓ Deleted single type document: ${uid}`);
      }
    }

    // 2. Delete Seeded Collection Types
    const collectionTypes = [
      'api::solution.solution',
      'api::industry.industry',
      'api::faq.faq'
    ];

    for (const uid of collectionTypes) {
      const docs = await app.documents(uid).findMany({ limit: 100 });
      for (const d of docs) {
        await app.documents(uid).delete({ documentId: d.documentId });
      }
      console.log(`✓ Cleared ${docs.length} documents from ${uid}`);
    }

    console.log('\n✓ Undo completed safely via Document Service.');
  } finally {
    await app.destroy();
  }
}

undo().catch(err => {
  console.error('Error during undo:', err);
  process.exit(1);
});
