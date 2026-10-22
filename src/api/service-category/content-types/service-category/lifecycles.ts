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

    const baseSlug = generateSlug(data.name);

    const existing = await strapi.documents('api::service-category.service-category').findMany({
      fields: ['slug'],
    });
    const existingSlugs = new Set<string>(existing.map((c: any) => c.slug).filter(Boolean));

    data.slug = ensureUniqueSlug(baseSlug, existingSlugs);
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
