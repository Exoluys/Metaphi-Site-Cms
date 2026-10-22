import { generateSlug, ensureUniqueSlug } from '../../../../utils/slugify';
import { errors } from '@strapi/utils';

declare const strapi: any;

async function resolveExistingIndustry(where: any, data: any): Promise<{ id?: number; documentId?: string; slug?: string } | null> {
  if (where?.id && typeof where.id === 'number') {
    const doc = await strapi.db.query('api::industry.industry').findOne({
      where: { id: where.id },
    });
    if (doc) return doc;
  }

  const docId = where?.documentId || (typeof where?.id === 'string' ? where.id : undefined) || data?.documentId;
  if (docId && typeof docId === 'string') {
    const doc = await strapi.documents('api::industry.industry').findOne({
      documentId: docId,
    });
    if (doc) return doc;

    const byQuery = await strapi.db.query('api::industry.industry').findOne({
      where: { documentId: docId },
    });
    if (byQuery) return byQuery;
  }

  return null;
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new errors.ValidationError('Industry title is required and cannot be empty.');
    }
    data.title = data.title.trim();

    // Validate whole number order (>= 0)
    if (data.order !== undefined && data.order !== null) {
      const num = Number(data.order);
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        throw new errors.ValidationError(`order must be a non-negative whole integer (minimum 0). Received: "${data.order}".`);
      }
      data.order = num;
    } else {
      data.order = 0;
    }

    // Check if updating/re-saving an existing document
    const existing = await resolveExistingIndustry(event.params.where, data);
    if (existing?.slug) {
      data.slug = existing.slug;
      return;
    }

    // If an explicit slug is provided (e.g. from migration script), preserve it; otherwise generate
    const currentDocId = existing?.documentId || data.documentId;
    const allExisting = await strapi.documents('api::industry.industry').findMany({
      fields: ['slug', 'documentId'],
    });
    const otherSlugs = new Set<string>();
    for (const item of allExisting) {
      if (item.slug && item.documentId !== currentDocId) {
        otherSlugs.add(item.slug);
      }
    }

    if (data.slug && typeof data.slug === 'string' && data.slug.trim()) {
      data.slug = ensureUniqueSlug(data.slug.trim(), otherSlugs);
    } else {
      const baseSlug = generateSlug(data.title);
      data.slug = ensureUniqueSlug(baseSlug, otherSlugs);
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;

    if (data.title !== undefined) {
      if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
        throw new errors.ValidationError('Industry title is required and cannot be empty.');
      }
      data.title = data.title.trim();
    }

    // Validate whole number order (>= 0)
    if (data.order !== undefined && data.order !== null) {
      const num = Number(data.order);
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        throw new errors.ValidationError(`order must be a non-negative whole integer (minimum 0). Received: "${data.order}".`);
      }
      data.order = num;
    }

    // Keep slug strictly stable once created - resolve by numeric id or documentId
    const existing = await resolveExistingIndustry(where, data);
    if (existing?.slug) {
      data.slug = existing.slug;
    }
  },
};
