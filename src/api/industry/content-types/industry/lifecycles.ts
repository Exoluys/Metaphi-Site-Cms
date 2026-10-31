import { generateSlug, ensureUniqueSlug } from '../../../../utils/slugify';
import { errors } from '@strapi/utils';

declare const strapi: any;

export const CANONICAL_INDUSTRY_TITLES: Record<string, string> = {
  'manufacturing': 'Manufacturing',
  'healthcare': 'Healthcare & Diagnostics',
  'logistics': 'Logistics & 3PL',
  'finance': 'Financial Services & FinTech',
  'professional-services': 'Professional Services',
  'retail-and-ecommerce': 'Retail & Ecommerce',
  'consumer-platforms-and-marketplaces': 'Consumer Platforms & Marketplaces',
  'associations-and-communities': 'Associations & Communities',
  'education': 'Education & Training',
  'government-and-public-sector': 'Government & Public Sector',
};

async function resolveExistingIndustry(where: any, data: any): Promise<{ id?: number; documentId?: string; slug?: string } | null> {
  let doc: any = null;

  if (where?.id && typeof where.id === 'number') {
    doc = await strapi.db.query('api::industry.industry').findOne({
      where: { id: where.id },
    });
  }

  const docId = where?.documentId || (typeof where?.id === 'string' ? where.id : undefined) || data?.documentId;
  if (!doc && docId && typeof docId === 'string') {
    doc = await strapi.documents('api::industry.industry').findOne({
      documentId: docId,
    });
    if (!doc) {
      doc = await strapi.db.query('api::industry.industry').findOne({
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
    const sibling = await strapi.db.query('api::industry.industry').findOne({
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

    // Slug generation: ALWAYS generated from title on create (manually typed slugs are ignored)
    const baseSlug = generateSlug(data.title);
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

    data.slug = ensureUniqueSlug(baseSlug, otherSlugs);
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

    // Lock canonical industry names
    const resolvedSlug = data.slug || existing?.slug;
    if (resolvedSlug && CANONICAL_INDUSTRY_TITLES[resolvedSlug]) {
      data.title = CANONICAL_INDUSTRY_TITLES[resolvedSlug];
    }
  },
};
