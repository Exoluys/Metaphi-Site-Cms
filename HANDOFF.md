# Metaphi CMS Handoff Guide

## 1. Overview
The Metaphi CMS is a Headless Strapi v5 installation powering the Metaphi marketing website.
Content architecture:
- **Single Types**: Home Page (`home-page`), Default CTA Banner (`default-cta-banner`), 5 Hub Pages (`solutions-hub`, `custom-solutions-hub`, `ready-to-configure-hub`, `saas-products-hub`, `industries-hub`), and 9 Company Pages (`about-page`, `careers-page`, `why-join-us-page`, `rewards-page`, `life-at-metaphi-page`, `compliance-page`, `partners-page`, `team-page`, `testimonials-page`).
- **Collection Types**: Solutions (`solution`), Industries (`industry`), Case Studies (`case-study`), Testimonials (`testimonial`), FAQs (`faq`), Team Members (`team-member`), Partners (`partner`), Job Openings (`job-opening`).

---

## 2. Running Content Seeds
All previous seed and migration scripts have been consolidated into ONE idempotent script: `scripts/seed.cjs`.

### Running the Seed Script
```bash
node scripts/seed.cjs
```

**Guardrails:**
- Restricted strictly to local development (`STRAPI_URL` containing localhost/127.0.0.1 and `NODE_ENV !== 'production'`). Refuses execution if pointed to production.
- Cleans and resets the volatile tables completely before inserting (`case_studies`, `testimonials`, `faqs`, `faq_categories`, `team_members`, `partners`).
- Seeds all content as `published`.
- Does not modify or overwrite home hero copy or stats strip.

---

## 3. Backups & Rollbacks
Prior to consolidating the seed scripts, a complete PostgreSQL dump backup was captured:
`metaphi-cms/backups/metaphi_cms_backup_before_new_seed.sql`

To restore this backup:
```bash
psql -h 127.0.0.1 -U postgres -d metaphi_cms < backups/metaphi_cms_backup_before_new_seed.sql
```

---

## 4. Hosted Strapi Deployment & Database Transfer Checklist

When overwriting the hosted (Render) database with a local database dump or transferring state:

### A. What the Database Overwrite Replaces on Hosted (Besides Content)
Restoring a full database dump (`pg_restore` / `psql`) replaces every PostgreSQL table, which includes:
1. **Admin Users & Passwords**: Any administrator accounts created on Render will be replaced with local admin users. Use your local admin email and password to log in post-transfer.
2. **API Tokens & Transfer Tokens**: Salted tokens in `strapi_api_tokens` and `strapi_transfer_tokens` are overwritten.
3. **Webhooks**: Overwriting `strapi_webhooks` will delete or reset webhooks configured on Render (including the crucial **Vercel Revalidation Webhook**).
4. **Roles & Permissions**: Overwrites `users-permissions_permissions` and `users-permissions_roles`. (Our `src/index.ts` automatically regrants public read permissions on server bootstrap for all public endpoints).

### B. Media Handling & Upload Providers
- **Local Storage vs. Cloudinary**:
  - The local database points upload files to local disk paths unless Cloudinary is configured locally.
  - If database rows in `files` or `files_related_morphs` reference local disk filenames that do not exist on the hosted server or Cloudinary, images will render as broken links (HTTP 404).
  - *Recommendation*: Since our seed script adheres to strict zero-invented-media (no fake logos, images, or hero images), media tables are empty or minimal. Always upload client media via the hosted admin panel or Cloudinary CDN once deployed.

### C. Step-by-Step Order of Operations for Database Transfer
1. **Back up the Hosted Database First**:
   - Take a full `pg_dump` of the hosted Render PostgreSQL database before touching anything:
     ```bash
     pg_dump -h <render-db-host> -U <render-db-user> -d <render-db-name> -F c -b -v -f metaphi_hosted_pre_transfer_backup.dump
     ```
2. **Deploy Schema Code First**:
   - Push code commits to GitHub so Render builds and deploys the latest Strapi schemas and bootstrap hooks. Ensure the Render deployment shows `Live`.
3. **Restore the Local Dump to Render**:
   - Restore the local PostgreSQL database dump to the Render PostgreSQL instance:
     ```bash
     psql -h <render-db-host> -U <render-db-user> -d <render-db-name> < metaphi-cms/backups/metaphi_cms_backup_before_new_seed.sql
     ```
4. **Restart Hosted Strapi Service**:
   - In Render dashboard, trigger a manual restart of the Web Service so `src/index.ts` bootstrap runs, verifying permissions and core store layouts.
5. **Recreate the Vercel Revalidation Webhook**:
   - In Render Strapi Admin (`/admin`), go to **Settings -> Webhooks -> Create new webhook**:
     - **Name**: `Vercel Revalidation Webhook`
     - **URL**: `https://metaphi-site-five.vercel.app/api/revalidate`
     - **Headers**: Key `x-revalidate-secret`, Value `<REVALIDATE_SECRET>`
     - **Events**: Check `entry.create`, `entry.update`, `entry.delete`, `entry.publish`, `entry.unpublish`.
6. **Trigger Revalidation & Verify Live Pages**:
   - In Strapi Admin, save any page (e.g. `Home Page`) to fire the webhook, or call the endpoint with curl.
   - Verify live frontend routes: `/`, `/work`, `/about`, `/team`, `/testimonials`, `/partners`, `/compliance`, `/faq`, `/careers`, `/careers/why-join-us`, `/careers/rewards`, `/life-at-metaphi`.

### D. Environment Variables & Secrets That Must Match
Ensure the following are coordinated across Local, Render, and Vercel:
- `REVALIDATE_SECRET`: Must match between Render Webhook header (`x-revalidate-secret`) and Vercel environment variable (`REVALIDATE_SECRET`).
- `TRANSFER_TOKEN_SALT` & `API_TOKEN_SALT`: If using CLI transfer (`strapi transfer`), salts and tokens must match.
- `ADMIN_JWT_SECRET` & `JWT_SECRET`: Standard Strapi secret keys.
- `STRAPI_URL`: Configured on Vercel to point to `https://metaphi-site-cms.onrender.com`.

### E. Rollback Procedure
If the restore causes errors or breaks the hosted admin:
1. Restore the safety dump taken in Step 1:
   ```bash
   pg_restore -h <render-db-host> -U <render-db-user> -d <render-db-name> --clean --if-exists -v metaphi_hosted_pre_transfer_backup.dump
   ```
2. Restart the Render Web Service and verify the previous state is restored.

---

## 5. Hosted Strapi Deployment Checklist

Before deploying to production (e.g. Railway, Render, DigitalOcean):
1. **Schema Modifications & Removed Fields**:
   - Confirm removal of `ctaLink`, `secondaryCtaLink`, and `buttonLink` across all Strapi components (`capability-card`, `final-cta`, `info-block`, `proof-block`, `saas-product`, `solution-model`, `solution-portfolio`, `default-cta-banner`, `industry-page/cta-banner`, `challenges-section`, `services-section`, and `api::industry`). Link destinations are strictly managed in Next.js code (`lib/links.ts`).
   - Confirm removal of `seo` components across all 9 company page schemas.
   - Confirm deletion of legacy `api::client-logo` collection and `case-study.solutionModel`.
4. **Case Study Schema Simplification**:
   - `case-study` fields removed: `body`, `seoDescription`, `featuredOnShowcase`.
   - `case-study` sections deleted: `workflowSection`, `technologySection`, `takeawaysSection`.
   - `case-study` components deleted: `capability-item`, `solution-section`, `workflow-section`, `stage-item`, `technology-section`, `tech-group`, `takeaways-section`, `takeaway-item`, `comparison-row`.
   - `solutionText` added as plain text and `solutions` relation configured as a bidirectional `manyToMany` with `api::solution.solution`.
   - `challengeSection` simplified to `challenge` (text) + 3 items (`title`, `description`).
   - `impactSection` simplified to 3 outcome cards (`metric`, `title`, `description`).
5. **Deleted Content Types**:
   - `api::service.service`: Legacy Service collection deleted completely along with all `components/service/*` components, `relatedServices` relation on Case Study, lifecycles, and permissions.
   - `api::reviewer.reviewer`: Unused subject matter expert reviewer collection deleted.
   - `api::service-category.service-category`: Unused service category collection deleted.

2. **Environment Variables**:
   - `DATABASE_CLIENT`: `postgres`
   - `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_NAME`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
   - `DATABASE_SSL`: `true` (if using hosted cloud DB)
   - `APP_KEYS`, `API_TOKEN_SALT`, `ADMIN_JWT_SECRET`, `TRANSFER_TOKEN_SALT`, `JWT_SECRET`
3. **Build & Permissions**:
   - Run `npm run build` to compile the admin panel and TypeScript definitions.
   - Run `node scripts/grant-permissions.js` and `node scripts/grant-public-permissions.cjs` once database tables are initialized.
4. **Security**:
   - No database credentials or secrets are committed to version control.
   - Keep Strapi Admin user credentials separate and securely stored in environment password managers.

5. **Locked Fields & Admin Layout Synchronization**:
   - Admin layout configurations (e.g. `editable: false`, field descriptions, and ordering) reside in the database table `strapi_core_store_settings`.
   - The `home-page` single type defines dedicated fields for section eyebrows and link labels next to each section's headings:
     - `solutionModelsEyebrow`, `solutionModelsLinkLabel`
     - `workShowcaseEyebrow`, `workShowcaseLinkLabel`
     - `whyChooseEyebrow`
     - `testimonialsEyebrow`
     - `faqEyebrow`, `faqLinkLabel`
     These are synced and laid out next to section headings in `strapi_core_store_settings` using `scripts/apply-admin-layouts.cjs`.
   - The following keys enforce locked, immutable fields:
     - `plugin_content_manager_configuration_content_types::api::industry.industry`: 
       - `slug` (locked: `editable: false`, description: `"Automatically generated from title on creation. Never typed, immutable."`)
       - `order` (description: `"Lower number shows first. Navbar and footer show the first 10; the Industries page shows all."`, validation: required positive integer >= 1)
     - Canonical 10 Industries (`manufacturing`, `healthcare`, `logistics`, `finance`, `professional-services`, `retail-and-ecommerce`, `consumer-platforms-and-marketplaces`, `associations-and-communities`, `education`, `government-and-public-sector`): Titles and slugs are strictly locked and reset to canonical names via lifecycle hooks (`lifecycles.ts`) and document service middleware (`src/index.ts`). Additional sub-industries with custom slugs retain fully editable titles.
     - **Industry Order Rule**: `order` acts as a numerical rank. All industries are sorted by `order` ascending, with ties broken by `title` ascending. The `/industries` hub displays all published industries without limit. The Navbar and Footer display only the first 10 industries in that ranking.
     - `plugin_content_manager_configuration_components::hub.solution-model`: `title` (locked: `editable: false`, description: `"Fixed solution type name. Immutable."`)
     - `plugin_content_manager_configuration_components::hub.how-to-choose`: `customRuleTitle`, `readyRuleTitle`, `saasRuleTitle` (locked: `editable: false`, description: `"Fixed decision title. Immutable."`)
   - **How to carry these settings to hosted Strapi on deployment**:
     - Option A (Automatic on bootstrap): `src/index.ts` automatically runs on Strapi server start and ensures `editable: false` and description metadata are populated in `strapi_core_store_settings`.
     - Option B (Seed script): Running `node scripts/seed-metaphi-content.cjs` seeds canonical values (`Custom Solutions`, `Ready-to-Configure Solutions`, `SaaS Products`, and `Choose ...` rule titles).
     - Option C (Strapi Config Transfer / SQL): Use Strapi CLI transfer or export:
       ```bash
       npm run strapi transfer -- --to <hosted-strapi-url> --only config
       ```
       Or execute the core-store sync SQL against the hosted PostgreSQL database:
       ```sql
       -- Lock solution model title
       UPDATE strapi_core_store_settings
       SET value = jsonb_set(
         value::jsonb,
         '{metadatas,title,edit}',
         '{"label":"title","description":"Fixed solution type name. Immutable.","placeholder":"","visible":true,"editable":false}'::jsonb
       )::text
       WHERE key = 'plugin_content_manager_configuration_components::hub.solution-model';

       -- Lock how-to-choose titles
       UPDATE strapi_core_store_settings
       SET value = jsonb_set(
         jsonb_set(
           jsonb_set(
             value::jsonb,
             '{metadatas,customRuleTitle,edit}',
             '{"label":"customRuleTitle","description":"Fixed decision title. Immutable.","placeholder":"","visible":true,"editable":false}'::jsonb
           ),
           '{metadatas,readyRuleTitle,edit}',
           '{"label":"readyRuleTitle","description":"Fixed decision title. Immutable.","placeholder":"","visible":true,"editable":false}'::jsonb
         ),
         '{metadatas,saasRuleTitle,edit}',
         '{"label":"saasRuleTitle","description":"Fixed decision title. Immutable.","placeholder":"","visible":true,"editable":false}'::jsonb
       )::text
       WHERE key = 'plugin_content_manager_configuration_components::hub.how-to-choose';

       ```

6. **Repeatable Component Fixed Count Validation Rules**:
   - `home-page` (`companyStats`): Exactly 4 items required (`min: 4`, `max: 4`). Enforced in schema and Document Service middleware (`src/index.ts`).
   - `industries-hub` (`transformationThemes.items`): Exactly 9 items required. Enforced in lifecycle hook (`src/api/industries-hub/content-types/industries-hub/lifecycles.ts`) and Document Service middleware (`src/index.ts`).

7. **Industry <-> Solution Many-to-Many Relation**:
   - `Industry` has a bidirectional manyToMany relation to `Solution` (`Industry.solutions` <-> `Solution.industries`, with `mappedBy: "solutions"` on Solution and `inversedBy: "industries"` on Industry).
   - Admin content manager layouts for both types expose the relationship field full-width (`size: 12`).
   - The `industries-hub` single type provides two CMS-editable headings:
     - `relatedSolutionsHeading`: Heading for linked solutions block on industry detail pages (e.g. `"Related Solutions"`).
     - `servedIndustriesHeading`: Heading for linked industries block on solution detail pages (e.g. `"Industries We Serve"`).
   - Rendering Rule: If nothing is linked or headings are empty, no section, heading, gap, or empty DOM element is rendered. Only published entries are rendered.

8. **CMS Outage Error Propagation & Stale-Page Preservation**:
   - Error Propagation Architecture:
     - Pages (home, hubs, detail routes, company pages, work, industries, solutions, faq, testimonials, careers) let `CmsUnavailableError` propagate naturally rather than catching it and returning `<CmsUnavailable />` as successful JSX (HTTP 200).
     - When Strapi is responsive and a slug is not found, `notFound()` is explicitly invoked to render the 404 page.
     - When Strapi responds with empty lists, editable empty states render normally with HTTP 200.
   - Next.js ISR Stale-While-Revalidate Behavior (Production `next start`):
     - For pre-rendered pages with revalidation (`export const revalidate = 60`), when Strapi is down and the 60-second window expires, background revalidations fail because `CmsUnavailableError` is thrown.
     - In Next.js App Router ISR, failed revalidations do NOT overwrite or replace the valid cached HTML. Next.js continues serving the last good cached page with `200 OK` (`s-maxage=..., stale-while-revalidate=...`). Outage error states never overwrite good cached pages.
   - Uncached / Never-Built Routes & Dev Behavior:
     - For never-built routes (dynamic routes rendered on demand or routes requested before Strapi is started) or in development (`next dev`):
     - When Strapi is unreachable, the uncaught `CmsUnavailableError` propagates to Next.js route error boundaries (`app/error.tsx`), returning `500 Internal Server Error` with `Cache-Control: private, no-cache, no-store, max-age=0, must-revalidate`.
     - Route-level error boundaries (`app/error.tsx`) catch the error and render `<CmsUnavailable />` within the normal layout, preserving the navbar and footer. The Reload button triggers both `reset()` and `window.location.reload()`.
   - Recovery:
     - As soon as Strapi is restored, all pages immediately resume normal rendering and revalidation without requiring a rebuild of Next.js.
