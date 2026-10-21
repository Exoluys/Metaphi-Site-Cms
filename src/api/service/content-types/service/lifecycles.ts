import { generateSlug, ensureUniqueSlug } from '../../../../utils/slugify';
import { errors } from '@strapi/utils';

declare const strapi: any;

/**
 * Helper to resolve category slug from category relation param.
 * In Strapi v5 document actions, category can be passed as:
 * - documentId string
 * - { connect: [ { id / documentId } ] }
 * - { set: [ ... ] } or { id }
 * - integer id
 */
async function resolveCategorySlug(categoryParam: any): Promise<string | null> {
  if (!categoryParam) return null;

  // Direct documentId string
  if (typeof categoryParam === 'string' && categoryParam.trim()) {
    const cat = await strapi.documents('api::service-category.service-category').findOne({
      documentId: categoryParam.trim(),
    });
    if (cat?.slug) return cat.slug;

    // Check by slug directly
    const catBySlug = await strapi.documents('api::service-category.service-category').findFirst({
      filters: { slug: categoryParam.trim() },
    });
    if (catBySlug?.slug) return catBySlug.slug;
  }

  // Integer id
  if (typeof categoryParam === 'number') {
    const cat = await strapi.documents('api::service-category.service-category').findFirst({
      filters: { id: categoryParam },
    });
    if (cat?.slug) return cat.slug;
  }

  // Relational connect object e.g. { connect: [{ id: ... }] } or { connect: ['...'] }
  if (typeof categoryParam === 'object') {
    const target = Array.isArray(categoryParam.connect)
      ? categoryParam.connect[0]
      : Array.isArray(categoryParam.set)
      ? categoryParam.set[0]
      : categoryParam;

    if (target) {
      if (typeof target === 'string') {
        const cat = await strapi.documents('api::service-category.service-category').findOne({
          documentId: target,
        });
        if (cat?.slug) return cat.slug;
      }
      if (typeof target === 'object') {
        if (target.documentId) {
          const cat = await strapi.documents('api::service-category.service-category').findOne({
            documentId: target.documentId,
          });
          if (cat?.slug) return cat.slug;
        }
        if (target.id) {
          const cat = await strapi.documents('api::service-category.service-category').findFirst({
            filters: { id: target.id },
          });
          if (cat?.slug) return cat.slug;
        }
        if (target.slug) {
          return target.slug;
        }
      }
    }
  }

  return null;
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    // 1. Mandatory title enforcement
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new Error('Service title is required and cannot be empty.');
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

    // 3. Category is required and sets categorySlug automatically before insert
    let resolvedSlug = await resolveCategorySlug(data.category);
    if (!resolvedSlug && data.categorySlug) {
      // If categorySlug was passed directly, verify it
      const cat = await strapi.documents('api::service-category.service-category').findFirst({
        filters: { slug: data.categorySlug },
      });
      if (cat) {
        resolvedSlug = cat.slug;
      }
    }

    if (!resolvedSlug) {
      throw new Error('Category is required. Please select a Category from the dropdown.');
    }
    data.categorySlug = resolvedSlug;

    // 4. Slug generation: ONLY on first create. Never regenerate on edit or publish.
    const currentDocId = event.params.where?.documentId || data.documentId;
    if (currentDocId) {
      const existingDoc = await strapi.documents('api::service.service').findOne({
        documentId: currentDocId,
      });
      if (existingDoc?.slug) {
        data.slug = existingDoc.slug;
        return;
      }
    }

    const baseSlug = generateSlug(data.title);

    // Retrieve existing distinct slugs excluding own documentId
    const existing = await strapi.documents('api::service.service').findMany({
      fields: ['slug', 'documentId'],
    });

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
        throw new Error('Service title is required and cannot be empty.');
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

    // 3. Category re-sync: if category is modified, categorySlug MUST follow immediately
    if (data.category !== undefined) {
      const resolvedSlug = await resolveCategorySlug(data.category);
      if (!resolvedSlug) {
        throw new Error('Category cannot be empty. Please select a valid Category.');
      }
      data.categorySlug = resolvedSlug;
    }

    // 4. NEVER regenerate slug on update or publish. Slugs are strictly immutable once created.
    if (where?.id || where?.documentId) {
      const current = await strapi.documents('api::service.service').findOne({
        documentId: where.documentId || where.id,
      });

      if (current?.slug) {
        // Enforce the existing slug, completely discarding any edit attempt
        data.slug = current.slug;
      }
    }
  },
};
