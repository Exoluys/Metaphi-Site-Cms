import type { Core } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { slugify } from './utils/slug';

const SLUGIFIED_CONTENT_TYPES = [
  'api::industry.industry',
  'api::solution.solution',
  'api::case-study.case-study',
];

export default {
  /**
   * An asynchronous register function that runs before
   * your application is initialized.
   */
  register({ strapi }: { strapi: Core.Strapi }) {
    // ── Document Service Middleware: Auto-generate & sync slugs ──────
    strapi.documents.use(async (ctx: any, next: any) => {
      const { action, uid, params } = ctx;

      if (!SLUGIFIED_CONTENT_TYPES.includes(uid)) {
        return next();
      }

      // Handle create / update / clone
      if (action === 'create' || action === 'update' || action === 'clone') {
        const data = params?.data;
        if (data) {
          const documentId = params?.documentId || params?.where?.documentId;

          // If title is provided, check if it's new or changed
          if (data.title !== undefined) {
            let titleChanged = true;
            if (action === 'update' && documentId) {
              const currentDoc = await strapi.documents(uid).findOne({
                documentId,
              });
              if (currentDoc && currentDoc.title === data.title && currentDoc.slug) {
                titleChanged = false;
              }
            }

            if (titleChanged) {
              data.slug = slugify(data.title);
            }
          } else if (!data.slug && action === 'create') {
            data.slug = slugify(data.title || 'item');
          }
        }
      }

      // Handle publish: ensure published version gets identical slug as draft
      if (action === 'publish') {
        const documentId = params?.documentId || params?.where?.documentId;
        if (documentId) {
          const draftDoc = await strapi.documents(uid).findOne({
            documentId,
            status: 'draft',
          });
          if (draftDoc && draftDoc.slug) {
            params.data = params.data || {};
            params.data.slug = draftDoc.slug;
          }
        }
      }

      return next();
    });
  },

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
          'api::about-page.about-page.find',
          'api::careers-page.careers-page.find',
          'api::why-join-us-page.why-join-us-page.find',
          'api::rewards-page.rewards-page.find',
          'api::life-at-metaphi-page.life-at-metaphi-page.find',
          'api::job-opening.job-opening.find',
          'api::job-opening.job-opening.findOne',
          'api::home-page.home-page.find',
          'api::solution.solution.find',
          'api::solution.solution.findOne',
          'api::solutions-hub.solutions-hub.find',
          'api::industries-hub.industries-hub.find',
          'api::custom-solutions-hub.custom-solutions-hub.find',
          'api::ready-to-configure-hub.ready-to-configure-hub.find',
          'api::saas-products-hub.saas-products-hub.find',
          'api::testimonial.testimonial.find',
          'api::testimonial.testimonial.findOne',
          'api::testimonials-page.testimonials-page.find',
          'api::work-page.work-page.find',
          'api::default-cta-banner.default-cta-banner.find',
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

      // ── 2. Hide slug from Content Manager edit layout (idempotent) ─────
      for (const uid of SLUGIFIED_CONTENT_TYPES) {
        const configRows = await strapi.db
          .connection('strapi_core_store_settings')
          .where({ key: `plugin_content_manager_configuration_content_types::${uid}` })
          .select('id', 'value');

        if (configRows.length > 0) {
          const config = JSON.parse(configRows[0].value);
          let updated = false;

          // Remove slug from edit layout
          if (Array.isArray(config?.layouts?.edit)) {
            const newEditLayout = config.layouts.edit
              .map((row: any[]) => row.filter((field: any) => field.name !== 'slug'))
              .filter((row: any[]) => row.length > 0);

            if (JSON.stringify(newEditLayout) !== JSON.stringify(config.layouts.edit)) {
              config.layouts.edit = newEditLayout;
              updated = true;
            }
          }

          // Mark slug as not visible in edit metadata
          if (config?.metadatas?.slug?.edit?.visible !== false) {
            config.metadatas = config.metadatas || {};
            config.metadatas.slug = config.metadatas.slug || {};
            config.metadatas.slug.edit = {
              ...config.metadatas.slug.edit,
              visible: false,
            };
            updated = true;
          }

          if (updated) {
            await strapi.db
              .connection('strapi_core_store_settings')
              .where({ id: configRows[0].id })
              .update({ value: JSON.stringify(config) });
            strapi.log.info(`[Bootstrap] Hid slug from Content Manager edit layout for ${uid}`);
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

      // ── 3.b Configure Industry Edit Layout in Content Manager (Side-by-side pairs) ──
      const industryLayoutRows = await strapi.db
        .connection('strapi_core_store_settings')
        .where({ key: 'plugin_content_manager_configuration_content_types::api::industry.industry' })
        .select('id', 'value');

      if (industryLayoutRows.length > 0) {
        const config = JSON.parse(industryLayoutRows[0].value);
        config.layouts = config.layouts || {};
        config.layouts.edit = [
          [{ name: 'title', size: 6 }, { name: 'order', size: 6 }],
          [{ name: 'summary', size: 12 }],
          [{ name: 'heroImage', size: 12 }],
          [{ name: 'heroHeadline', size: 12 }],
          [{ name: 'heroSubtext', size: 12 }],
          [{ name: 'ctaPrimaryLabel', size: 6 }, { name: 'ctaSecondaryLabel', size: 6 }],
          [{ name: 'industryContext', size: 12 }],
          [{ name: 'commonChallenges', size: 12 }],
          [{ name: 'techOpportunities', size: 12 }],
          [{ name: 'howMetaphiHelps', size: 12 }],
          [{ name: 'relevantCustomSolutions', size: 12 }],
          [{ name: 'readyToConfigureSolutions', size: 12 }],
          [{ name: 'keyUseCases', size: 12 }],
          [{ name: 'aiOpportunities', size: 12 }],
          [{ name: 'integrations', size: 12 }],
          [{ name: 'caseStudies', size: 12 }],
          [{ name: 'transformationApproachHeading', size: 6 }, { name: 'transformationApproachText', size: 6 }],
          [{ name: 'playbookHeading', size: 6 }, { name: 'playbookSubtext', size: 6 }],
          [{ name: 'faqs', size: 12 }],
          [{ name: 'solutions', size: 12 }],
          [{ name: 'primarySeoTheme', size: 12 }],
          [{ name: 'seo', size: 12 }],
        ];

        await strapi.db
          .connection('strapi_core_store_settings')
          .where({ id: industryLayoutRows[0].id })
          .update({ value: JSON.stringify(config) });
        strapi.log.info('[Bootstrap] Configured side-by-side edit layout for Industry');
      }

      // ── 3.b.2 Configure Solution Edit Layout in Content Manager (Side-by-side pairs) ──
      const solutionLayoutRows = await strapi.db
        .connection('strapi_core_store_settings')
        .where({ key: 'plugin_content_manager_configuration_content_types::api::solution.solution' })
        .select('id', 'value');

      if (solutionLayoutRows.length > 0) {
        const config = JSON.parse(solutionLayoutRows[0].value);
        config.layouts = config.layouts || {};
        config.layouts.edit = [
          [{ name: 'title', size: 6 }, { name: 'modelType', size: 6 }],
          [{ name: 'order', size: 12 }],
          [{ name: 'heroImage', size: 12 }],
          [{ name: 'heroHeadline', size: 12 }],
          [{ name: 'summary', size: 12 }],
          [{ name: 'ctaLabel', size: 6 }, { name: 'ctaSecondaryLabel', size: 6 }],
          [{ name: 'problemHeading', size: 6 }, { name: 'problemText', size: 6 }],
          [{ name: 'problemItems', size: 12 }],
          [{ name: 'offeringsHeading', size: 12 }],
          [{ name: 'offerings', size: 12 }],
          [{ name: 'useCasesHeading', size: 6 }, { name: 'useCasesSubtext', size: 6 }],
          [{ name: 'useCases', size: 12 }],
          [{ name: 'outcomesHeading', size: 6 }, { name: 'outcomesSubtext', size: 6 }],
          [{ name: 'outcomes', size: 12 }],
          [{ name: 'industries', size: 12 }],
          [{ name: 'approachHeading', size: 6 }, { name: 'approachSubtext', size: 6 }],
          [{ name: 'approachSteps', size: 12 }],
          [{ name: 'capabilitiesHeading', size: 6 }, { name: 'capabilitiesSubtext', size: 6 }],
          [{ name: 'capabilities', size: 12 }],
          [{ name: 'techApproachHeading', size: 6 }, { name: 'techApproachText', size: 6 }],
          [{ name: 'techApproachItems', size: 12 }],
          [{ name: 'aiOpportunitiesHeading', size: 6 }, { name: 'aiOpportunitiesSubtext', size: 6 }],
          [{ name: 'aiOpportunities', size: 12 }],
          [{ name: 'secondaryNarrativeHeading', size: 6 }, { name: 'secondaryNarrativeText', size: 6 }],
          [{ name: 'modernisationHeading', size: 6 }, { name: 'modernisationSubtext', size: 6 }],
          [{ name: 'modernisationItems', size: 12 }],
          [{ name: 'caseStudies', size: 12 }],
          [{ name: 'relatedResources', size: 12 }],
          [{ name: 'faqs', size: 12 }],
          [{ name: 'finalCtaHeading', size: 6 }, { name: 'finalCtaButtonLabel', size: 6 }],
          [{ name: 'finalCtaText', size: 12 }],
          [{ name: 'primarySeoTheme', size: 12 }],
          [{ name: 'seo', size: 12 }],
        ];

        config.metadatas = config.metadatas || {};
        for (const row of config.layouts.edit) {
          for (const cell of row) {
            const name = cell.name;
            if (!config.metadatas[name]) {
              config.metadatas[name] = {
                edit: {
                  label: name,
                  description: '',
                  placeholder: '',
                  visible: true,
                  editable: true,
                  ...(name === 'faqs' ? { mainField: 'question' } : {}),
                },
                list: {
                  label: name,
                  searchable: name !== 'faqs',
                  sortable: name !== 'faqs',
                },
              };
            }
          }
        }

        await strapi.db
          .connection('strapi_core_store_settings')
          .where({ id: solutionLayoutRows[0].id })
          .update({ value: JSON.stringify(config) });
        strapi.log.info('[Bootstrap] Configured side-by-side edit layout for Solution');
      }

      // ── 3.c Ensure newly added fields are in Content Manager edit layout ──
      const syncTypes = [
        {
          uid: 'api::work-page.work-page',
          fields: [
            {
              name: 'heroEyebrow',
              size: 12,
              label: 'Hero Eyebrow',
              description: 'Eyebrow label above the hero heading',
            },
            {
              name: 'heroImage',
              size: 12,
              label: 'Hero Image',
              description: 'Banner background image for the work page hero',
            },
            {
              name: 'showcaseEyebrow',
              size: 6,
              label: 'Showcase Eyebrow',
              description: 'Eyebrow above the case studies showcase',
            },
            {
              name: 'showcaseHeading',
              size: 6,
              label: 'Showcase Heading',
              description: 'Heading for the case studies showcase',
            },
          ],
        },
        {
          uid: 'api::ready-to-configure-hub.ready-to-configure-hub',
          fields: [
            {
              name: 'portfolioHeading',
              size: 6,
              label: 'Portfolio Heading',
              description: 'Heading for the ready-to-configure solutions portfolio',
            },
            {
              name: 'portfolioSubtext',
              size: 6,
              label: 'Portfolio Subtext',
              description: 'Subtext for the ready-to-configure solutions portfolio',
            },
          ],
        },
        {
          uid: 'api::about-page.about-page',
          fields: [
            {
              name: 'heroImage',
              size: 12,
              label: 'Hero Image',
              description: 'Banner background image for the about page hero',
            },
            {
              name: 'missionEyebrow',
              size: 6,
              label: 'Mission Eyebrow',
              description: 'Eyebrow label for the mission section',
            },
            {
              name: 'missionSubtext',
              size: 6,
              label: 'Mission Subtext',
              description: 'Left column subtext for the mission section',
            },
            {
              name: 'pillarsEyebrow',
              size: 6,
              label: 'Pillars Eyebrow',
              description: 'Eyebrow label for the principles/pillars section',
            },
          ],
        },
      ];

      for (const item of syncTypes) {
        const rows = await strapi.db
          .connection('strapi_core_store_settings')
          .where({
            key: `plugin_content_manager_configuration_content_types::${item.uid}`,
          })
          .select('id', 'value');

        if (rows.length > 0) {
          const config = JSON.parse(rows[0].value);
          let updated = false;

          for (const field of item.fields) {
            const alreadyInEdit = config?.layouts?.edit?.some((row: any[]) =>
              row.some((f: any) => f.name === field.name)
            );

            if (!alreadyInEdit) {
              config.layouts = config.layouts || {};
              config.layouts.edit = config.layouts.edit || [];
              config.layouts.edit.push([
                { name: field.name, size: field.size || 12 },
              ]);

              config.metadatas = config.metadatas || {};
              config.metadatas[field.name] = config.metadatas[field.name] || {};
              config.metadatas[field.name].edit = {
                label: field.label,
                description: field.description,
                placeholder: '',
                visible: true,
                editable: true,
                mainField: 'name',
              };
              updated = true;
            }
          }

          if (updated) {
            await strapi.db
              .connection('strapi_core_store_settings')
              .where({ id: rows[0].id })
              .update({ value: JSON.stringify(config) });
            strapi.log.info(
              `[Bootstrap] Synced missing fields to Content Manager edit layout for ${item.uid}`
            );
          }
        }
      }

      // ── 4. Enforce Minimum 1 Published Testimonial & FAQ Guard ──────
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
            throw new errors.ApplicationError(
              `Cannot ${action} this ${contentTypeLabel}. At least 1 published ${contentTypeLabel} must always exist in the system.`
            );
          }
        }

        return next();
      });
    } catch (err: any) {
      strapi.log.error(`[Bootstrap Error] ${err.message}`);
    }
  },
};
