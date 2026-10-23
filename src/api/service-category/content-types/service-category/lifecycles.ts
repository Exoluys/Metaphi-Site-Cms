import { generateSlug, ensureUniqueSlug } from '../../../../utils/slugify';
import { errors } from '@strapi/utils';

declare const strapi: any;

async function resolveExistingServiceCategory(where: any, data: any): Promise<{ id?: number; documentId?: string; slug?: string } | null> {
  if (where?.id && typeof where.id === 'number') {
    const doc = await strapi.db.query('api::service-category.service-category').findOne({
      where: { id: where.id },
    });
    if (doc) return doc;
  }

  const docId = where?.documentId || (typeof where?.id === 'string' ? where.id : undefined) || data?.documentId;
  if (docId && typeof docId === 'string') {
    const doc = await strapi.documents('api::service-category.service-category').findOne({
      documentId: docId,
    });
    if (doc) return doc;

    const byQuery = await strapi.db.query('api::service-category.service-category').findOne({
      where: { documentId: docId },
    });
    if (byQuery) return byQuery;
  }

  return null;
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      throw new errors.ValidationError('ServiceCategory name is required and cannot be empty.');
    }
    data.name = data.name.trim();

    if (data.order !== undefined && data.order !== null) {
      const num = Number(data.order);
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        throw new errors.ValidationError(`order must be a non-negative whole integer (minimum 0). Received: "${data.order}".`);
      }
      data.order = num;
    } else {
      data.order = 0;
    }

    // Gather all existing slugs (excluding any sibling of this documentId)
    const currentDocId = data.documentId || null;
    const allExisting = await strapi.documents('api::service-category.service-category').findMany({
      fields: ['slug', 'documentId'],
    });
    const otherSlugs = new Set<string>();
    for (const item of allExisting) {
      if (item.slug && item.documentId !== currentDocId) {
        otherSlugs.add(item.slug);
      }
    }

    // Honor an explicit slug if provided (e.g. seed scripts), otherwise generate from name
    if (data.slug && typeof data.slug === 'string' && data.slug.trim()) {
      data.slug = ensureUniqueSlug(data.slug.trim(), otherSlugs);
    } else {
      const baseSlug = generateSlug(data.name);
      data.slug = ensureUniqueSlug(baseSlug, otherSlugs);
    }
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;

    if (data.name !== undefined) {
      if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
        throw new errors.ValidationError('ServiceCategory name is required and cannot be empty.');
      }
      data.name = data.name.trim();
    }

    if (data.order !== undefined && data.order !== null) {
      const num = Number(data.order);
      if (isNaN(num) || !Number.isInteger(num) || num < 0) {
        throw new errors.ValidationError(`order must be a non-negative whole integer (minimum 0). Received: "${data.order}".`);
      }
      data.order = num;
    }

    // Keep slug strictly stable once created - resolve by numeric id or documentId
    const existing = await resolveExistingServiceCategory(where, data);
    if (existing?.slug) {
      data.slug = existing.slug;
    }
  },
};
