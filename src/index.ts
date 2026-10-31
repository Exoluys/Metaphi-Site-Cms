import type { Core } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) { },

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
          'api::reviewer.reviewer.find',
          'api::reviewer.reviewer.findOne',
          'api::team-page.team-page.find',
          'api::team-member.team-member.find',
          'api::team-member.team-member.findOne',
          'api::partners-page.partners-page.find',
          'api::partner.partner.find',
          'api::partner.partner.findOne',
          'api::compliance-page.compliance-page.find',
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

      // ── 4. Ensure slug fields are read-only in Admin Content Manager ────
      const lockedContentTypes = [
        'plugin_content_manager_configuration_content_types::api::industry.industry',
        'plugin_content_manager_configuration_content_types::api::service.service',
        'plugin_content_manager_configuration_content_types::api::case-study.case-study',
      ];

      for (const key of lockedContentTypes) {
        const rows = await strapi.db
          .connection('strapi_core_store_settings')
          .where({ key })
          .select('id', 'value');

        if (rows.length > 0) {
          const config = JSON.parse(rows[0].value);
          if (config?.metadatas?.slug?.edit && config.metadatas.slug.edit.editable !== false) {
            config.metadatas.slug.edit.editable = false;
            config.metadatas.slug.edit.description =
              'Automatically generated from title on creation. Never typed, immutable.';
            await strapi.db
              .connection('strapi_core_store_settings')
              .where({ id: rows[0].id })
              .update({ value: JSON.stringify(config) });
            strapi.log.info(`[Bootstrap] Locked slug field (read-only) for ${key}`);
          }
        }
      }

      // ── 5. Ensure Trust Bar help text is set in Admin Content Manager ──
      const TRUST_BAR_HELP_TEXT =
        'Add at least one client logo. If no logos are added, the trust bar will not be shown on the page.';

      // Industry Content Type (clientLogos field)
      const industryConfigRows = await strapi.db
        .connection('strapi_core_store_settings')
        .where({ key: 'plugin_content_manager_configuration_content_types::api::industry.industry' })
        .select('id', 'value');

      if (industryConfigRows.length > 0) {
        const config = JSON.parse(industryConfigRows[0].value);
        if (config?.metadatas?.clientLogos?.edit?.description !== TRUST_BAR_HELP_TEXT) {
          config.metadatas = config.metadatas || {};
          config.metadatas.clientLogos = config.metadatas.clientLogos || {};
          config.metadatas.clientLogos.edit = {
            ...config.metadatas.clientLogos.edit,
            description: TRUST_BAR_HELP_TEXT,
          };
          await strapi.db
            .connection('strapi_core_store_settings')
            .where({ id: industryConfigRows[0].id })
            .update({ value: JSON.stringify(config) });
          strapi.log.info('[Bootstrap] Set trust bar help text on Industry clientLogos');
        }
      }

      // Trust Bar Component (heading field)
      const trustBarConfigRows = await strapi.db
        .connection('strapi_core_store_settings')
        .where({ key: 'plugin_content_manager_configuration_components::industry-page.trust-bar' })
        .select('id', 'value');

      if (trustBarConfigRows.length > 0) {
        const config = JSON.parse(trustBarConfigRows[0].value);
        if (config?.metadatas?.heading?.edit?.description !== TRUST_BAR_HELP_TEXT) {
          config.metadatas = config.metadatas || {};
          config.metadatas.heading = config.metadatas.heading || {};
          config.metadatas.heading.edit = {
            ...config.metadatas.heading.edit,
            description: TRUST_BAR_HELP_TEXT,
          };
          await strapi.db
            .connection('strapi_core_store_settings')
            .where({ id: trustBarConfigRows[0].id })
            .update({ value: JSON.stringify(config) });
          strapi.log.info('[Bootstrap] Set trust bar help text on Trust Bar heading');
        }
      }
      // ── 6. Enforce Minimum 1 Published Testimonial & FAQ Guard ──────
      strapi.documents.use(async (ctx: any, next: any) => {
        const { action, uid } = ctx;

        // Check if action unpublishes or deletes an entry
        const isDeleteAction = action === 'delete' || action === 'deleteMany';
        const isUnpublishAction = action === 'unpublish';

        if ((uid === 'api::testimonial.testimonial' || uid === 'api::faq.faq') && (isDeleteAction || isUnpublishAction)) {
          const contentTypeLabel = uid === 'api::testimonial.testimonial' ? 'testimonial' : 'FAQ';

          // Query count of currently published documents
          const publishedCount = await strapi.documents(uid).count({
            status: 'published',
          });

          // Check if this action affects a published document
          let affectsPublished = false;
          if (isUnpublishAction) {
            affectsPublished = true;
          } else if (isDeleteAction) {
            const docId = ctx.params?.documentId || ctx.params?.where?.documentId;
            if (docId) {
              const doc = await strapi.documents(uid).findOne({
                documentId: docId,
                status: 'published',
              });
              if (doc) affectsPublished = true;
            } else {
              affectsPublished = true;
            }
          }

          if (affectsPublished && publishedCount <= 1) {
            throw new Error(
              `Cannot ${action} this ${contentTypeLabel}. At least 1 published ${contentTypeLabel} must always exist in the system.`
            );
          }
        }

        // ── 7. Enforce companyStats on home-page ───────────────────────
        if (uid === 'api::home-page.home-page' && (action === 'update' || action === 'create')) {
          const stats = ctx.params?.data?.companyStats;
          if (stats !== undefined) {
            if (!Array.isArray(stats) || stats.length !== 4) {
              throw new Error(`companyStats must contain exactly 4 items. Received ${Array.isArray(stats) ? stats.length : typeof stats}.`);
            }
            for (let i = 0; i < stats.length; i++) {
              const item = stats[i];
              if (!item || !item.label || typeof item.label !== 'string' || !item.label.trim()) {
                throw new Error(`companyStats[${i}].label is required and cannot be empty.`);
              }
              if (item.value === undefined || item.value === null || item.value === '') {
                throw new Error(`companyStats[${i}].value is required.`);
              }
              const num = Number(item.value);
              if (isNaN(num) || !Number.isInteger(num) || num < 0) {
                throw new Error(`companyStats[${i}].value must be a non-negative integer (min 0). Received: ${item.value}`);
              }
            }
          }
        }

        // ── 8. Enforce fixed names on Stockiphi & Taskiphi solutions ──
        if (uid === 'api::solution.solution' && (action === 'update' || action === 'create')) {
          const FIXED_SAAS_NAMES: Record<string, string> = {
            stockiphi: 'Stockiphi',
            taskiphi: 'Taskiphi',
          };
          let slug = ctx.params?.data?.slug;
          if (!slug && ctx.params?.documentId) {
            const existing = await strapi.documents('api::solution.solution').findOne({
              documentId: ctx.params.documentId,
              fields: ['slug'],
            });
            slug = existing?.slug;
          }
          if (slug && FIXED_SAAS_NAMES[slug]) {
            if (ctx.params?.data && ctx.params.data.title !== undefined) {
              ctx.params.data.title = FIXED_SAAS_NAMES[slug];
            }
          }
        }

        // ── 9. Enforce fixed names on 10 Canonical Industries ─────────
        if (uid === 'api::industry.industry' && (action === 'update' || action === 'create')) {
          const CANONICAL_INDUSTRY_TITLES: Record<string, string> = {
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
          let slug = ctx.params?.data?.slug;
          if (!slug && ctx.params?.documentId) {
            const existing = await strapi.documents('api::industry.industry').findOne({
              documentId: ctx.params.documentId,
              fields: ['slug'],
            });
            slug = existing?.slug;
          }
          if (slug && CANONICAL_INDUSTRY_TITLES[slug]) {
            if (ctx.params?.data && ctx.params.data.title !== undefined) {
              ctx.params.data.title = CANONICAL_INDUSTRY_TITLES[slug];
            }
          }
        }

        return next();
      });
    } catch (err: any) {
      strapi.log.error(`[Bootstrap Error] ${err.message}`);
    }
  },
};
