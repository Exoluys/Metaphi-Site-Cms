import { generateSlug, ensureUniqueSlug } from '../../../../utils/slugify';
import { errors } from '@strapi/utils';

declare const strapi: any;

async function resolveExistingCaseStudy(where: any, data: any): Promise<{ id?: number; documentId?: string; slug?: string } | null> {
  let doc: any = null;

  if (where?.id && typeof where.id === 'number') {
    doc = await strapi.db.query('api::case-study.case-study').findOne({
      where: { id: where.id },
    });
  }

  const docId = where?.documentId || (typeof where?.id === 'string' ? where.id : undefined) || data?.documentId;
  if (!doc && docId && typeof docId === 'string') {
    doc = await strapi.documents('api::case-study.case-study').findOne({
      documentId: docId,
    });

    if (!doc) {
      doc = await strapi.db.query('api::case-study.case-study').findOne({
        where: { documentId: docId },
      });
    }
  }

  if (!doc) return null;

  if (doc.slug) {
    return doc;
  }

  // If this row has no slug, check sibling row (same documentId, opposite publishedAt state)
  if (doc.documentId) {
    const isPublished = Boolean(doc.publishedAt);
    const sibling = await strapi.db.query('api::case-study.case-study').findOne({
      where: {
        documentId: doc.documentId,
        publishedAt: isPublished ? { $null: true } : { $notNull: true },
      },
    });
    if (sibling?.slug) {
      return sibling;
    }
  }

  return doc;
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    // 1. Mandatory title enforcement
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new errors.ValidationError('CaseStudy title is required and cannot be empty.');
    }
    data.title = data.title.trim();

    // 2. Validate whole number order (>= 0, no decimals, no negatives)
    if (data.order !== undefined && data.order !== null) {
      const num = Number(data.order);
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        throw new errors.ValidationError(`order must be a non-negative whole integer (minimum 0). Received: "${data.order}".`);
      }
      data.order = num;
    } else {
      data.order = 0;
    }

    // 3. Slug generation: ONLY on first create. Never regenerate on edit or publish.
    const existingDoc = await resolveExistingCaseStudy(event.params.where, data);
    if (existingDoc?.slug) {
      data.slug = existingDoc.slug;
      return;
    }

    const baseSlug = generateSlug(data.title);

    // Retrieve existing distinct slugs excluding own documentId
    const existing = await strapi.documents('api::case-study.case-study').findMany({
      fields: ['slug', 'documentId'],
    });

    const currentDocId = existingDoc?.documentId || data.documentId;
    const otherSlugs = new Set<string>();
    for (const item of existing) {
      if (item.slug && item.documentId !== currentDocId) {
        otherSlugs.add(item.slug);
      }
    }

    data.slug = ensureUniqueSlug(baseSlug, otherSlugs);
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;

    // 1. Title validation if modified
    if (data.title !== undefined) {
      if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
        throw new errors.ValidationError('CaseStudy title is required and cannot be empty.');
      }
      data.title = data.title.trim();
    }

    // 2. Order validation if modified
    if (data.order !== undefined && data.order !== null) {
      const num = Number(data.order);
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        throw new errors.ValidationError(`order must be a non-negative whole integer (minimum 0). Received: "${data.order}".`);
      }
      data.order = num;
    }

    // 3. NEVER regenerate slug on update or publish. Slugs are strictly immutable once created.
    const existing = await resolveExistingCaseStudy(where, data);
    if (existing?.slug) {
      data.slug = existing.slug;
    }
  },
};
