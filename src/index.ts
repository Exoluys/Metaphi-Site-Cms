import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * An asynchronous bootstrap function that runs before
   * your application gets started.
   *
   * IDEMPOTENT: every block checks before acting.
   * It NEVER creates, overwrites or relinks anything that already exists.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    try {
      // ── 1. Grant public read permissions (idempotent) ───────────────────
      const publicRole = await strapi
        .query('plugin::users-permissions.role')
        .findOne({ where: { type: 'public' }, populate: ['permissions'] });

      if (publicRole) {
        const requiredActions = [
          'api::service.service.find',
          'api::service.service.findOne',
          'api::service-category.service-category.find',
          'api::service-category.service-category.findOne',
          'api::industry.industry.find',
          'api::industry.industry.findOne',
          'api::case-study.case-study.find',
          'api::case-study.case-study.findOne',
        ];

        for (const action of requiredActions) {
          const hasPerm = publicRole.permissions?.some(
            (p: any) => p.action === action
          );
          if (!hasPerm) {
            await strapi.query('plugin::users-permissions.permission').create({
              data: { action, role: publicRole.id },
            });
            strapi.log.info(`[Bootstrap] Granted permission "${action}" to public role.`);
          }
        }
      }

      // ── 2. Ensure standard ServiceCategories exist (never overwrite) ────
      const defaultCategories = [
        { name: 'Data', slug: 'data', order: 1 },
        { name: 'AI/ML', slug: 'ai', order: 2 },
        { name: 'Digital', slug: 'digital', order: 3 },
        { name: 'Software', slug: 'software', order: 4 },
        { name: 'Application', slug: 'application', order: 5 },
        { name: 'Cloud', slug: 'cloud', order: 6 },
        { name: 'Solutions', slug: 'solutions', order: 7 },
      ];

      for (const cat of defaultCategories) {
        const existing = await strapi
          .documents('api::service-category.service-category')
          .findFirst({ filters: { slug: cat.slug } });

        if (!existing) {
          await strapi.documents('api::service-category.service-category').create({
            data: cat,
            status: 'published',
          });
          strapi.log.info(`[Bootstrap] Created ServiceCategory "${cat.name}" (${cat.slug})`);
        }
        // Already exists — do nothing. No update, no re-link.
      }

      // ── 3. One-time service seed (only when 0 service documents exist) ──
      const existingServiceCount = await strapi.documents('api::service.service').count({});
      if (existingServiceCount === 0) {
        const categoryMapBySlug: Record<string, string> = {
          'data-engineering': 'data',
          'data-analytics': 'data',
          'data-visualization': 'data',
          'business-intelligence': 'data',
          'generative-ai-development': 'ai',
          'ai-agent-development': 'ai',
          'ml-development': 'ai',
          'natural-language-processing': 'ai',
          'digital-transformation': 'digital',
          'product-design-and-ux': 'digital',
          'digital-twin-engineering': 'digital',
          'software-development': 'software',
          'qa-testing': 'software',
          'mvp-development': 'software',
          'mobile-app-development': 'application',
          'web-application-development': 'application',
          'saas-application-development': 'application',
          'progressive-web-apps': 'application',
          'cloud-engineering': 'cloud',
          'cloud-migration': 'cloud',
          'devops-and-kubernetes': 'cloud',
          'cicd-pipeline-automation': 'cloud',
          'crm-development': 'solutions',
          'web-portal-development': 'solutions',
          'cms-development': 'solutions',
          'erp-development': 'solutions',
          'on-demand-solutions': 'solutions',
        };

        // Build category documentId map from live DB
        const categoryDocIds: Record<string, string> = {};
        for (const cat of defaultCategories) {
          const found = await strapi
            .documents('api::service-category.service-category')
            .findFirst({ filters: { slug: cat.slug } });
          if (found) categoryDocIds[cat.slug] = found.documentId;
        }

        const dataFilePath = path.resolve(process.cwd(), 'services-data.json');
        if (fs.existsSync(dataFilePath)) {
          const raw = fs.readFileSync(dataFilePath, 'utf8');
          const services = JSON.parse(raw);
          strapi.log.info(`[Bootstrap] Initial seed of ${services.length} services from services-data.json...`);

          for (const service of services) {
            const catSlug = categoryMapBySlug[service.slug] || 'solutions';
            const catDocId = categoryDocIds[catSlug];
            const summary = service.summary || '';
            const seoDescription =
              service.seoDescription || (summary.length > 160 ? summary.slice(0, 160) : summary);
            const body = Array.isArray(service.body) ? service.body.join('\n\n') : '';

            await strapi.documents('api::service.service').create({
              data: {
                slug: service.slug,
                title: service.title,
                summary,
                body,
                icon: service.icon || null,
                order: Math.round(Number(service.order) || 0),
                seoDescription,
                category: catDocId || null,
                categorySlug: catSlug,
              },
              status: 'published',
            });
          }
          strapi.log.info(`[Bootstrap] Completed initial service seed!`);
        }
      }
    } catch (err: any) {
      strapi.log.error(`[Bootstrap Error] ${err.message}`);
    }
  },
};
