import { generateSlug, ensureUniqueSlug } from '../../../../utils/slugify';

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;

    if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
      throw new Error('CaseStudy title is required and cannot be empty.');
    }
    data.title = data.title.trim();

    const baseSlug = generateSlug(data.title);

    const existing = await strapi.documents('api::case-study.case-study').findMany({
      fields: ['slug'],
    });
    const existingSlugs = new Set<string>(existing.map((c: any) => c.slug).filter(Boolean));

    data.slug = ensureUniqueSlug(baseSlug, existingSlugs);
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;

    if (data.title !== undefined) {
      if (!data.title || typeof data.title !== 'string' || !data.title.trim()) {
        throw new Error('CaseStudy title is required and cannot be empty.');
      }
      data.title = data.title.trim();
    }

    if (where?.id || where?.documentId) {
      const current = await strapi.documents('api::case-study.case-study').findOne({
        documentId: where.documentId || where.id,
      });

      if (current?.slug) {
        data.slug = current.slug;
      } else if (data.title) {
        const baseSlug = generateSlug(data.title);
        const existing = await strapi.documents('api::case-study.case-study').findMany({
          fields: ['slug'],
        });
        const existingSlugs = new Set<string>(existing.map((c: any) => c.slug).filter(Boolean));
        data.slug = ensureUniqueSlug(baseSlug, existingSlugs);
      }
    }
  },
};
