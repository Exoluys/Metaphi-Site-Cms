import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
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
          'api::industry.industry.find',
          'api::industry.industry.findOne',
          'api::case-study.case-study.find',
          'api::case-study.case-study.findOne',
          'api::team-page.team-page.find',
          'api::team-member.team-member.find',
          'api::team-member.team-member.findOne',
          'api::partners-page.partners-page.find',
          'api::partner.partner.find',
          'api::partner.partner.findOne',
          'api::compliance-page.compliance-page.find',
          'api::contact-page.contact-page.find',
          'api::schedule-a-call-page.schedule-a-call-page.find',
          'api::faq-category.faq-category.find',
          'api::faq-category.faq-category.findOne',
          'api::faq.faq.find',
          'api::faq.faq.findOne',
          'api::faq-page.faq-page.find',
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

      // ── 2. Ensure slug fields are read-only in Admin Content Manager ────
      const lockedContentTypes = [
        'plugin_content_manager_configuration_content_types::api::industry.industry',
        'plugin_content_manager_configuration_content_types::api::solution.solution',
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

      // ── 3. Ensure Order hint is set on Industry in Admin Content Manager ──
      const industryConfigRows = await strapi.db
        .connection('strapi_core_store_settings')
        .where({ key: 'plugin_content_manager_configuration_content_types::api::industry.industry' })
        .select('id', 'value');

      if (industryConfigRows.length > 0) {
        const config = JSON.parse(industryConfigRows[0].value);
        let updated = false;
        const ORDER_HINT = 'Lower number shows first. Navbar and footer show the first 10; the Industries page shows all.';
        if (config?.metadatas?.order?.edit?.description !== ORDER_HINT) {
          config.metadatas = config.metadatas || {};
          config.metadatas.order = config.metadatas.order || {};
          config.metadatas.order.edit = {
            ...config.metadatas.order.edit,
            description: ORDER_HINT,
          };
          updated = true;
          strapi.log.info('[Bootstrap] Set order hint on Industry order field');
        }
        if (updated) {
          await strapi.db
            .connection('strapi_core_store_settings')
            .where({ id: industryConfigRows[0].id })
            .update({ value: JSON.stringify(config) });
        }
      }

      // ── 4. Ensure solutionModelsImage is in Home Page edit layout ────────
      const homeConfigRows = await strapi.db
        .connection('strapi_core_store_settings')
        .where({ key: 'plugin_content_manager_configuration_content_types::api::home-page.home-page' })
        .select('id', 'value');

      if (homeConfigRows.length > 0) {
        const config = JSON.parse(homeConfigRows[0].value);
        const editRows = config?.layouts?.edit;
        if (Array.isArray(editRows)) {
          const hasImageField = editRows.some((row: any[]) =>
            row.some((field: any) => field.name === 'solutionModelsImage')
          );
          if (!hasImageField) {
            // Insert solutionModelsImage row right after solutionModelsSubtext
            const subtextRowIdx = editRows.findIndex((row: any[]) =>
              row.some((field: any) => field.name === 'solutionModelsSubtext')
            );
            const imageRow = [{ name: 'solutionModelsImage', size: 12 }];
            if (subtextRowIdx !== -1) {
              editRows.splice(subtextRowIdx + 1, 0, imageRow);
            } else {
              editRows.push(imageRow);
            }
            // Remove obsolete customCapabilitiesSection and readyToConfigureSection if present
            const filteredRows = editRows.filter((row: any[]) =>
              !row.some((f: any) => f.name === 'customCapabilitiesSection' || f.name === 'readyToConfigureSection')
            );
            config.layouts.edit = filteredRows;
            await strapi.db
              .connection('strapi_core_store_settings')
              .where({ id: homeConfigRows[0].id })
              .update({ value: JSON.stringify(config) });
            strapi.log.info('[Bootstrap] Applied solutionModelsImage and cleaned layouts for Home Page');
          }
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

        // ── 7b. Enforce transformationThemes on industries-hub ─────────
        if (uid === 'api::industries-hub.industries-hub' && (action === 'update' || action === 'create')) {
          const tt = ctx.params?.data?.transformationThemes;
          if (tt && tt.items !== undefined) {
            const items = tt.items;
            if (!Array.isArray(items) || items.length < 3) {
              throw new Error(`transformationThemes.items must contain at least 3 items. Received ${Array.isArray(items) ? items.length : typeof items}.`);
            }
            for (let i = 0; i < items.length; i++) {
              const item = items[i];
              if (!item || !item.text || typeof item.text !== 'string' || !item.text.trim()) {
                throw new Error(`transformationThemes.items[${i}].text is required and cannot be empty.`);
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

        // ── 9. Enforce fixed names and order validation on Industries ──
        if (uid === 'api::industry.industry' && (action === 'update' || action === 'create')) {
          const CANONICAL_INDUSTRY_TITLES: Record<string, string> = {
            'manufacturing': 'Manufacturing',
            'healthcare': 'Healthcare & Life Sciences',
            'logistics': 'Logistics & 3PL',
            'finance': 'Banking, Payments & FinTech',
            'professional-services': 'Professional Services',
            'retail-and-ecommerce': 'Retail & Ecommerce',
            'consumer-platforms-and-marketplaces': 'Consumer Platforms & Marketplaces',
            'associations-and-communities': 'Associations & Communities',
            'education': 'Education & Training',
            'government-and-public-sector': 'Government & Public Sector',
          };
          let slug = ctx.params?.data?.slug;
          const currentDocId = ctx.params?.documentId || ctx.params?.where?.documentId;
          if (!slug && currentDocId) {
            const existing = await strapi.documents('api::industry.industry').findOne({
              documentId: currentDocId,
              fields: ['slug'],
            });
            slug = existing?.slug;
          }
          if (slug && CANONICAL_INDUSTRY_TITLES[slug]) {
            if (ctx.params?.data && ctx.params.data.title !== undefined) {
              ctx.params.data.title = CANONICAL_INDUSTRY_TITLES[slug];
            }
          }

          // Order validation in Document Service
          if (action === 'create' || (ctx.params?.data && ctx.params.data.order !== undefined)) {
            const orderVal = ctx.params?.data?.order;
            if (orderVal === undefined || orderVal === null || orderVal === '') {
              if (action === 'create') {
                throw new errors.ValidationError('Industry order is required and cannot be empty.');
              }
            } else {
              const num = Number(orderVal);
              if (isNaN(num) || !Number.isInteger(num) || num < 1) {
                throw new errors.ValidationError(`order must be a positive whole integer (minimum 1). Received: "${orderVal}".`);
              }
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
