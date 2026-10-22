import { generateSlug, ensureUniqueSlug } from '../../../../utils/slugify';
import { errors } from '@strapi/utils';

declare const strapi: any;

/**
 * Helper to resolve category entity from diverse Strapi relation representations:
 * - documentId string
 * - integer id
 * - object with documentId or id or slug
 */
async function fetchCategory(target: any): Promise<{ id: number; documentId: string; slug: string } | null> {
  if (!target) return null;

  if (typeof target === 'string' && target.trim()) {
    const trimmed = target.trim();
    const byDocId = await strapi.documents('api::service-category.service-category').findOne({
      documentId: trimmed,
    });
    if (byDocId) return { id: byDocId.id, documentId: byDocId.documentId, slug: byDocId.slug };

    const bySlug = await strapi.documents('api::service-category.service-category').findFirst({
      filters: { slug: trimmed },
    });
    if (bySlug) return { id: bySlug.id, documentId: bySlug.documentId, slug: bySlug.slug };
  }

  if (typeof target === 'number') {
    const byId = await strapi.db.query('api::service-category.service-category').findOne({
      where: { id: target },
    });
    if (byId) return { id: byId.id, documentId: byId.documentId, slug: byId.slug };
  }

  if (typeof target === 'object') {
    if (target.documentId) {
      const byDocId = await strapi.documents('api::service-category.service-category').findOne({
        documentId: target.documentId,
      });
      if (byDocId) return { id: byDocId.id, documentId: byDocId.documentId, slug: byDocId.slug };
    }
    if (target.id) {
      const byId = await strapi.db.query('api::service-category.service-category').findOne({
        where: { id: target.id },
      });
      if (byId) return { id: byId.id, documentId: byId.documentId, slug: byId.slug };
    }
    if (target.slug) {
      const bySlug = await strapi.documents('api::service-category.service-category').findFirst({
        filters: { slug: target.slug },
      });
      if (bySlug) return { id: bySlug.id, documentId: bySlug.documentId, slug: bySlug.slug };
    }
  }

  return null;
}

/**
 * Fetch existing service entity handling both numeric id and documentId string,
 * falling back to categorySlug and sibling row if necessary.
 */
async function resolveExistingService(where: any, data: any): Promise<{
  id?: number;
  documentId?: string;
  slug?: string;
  categorySlug?: string;
  category?: { slug?: string };
} | null> {
  let doc: any = null;

  // 1. If where has a numeric id, query via db.query with populated category
  if (where?.id && typeof where.id === 'number') {
    doc = await strapi.db.query('api::service.service').findOne({
      where: { id: where.id },
      populate: ['category'],
    });
  }

  // 2. If doc not found yet and we have a documentId string
  const docId = where?.documentId || (typeof where?.id === 'string' ? where.id : undefined) || data?.documentId;
  if (!doc && docId && typeof docId === 'string') {
    // Try findOne default
    doc = await strapi.documents('api::service.service').findOne({
      documentId: docId,
      populate: ['category'],
    });

    // If still null, try finding via db.query
    if (!doc) {
      doc = await strapi.db.query('api::service.service').findOne({
        where: { documentId: docId },
        populate: ['category'],
      });
    }
  }

  if (!doc) return null;

  // Check if this row has category.slug or categorySlug
  if (doc.category?.slug || doc.categorySlug) {
    return doc;
  }

  // If this row has neither, check the sibling row (same documentId, opposite publishedAt status)
  if (doc.documentId) {
    const isPublished = Boolean(doc.publishedAt);
    const siblingWhere: any = {
      documentId: doc.documentId,
      publishedAt: isPublished ? { $null: true } : { $notNull: true },
    };

    const sibling = await strapi.db.query('api::service.service').findOne({
      where: siblingWhere,
      populate: ['category'],
    });

    if (sibling?.category?.slug || sibling?.categorySlug) {
      return {
        ...doc,
        category: sibling.category || doc.category,
        categorySlug: sibling.categorySlug || doc.categorySlug,
      };
    }
  }

  return doc;
}

/**
 * Determine the effective category slug for a service document.
 */
async function computeEffectiveCategorySlug(
  categoryParam: any,
  where: any,
  data: any
): Promise<string | null> {
  const existingDoc = await resolveExistingService(where, data);

  const existingCatSlug = existingDoc?.category?.slug || existingDoc?.categorySlug || null;

  // If category field is not provided in data at all (undefined), keep existing
  if (categoryParam === undefined) {
    return existingCatSlug;
  }

  // If category is explicitly null or empty string, it is cleared
  if (categoryParam === null || categoryParam === '') {
    return null;
  }

  // Check relational payload structure: { connect, disconnect }, { set }, etc.
  if (typeof categoryParam === 'object') {
    // If set is provided:
    if (categoryParam.set !== undefined) {
      const setList = Array.isArray(categoryParam.set) ? categoryParam.set : [categoryParam.set];
      const target = setList.filter(Boolean)[0];
      if (!target) return null;
      const resolved = await fetchCategory(target);
      return resolved ? resolved.slug : null;
    }

    // If connect/disconnect are provided:
    const connectList = Array.isArray(categoryParam.connect) ? categoryParam.connect.filter(Boolean) : [];
    const disconnectList = Array.isArray(categoryParam.disconnect) ? categoryParam.disconnect.filter(Boolean) : [];

    // If something was connected, resolve it
    if (connectList.length > 0) {
      const resolved = await fetchCategory(connectList[0]);
      if (resolved) return resolved.slug;
    }

    // If disconnect has items, check if existing was disconnected
    if (disconnectList.length > 0) {
      if (connectList.length === 0) {
        return null;
      }
    }

    // connect is empty and disconnect is empty: means "no change"
    if (connectList.length === 0 && disconnectList.length === 0) {
      return existingCatSlug;
    }
  }

  // Direct ID or DocumentId or object
  const resolved = await fetchCategory(categoryParam);
  if (resolved) return resolved.slug;

  return existingCatSlug;
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    // 1. Mandatory title enforcement
    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new errors.ValidationError('Service title is required and cannot be empty.');
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

    // 3. Category resolution
    let resolvedSlug = await computeEffectiveCategorySlug(data.category, event.params.where, data);

    if (!resolvedSlug && data.categorySlug) {
      const cat = await strapi.documents('api::service-category.service-category').findFirst({
        filters: { slug: data.categorySlug },
      });
      if (cat) {
        resolvedSlug = cat.slug;
      }
    }

    if (!resolvedSlug) {
      throw new errors.ValidationError('Category is required. Please select a Category from the dropdown.');
    }
    data.categorySlug = resolvedSlug;

    // 4. Slug generation: ONLY on first create. Never regenerate on edit or publish.
    const existingDoc = await resolveExistingService(event.params.where, data);
    if (existingDoc?.slug) {
      data.slug = existingDoc.slug;
      return;
    }

    const baseSlug = generateSlug(data.title);

    // Retrieve existing distinct slugs excluding own documentId
    const existing = await strapi.documents('api::service.service').findMany({
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
        throw new errors.ValidationError('Service title is required and cannot be empty.');
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

    // 3. Category resolution & re-sync
    // Only re-evaluate if category or categorySlug is part of event.params.data
    if (data.category !== undefined || data.categorySlug !== undefined) {
      const effectiveSlug = await computeEffectiveCategorySlug(data.category, where, data);

      if (!effectiveSlug) {
        throw new errors.ValidationError('Category is required. Please select a valid Category from the dropdown.');
      }
      data.categorySlug = effectiveSlug;
    }

    // 4. NEVER regenerate slug on update or publish. Slugs are strictly immutable once created.
    const existingDoc = await resolveExistingService(where, data);
    if (existingDoc?.slug) {
      data.slug = existingDoc.slug;
    }
  },
};
