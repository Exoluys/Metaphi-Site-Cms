# Metaphi CMS Handoff Guide

## 1. Overview
The Metaphi CMS is a Headless Strapi v5 installation powering the Metaphi marketing website.
Content architecture:
- **Single Types**: Home Page (`home-page`), Default CTA Banner (`default-cta-banner`), 5 Hub Pages (`solutions-hub`, `custom-solutions-hub`, `ready-to-configure-hub`, `saas-products-hub`, `industries-hub`), and 9 Company Pages (`about-page`, `careers-page`, `why-join-us-page`, `rewards-page`, `life-at-metaphi-page`, `compliance-page`, `partners-page`, `team-page`, `testimonials-page`).
- **Collection Types**: Solutions (`solution`), Industries (`industry`), Services (`service`), Case Studies (`case-study`), Testimonials (`testimonial`), FAQs (`faq`), Team Members (`team-member`), Partners (`partner`), Job Openings (`job-opening`).

---

## 2. Running Content Seeds
All seed scripts are located in `scripts/`:

1. **Seed Word Doc Canonical Content** (Home Page, 5 Hubs, Solutions, Industries):
   ```bash
   node scripts/seed-metaphi-content.cjs
   ```
2. **Seed 9 Company Pages** (About, Careers, Why Join Us, Rewards, Life @ Metaphi, Compliance, Partners, Team, Testimonials with `[DUMMY]` content):
   ```bash
   node scripts/seed-company-pages.js
   ```
3. **Grant Public API Permissions**:
   ```bash
   node scripts/grant-public-permissions.cjs
   node scripts/grant-permissions.js
   ```

---

## 3. Undoing / Rolling Back Seeds
To clean seeded documents:
```bash
node scripts/undo-metaphi-seed.cjs
```
Database dumps can be restored via standard PostgreSQL tools:
```bash
psql -h <host> -U <user> -d <database> < backups/metaphi_cms_backup_cta_removal.sql
```

---

## 4. Hosted Strapi Deployment Checklist
Before deploying to production (e.g. Railway, Render, DigitalOcean):
1. **Schema Modifications & Removed Fields**:
   - Confirm removal of `ctaLink`, `secondaryCtaLink`, and `buttonLink` across all Strapi components (`capability-card`, `final-cta`, `info-block`, `proof-block`, `saas-product`, `solution-model`, `solution-portfolio`, `default-cta-banner`, `industry-page/cta-banner`, `challenges-section`, `services-section`, and `api::industry`). Link destinations are strictly managed in Next.js code (`lib/links.ts`).
   - Confirm removal of `seo` components across all 9 company page schemas.
   - Confirm deletion of legacy `api::client-logo` collection and `case-study.solutionModel`.
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
