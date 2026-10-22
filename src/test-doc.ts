import type { Core } from '@strapi/strapi';

async function testDocService(strapi: Core.Strapi) {
  try {
    const docId = 'cej10np9tt9lit5550fx25sc';
    console.log('[TEST] Calling findOne on digital-twin-engineering with status draft:');
    const draft = await strapi.documents('api::service.service').findOne({
      documentId: docId,
      status: 'draft',
      populate: ['category'],
    });
    console.log('[TEST] Draft result:', { id: draft?.id, docId: draft?.documentId, cat: draft?.category, categorySlug: draft?.categorySlug });

    console.log('[TEST] Calling findOne on digital-twin-engineering with status published:');
    const pub = await strapi.documents('api::service.service').findOne({
      documentId: docId,
      status: 'published',
      populate: ['category'],
    });
    console.log('[TEST] Pub result:', { id: pub?.id, docId: pub?.documentId, cat: pub?.category, categorySlug: pub?.categorySlug });

    console.log('[TEST] Calling findOne on digital-twin-engineering without status:');
    const def = await strapi.documents('api::service.service').findOne({
      documentId: docId,
      populate: ['category'],
    });
    console.log('[TEST] Default result:', { id: def?.id, docId: def?.documentId, cat: def?.category, categorySlug: def?.categorySlug });
  } catch (err: any) {
    console.error('[TEST ERROR]', err);
  }
}

export default testDocService;
