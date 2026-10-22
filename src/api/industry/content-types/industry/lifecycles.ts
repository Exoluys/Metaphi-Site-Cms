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

    const baseSlug = generateSlug(data.title);

    const existing = await strapi.documents('api::industry.industry').findMany({
      fields: ['slug'],
    });
    const existingSlugs = new Set<string>(existing.map((i: any) => i.slug).filter(Boolean));

    data.slug = ensureUniqueSlug(baseSlug, existingSlugs);
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;

    if (data.title !== undefined) {
      if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
        throw new errors.ValidationError('Industry title is required and cannot be empty.');
      }
      data.title = data.title.trim();
    }

    // Keep slug strictly stable once created - resolve by numeric id or documentId
    const existing = await resolveExistingIndustry(where, data);
    if (existing?.slug) {
      data.slug = existing.slug;
    }
  },
};
