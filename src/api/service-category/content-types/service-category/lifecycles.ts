import { generateSlug, ensureUniqueSlug } from '../../../../utils/slugify';
import { errors } from '@strapi/utils';

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    if (!data.name || typeof data.name !== 'string' || !data.name.trim()) {
      throw new Error('ServiceCategory name is required and cannot be empty.');
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
        throw new Error('ServiceCategory name is required and cannot be empty.');
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

    // Keep slug stable once created
    if (where?.id || where?.documentId) {
      const current = await strapi.documents('api::service-category.service-category').findOne({
        documentId: where.documentId || where.id,
      });

      if (current?.slug) {
        data.slug = current.slug;
      } else if (data.name) {
        const baseSlug = generateSlug(data.name);
        const existing = await strapi.documents('api::service-category.service-category').findMany({
          fields: ['slug'],
        });
        const existingSlugs = new Set<string>(existing.map((c: any) => c.slug).filter(Boolean));
        data.slug = ensureUniqueSlug(baseSlug, existingSlugs);
      }
    }
  },
};
