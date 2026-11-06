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
          'api::about-page.about-page.find',
          'api::careers-page.careers-page.find',
          'api::why-join-us-page.why-join-us-page.find',
          'api::rewards-page.rewards-page.find',
          'api::life-at-metaphi-page.life-at-metaphi-page.find',
          'api::job-opening.job-opening.find',
          'api::job-opening.job-opening.findOne',
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

        // ── 7. Enforce Validation Rules on Home Page ───────────────────
        if (uid === 'api::home-page.home-page' && (action === 'update' || action === 'create')) {
          const data = ctx.params?.data;
          if (data) {
            const checkRequired = (val: any, name: string) => {
              if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
                throw new Error(`${name} is required.`);
              }
            };
            const checkMaxChars = (val: any, max: number, name: string) => {
              if (val !== undefined && val !== null && typeof val === 'string' && val.trim().length > max) {
                throw new Error(`${name} must be ${max} characters or fewer.`);
              }
            };

            // HERO
            if (data.heroTitle !== undefined) {
              checkRequired(data.heroTitle, 'Hero Title');
              checkMaxChars(data.heroTitle, 20, 'Hero Title');
            }
            if (data.heroHighlight !== undefined) {
              checkRequired(data.heroHighlight, 'Hero Highlight');
              checkMaxChars(data.heroHighlight, 20, 'Hero Highlight');
            }
            if (data.heroDescription !== undefined) {
              checkMaxChars(data.heroDescription, 120, 'Hero Description');
            }
            if (data.PrimaryCtaButtonLabel !== undefined) {
              checkRequired(data.PrimaryCtaButtonLabel, 'Primary CTA Button Label');
            }

            // TRUSTED BY
            if (data.trustedByText !== undefined) {
              checkRequired(data.trustedByText, 'Trusted By Text');
            }
            if (data.trustedByHighlight !== undefined) {
              checkRequired(data.trustedByHighlight, 'Trusted By Highlight');
            }
            if (data.clientLogos !== undefined) {
              if (!Array.isArray(data.clientLogos) || data.clientLogos.length < 5) {
                throw new Error('At least 5 client logos are required.');
              }
            }

            // SOLUTION MODELS
            if (data.solutionModelsLinkLabel !== undefined) {
              checkRequired(data.solutionModelsLinkLabel, 'Solution Models Link Label');
            }
            if (data.solutionModelsHeading !== undefined) {
              checkRequired(data.solutionModelsHeading, 'Solution Models Heading');
            }
            if (data.solutionModelsHighlight !== undefined) {
              checkRequired(data.solutionModelsHighlight, 'Solution Models Highlight');
            }
            if (data.solutionModelsSubtext !== undefined) {
              checkMaxChars(data.solutionModelsSubtext, 160, 'Solution Models Subtext');
            }
            if (data.solutionModelsImage !== undefined) {
              checkRequired(data.solutionModelsImage, 'Solution Models Image');
            }

            // TRUST
            if (data.trustHeading !== undefined) {
              checkRequired(data.trustHeading, 'Trust Heading');
            }
            if (data.trustHighlight !== undefined) {
              checkRequired(data.trustHighlight, 'Trust Highlight');
            }
            if (data.trustSubtext !== undefined) {
              checkMaxChars(data.trustSubtext, 160, 'Trust Subtext');
            }
            if (data.trustPills !== undefined) {
              if (!Array.isArray(data.trustPills) || data.trustPills.length < 5) {
                throw new Error('At least 5 trust pills are required.');
              }
            }

            // BUSINESS PROBLEMS
            if (data.businessProblemsHeading !== undefined) {
              checkRequired(data.businessProblemsHeading, 'Business Problems Heading');
            }
            if (data.businessProblemsHighlight !== undefined) {
              checkRequired(data.businessProblemsHighlight, 'Business Problems Highlight');
            }
            if (data.businessProblemsSubtext !== undefined) {
              checkMaxChars(data.businessProblemsSubtext, 160, 'Business Problems Subtext');
            }
            if (data.businessProblems !== undefined) {
              if (!Array.isArray(data.businessProblems) || data.businessProblems.length < 6) {
                throw new Error('At least 6 business problems are required.');
              }
            }

            // INDUSTRIES SECTION
            if (data.industriesSection !== undefined && data.industriesSection !== null) {
              if (data.industriesSection.heading !== undefined) {
                checkRequired(data.industriesSection.heading, 'Industries Section Heading');
              }
              if (data.industriesSection.subtext !== undefined) {
                checkMaxChars(data.industriesSection.subtext, 160, 'Industries Section Subtext');
              }
            }
            if (data.industries !== undefined) {
              if (!Array.isArray(data.industries) || data.industries.length < 5) {
                throw new Error('At least 5 industries are required.');
              }
            }

            // WORK SHOWCASE
            if (data.workShowcaseLinkLabel !== undefined) {
              checkRequired(data.workShowcaseLinkLabel, 'Work Showcase Link Label');
            }
            if (data.workShowcaseHeading !== undefined) {
              checkRequired(data.workShowcaseHeading, 'Work Showcase Heading');
            }
            if (data.workShowcaseHighlight !== undefined) {
              checkRequired(data.workShowcaseHighlight, 'Work Showcase Highlight');
            }
            if (data.workShowcaseIntro !== undefined) {
              checkMaxChars(data.workShowcaseIntro, 160, 'Work Showcase Intro');
            }

            // DELIVERY APPROACH
            if (data.deliveryApproachHeading !== undefined) {
              checkRequired(data.deliveryApproachHeading, 'Delivery Approach Heading');
            }
            if (data.deliveryApproachHighlight !== undefined) {
              checkRequired(data.deliveryApproachHighlight, 'Delivery Approach Highlight');
            }
            if (data.deliveryApproachSubtext !== undefined) {
              checkMaxChars(data.deliveryApproachSubtext, 160, 'Delivery Approach Subtext');
            }

            // WHY CHOOSE
            if (data.whyChooseHeading !== undefined) {
              checkRequired(data.whyChooseHeading, 'Why Choose Heading');
            }
            if (data.whyChooseHighlight !== undefined) {
              checkRequired(data.whyChooseHighlight, 'Why Choose Highlight');
            }
            if (data.whyChooseSubtitle !== undefined) {
              checkMaxChars(data.whyChooseSubtitle, 160, 'Why Choose Subtitle');
            }
            if (data.whyChooseCertifications !== undefined) {
              if (!Array.isArray(data.whyChooseCertifications) || data.whyChooseCertifications.length !== 4) {
                throw new Error('Exactly 4 why choose certifications are required.');
              }
            }

            // COMPANY STATS
            const stats = data.companyStats;
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

            // TESTIMONIALS
            if (data.testimonialsCtaLabel !== undefined) {
              checkRequired(data.testimonialsCtaLabel, 'Testimonials CTA Label');
            }
            if (data.testimonialsHeading !== undefined) {
              checkRequired(data.testimonialsHeading, 'Testimonials Heading');
            }
            if (data.testimonialsHighlight !== undefined) {
              checkRequired(data.testimonialsHighlight, 'Testimonials Highlight');
            }
            if (data.testimonialsSubtitle !== undefined) {
              checkMaxChars(data.testimonialsSubtitle, 160, 'Testimonials Subtitle');
            }

            // FAQ
            if (data.faqLinkLabel !== undefined) {
              checkRequired(data.faqLinkLabel, 'FAQ Link Label');
            }
            if (data.faqHeading !== undefined) {
              checkRequired(data.faqHeading, 'FAQ Heading');
            }
            if (data.faqHighlight !== undefined) {
              checkRequired(data.faqHighlight, 'FAQ Highlight');
            }
            if (data.faqSubtitle !== undefined) {
              checkMaxChars(data.faqSubtitle, 160, 'FAQ Subtitle');
            }

            // FINAL CTA
            if (data.finalCta !== undefined && data.finalCta !== null) {
              if (data.finalCta.heading !== undefined) {
                checkRequired(data.finalCta.heading, 'Final CTA Heading');
              }
              if (data.finalCta.subtext !== undefined) {
                checkRequired(data.finalCta.subtext, 'Final CTA Subtext');
              }
            }
          }
        }

        // ── 7a2. Enforce validation rules on solutions-hub ────────────
        if (uid === 'api::solutions-hub.solutions-hub' && (action === 'update' || action === 'create')) {
          const data = ctx.params?.data;
          if (data) {
            const checkRequired = (val: any, name: string) => {
              if (val === undefined || val === null || (typeof val === 'string' && !val.trim())) {
                throw new Error(name + ' is required.');
              }
            };
            const checkMaxChars = (val: any, max: number, name: string) => {
              if (val !== undefined && val !== null && typeof val === 'string' && val.trim().length > max) {
                throw new Error(name + ' must be ' + max + ' characters or fewer.');
              }
            };

            // HERO
            if (data.heroSubtext !== undefined) {
              checkMaxChars(data.heroSubtext, 160, 'Hero Subtext');
            }

            // MODELS SECTION
            if (data.modelsHeading !== undefined) {
              checkRequired(data.modelsHeading, 'Models Heading');
            }
            if (data.modelsSubtext !== undefined) {
              checkMaxChars(data.modelsSubtext, 160, 'Models Subtext');
            }

            // HOW TO CHOOSE
            if (data.howToChoose !== undefined && data.howToChoose !== null) {
              if (data.howToChoose.heading !== undefined) {
                checkRequired(data.howToChoose.heading, 'How To Choose Heading');
              }
              if (data.howToChoose.subtext !== undefined) {
                checkMaxChars(data.howToChoose.subtext, 160, 'How To Choose Subtext');
              }
              if (data.howToChoose.customRule !== undefined) {
                checkRequired(data.howToChoose.customRule, 'How To Choose Custom Rule');
                checkMaxChars(data.howToChoose.customRule, 160, 'How To Choose Custom Rule');
              }
              if (data.howToChoose.readyRule !== undefined) {
                checkRequired(data.howToChoose.readyRule, 'How To Choose Ready Rule');
                checkMaxChars(data.howToChoose.readyRule, 160, 'How To Choose Ready Rule');
              }
              if (data.howToChoose.saasRule !== undefined) {
                checkRequired(data.howToChoose.saasRule, 'How To Choose SaaS Rule');
                checkMaxChars(data.howToChoose.saasRule, 160, 'How To Choose SaaS Rule');
              }
              if (data.howToChoose.ctaLabel !== undefined) {
                checkRequired(data.howToChoose.ctaLabel, 'How To Choose CTA Label');
              }
            }

            // PROOF
            if (data.proof !== undefined && data.proof !== null) {
              if (data.proof.heading !== undefined) {
                checkRequired(data.proof.heading, 'Proof Heading');
              }
            }

            // FINAL CTA
            if (data.finalCta !== undefined && data.finalCta !== null) {
              if (data.finalCta.heading !== undefined) {
                checkRequired(data.finalCta.heading, 'Final CTA Heading');
              }
              if (data.finalCta.subtext !== undefined) {
                checkRequired(data.finalCta.subtext, 'Final CTA Subtext');
              }
            }

            // CUSTOM MODEL
            if (data.customModel !== undefined && data.customModel !== null) {
              if (data.customModel.tagline !== undefined) {
                checkRequired(data.customModel.tagline, 'Custom Model Tagline');
                checkMaxChars(data.customModel.tagline, 160, 'Custom Model Tagline');
              }
              if (data.customModel.description !== undefined) {
                checkRequired(data.customModel.description, 'Custom Model Description');
                checkMaxChars(data.customModel.description, 160, 'Custom Model Description');
              }
              if (data.customModel.ctaLabel !== undefined) {
                checkRequired(data.customModel.ctaLabel, 'Custom Model CTA Label');
              }
            }

            // READY MODEL
            if (data.readyModel !== undefined && data.readyModel !== null) {
              if (data.readyModel.tagline !== undefined) {
                checkRequired(data.readyModel.tagline, 'Ready Model Tagline');
                checkMaxChars(data.readyModel.tagline, 160, 'Ready Model Tagline');
              }
              if (data.readyModel.description !== undefined) {
                checkRequired(data.readyModel.description, 'Ready Model Description');
                checkMaxChars(data.readyModel.description, 160, 'Ready Model Description');
              }
              if (data.readyModel.ctaLabel !== undefined) {
                checkRequired(data.readyModel.ctaLabel, 'Ready Model CTA Label');
              }
            }

            // SAAS MODEL
            if (data.saasModel !== undefined && data.saasModel !== null) {
              if (data.saasModel.tagline !== undefined) {
                checkRequired(data.saasModel.tagline, 'SaaS Model Tagline');
                checkMaxChars(data.saasModel.tagline, 160, 'SaaS Model Tagline');
              }
              if (data.saasModel.description !== undefined) {
                checkRequired(data.saasModel.description, 'SaaS Model Description');
                checkMaxChars(data.saasModel.description, 160, 'SaaS Model Description');
              }
              if (data.saasModel.ctaLabel !== undefined) {
                checkRequired(data.saasModel.ctaLabel, 'SaaS Model CTA Label');
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
