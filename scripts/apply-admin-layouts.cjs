/**
 * apply-admin-layouts.cjs
 *
 * Idempotent script that sets the Strapi Content-Manager edit-form layout
 * for: Service, ServiceCategory, CaseStudy, Industry.
 *
 * Safe to run multiple times. It reads the current config, applies the
 * desired layout, and writes it back. Fields not in the layout are hidden
 * (legacy JSON fields, categorySlug, offeringsVisual stay in schema but
 * are not shown in the edit form).
 *
 * Run: node apply-admin-layouts.cjs
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '..', '.env') });
const { Client } = require('pg');

const clientConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.DATABASE_HOST || process.env.PGHOST || '127.0.0.1',
      port: parseInt(process.env.DATABASE_PORT || process.env.PGPORT || '5432', 10),
      database: process.env.DATABASE_NAME || process.env.PGDATABASE || 'metaphi_cms',
      user: process.env.DATABASE_USERNAME || process.env.PGUSER || 'postgres',
      password: process.env.DATABASE_PASSWORD || process.env.PGPASSWORD || '',
    };

// ─── Layout definitions ──────────────────────────────────────────────────────

const caseStudyLayout = {
  key: 'plugin_content_manager_configuration_content_types::api::case-study.case-study',
  editRows: [
    [{ name: 'title', size: 8 }, { name: 'order', size: 4 }],
    [{ name: 'slug', size: 12 }],
    [{ name: 'subtitle', size: 12 }],
    [{ name: 'summary', size: 12 }],
    [{ name: 'tags', size: 8 }, { name: 'heroImage', size: 4 }],
    [{ name: 'solutionText', size: 12 }],
    [{ name: 'solutions', size: 12 }],
    [{ name: 'projectSummary', size: 12 }],
    [{ name: 'challengeSection', size: 12 }],
    [{ name: 'impactSection', size: 12 }],
  ],
};

const industryLayout = {
  key: 'plugin_content_manager_configuration_content_types::api::industry.industry',
  editRows: [
    [{ name: 'title', size: 8 }, { name: 'order', size: 4 }],
    [{ name: 'slug', size: 12 }],
    [{ name: 'summary', size: 12 }],
    [{ name: 'heroImage', size: 12 }],
    [{ name: 'solutions', size: 12 }],
  ],
};

const solutionLayout = {
  key: 'plugin_content_manager_configuration_content_types::api::solution.solution',
  editRows: [
    [{ name: 'title', size: 6 }, { name: 'slug', size: 6 }],
    [{ name: 'modelType', size: 6 }, { name: 'summary', size: 6 }],
    [{ name: 'order', size: 4 }, { name: 'featuredOnHome', size: 4 }],
    [{ name: 'homeTitle', size: 6 }, { name: 'homeSummary', size: 6 }],
    [{ name: 'ctaLabel', size: 6 }],
    [{ name: 'industries', size: 12 }],
  ],
};


const homePageLayout = {
  key: 'plugin_content_manager_configuration_content_types::api::home-page.home-page',
  editRows: [
  [
    {
      "name": "heroTitle",
      "size": 6
    },
    {
      "name": "heroHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "heroDescription",
      "size": 6
    },
    {
      "name": "primaryButtonText",
      "size": 6
    }
  ],
  [
    {
      "name": "secondaryButtonText",
      "size": 6
    }
  ],
  [
    {
      "name": "trustedByText",
      "size": 6
    },
    {
      "name": "trustedByHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "clientLogos",
      "size": 12
    }
  ],
  [
    {
      "name": "solutionModelsEyebrow",
      "size": 6
    },
    {
      "name": "solutionModelsLinkLabel",
      "size": 6
    }
  ],
  [
    {
      "name": "solutionModelsHeading",
      "size": 6
    },
    {
      "name": "solutionModelsHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "solutionModelsSubtext",
      "size": 12
    }
  ],
  [
    {
      "name": "solutionModelsImage",
      "size": 12
    }
  ],
  [
    {
      "name": "trustHeading",
      "size": 6
    },
    {
      "name": "trustHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "trustSubtext",
      "size": 12
    }
  ],
  [
    {
      "name": "trustPills",
      "size": 12
    }
  ],
  [
    {
      "name": "businessProblemsHeading",
      "size": 6
    },
    {
      "name": "businessProblemsHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "businessProblemsSubtext",
      "size": 12
    }
  ],
  [
    {
      "name": "businessProblems",
      "size": 12
    }
  ],
  [
    {
      "name": "industriesSection",
      "size": 12
    }
  ],
  [
    {
      "name": "workShowcaseEyebrow",
      "size": 6
    },
    {
      "name": "workShowcaseLinkLabel",
      "size": 6
    }
  ],
  [
    {
      "name": "workShowcaseHeading",
      "size": 6
    },
    {
      "name": "workShowcaseHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "workShowcaseIntro",
      "size": 12
    }
  ],
  [
    {
      "name": "whyMetaphiHeading",
      "size": 6
    },
    {
      "name": "whyMetaphiHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "whyMetaphiSubtext",
      "size": 12
    }
  ],
  [
    {
      "name": "whyMetaphiPillars",
      "size": 12
    }
  ],
  [
    {
      "name": "deliveryApproachHeading",
      "size": 6
    },
    {
      "name": "deliveryApproachHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "deliveryApproachSubtext",
      "size": 12
    }
  ],
  [
    {
      "name": "whyChooseEyebrow",
      "size": 6
    }
  ],
  [
    {
      "name": "whyChooseHeading",
      "size": 6
    },
    {
      "name": "whyChooseHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "whyChooseSubtitle",
      "size": 6
    }
  ],
  [
    {
      "name": "companyStats",
      "size": 12
    }
  ],
  [
    {
      "name": "whyChooseCertifications",
      "size": 12
    }
  ],
  [
    {
      "name": "certificationsEmptyStateText",
      "size": 6
    }
  ],
  [
    {
      "name": "testimonialsEyebrow",
      "size": 6
    },
    {
      "name": "testimonialsCtaLabel",
      "size": 6
    }
  ],
  [
    {
      "name": "testimonialsHeading",
      "size": 6
    },
    {
      "name": "testimonialsHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "testimonialsSubtitle",
      "size": 6
    }
  ],
  [
    {
      "name": "testimonialsEmptyStateText",
      "size": 6
    }
  ],
  [
    {
      "name": "faqEyebrow",
      "size": 6
    },
    {
      "name": "faqLinkLabel",
      "size": 6
    }
  ],
  [
    {
      "name": "faqHeading",
      "size": 6
    },
    {
      "name": "faqHighlight",
      "size": 6
    }
  ],
  [
    {
      "name": "faqSubtitle",
      "size": 6
    }
  ],
  [
    {
      "name": "faqEmptyStateText",
      "size": 6
    }
  ],
  [
    {
      "name": "finalCta",
      "size": 12
    }
  ],
  [
    {
      "name": "industries",
      "size": 12
    }
  ]
],
};

const contactPageLayout = {
  key: 'plugin_content_manager_configuration_content_types::api::contact-page.contact-page',
  editRows: [
    [{ name: 'heroHeading', size: 6 }, { name: 'heroHighlight', size: 6 }],
    [{ name: 'heroSubtext', size: 12 }],
    [{ name: 'email', size: 6 }, { name: 'emailLabel', size: 6 }],
    [{ name: 'phoneLabel', size: 6 }, { name: 'addressLabel', size: 6 }],
    [{ name: 'address', size: 12 }],
    [{ name: 'phones', size: 12 }],
    [{ name: 'firstNameLabel', size: 6 }, { name: 'firstNamePlaceholder', size: 6 }],
    [{ name: 'lastNameLabel', size: 6 }, { name: 'lastNamePlaceholder', size: 6 }],
    [{ name: 'emailFieldLabel', size: 6 }, { name: 'emailFieldPlaceholder', size: 6 }],
    [{ name: 'countryCodeLabel', size: 6 }, { name: 'phoneFieldLabel', size: 6 }],
    [{ name: 'phoneFieldPlaceholder', size: 6 }, { name: 'submitButtonLabel', size: 6 }],
    [{ name: 'submittingButtonLabel', size: 6 }, { name: 'sendAnotherLabel', size: 6 }],
    [{ name: 'messageFieldLabel', size: 6 }, { name: 'messageFieldPlaceholder', size: 6 }],
    [{ name: 'successHeading', size: 6 }, { name: 'errorMessage', size: 6 }],
    [{ name: 'successMessage', size: 12 }]
  ]
};

const scheduleACallPageLayout = {
  key: 'plugin_content_manager_configuration_content_types::api::schedule-a-call-page.schedule-a-call-page',
  editRows: [
    [{ name: 'heroHeading', size: 6 }, { name: 'heroHighlight', size: 6 }],
    [{ name: 'heroSubtext', size: 12 }],
    [{ name: 'durationText', size: 6 }, { name: 'videoCallText', size: 6 }],
    [{ name: 'promisesHeading', size: 6 }, { name: 'selectTimezoneLabel', size: 6 }],
    [{ name: 'availableSlotsLabel', size: 6 }, { name: 'emptySlotButtonLabel', size: 6 }],
    [{ name: 'confirmButtonTemplate', size: 12 }],
    [{ name: 'promises', size: 12 }],
    [{ name: 'confirmationHeading', size: 6 }, { name: 'calendarInviteNote', size: 6 }],
    [{ name: 'rescheduleButtonLabel', size: 6 }, { name: 'returnHomeButtonLabel', size: 6 }],
    [{ name: 'confirmationSubtext', size: 12 }]
  ]
};

const layouts = [caseStudyLayout, industryLayout, solutionLayout, homePageLayout, contactPageLayout, scheduleACallPageLayout];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TRUST_BAR_HELP_TEXT =
  'Add at least one client logo. If no logos are added, the trust bar will not be shown on the page.';

/**
 * Build a minimal but valid Strapi content-manager config object.
 * We only force-overwrite the `layouts.edit` key; everything else
 * from the existing row is preserved (or a sensible default is used).
 * Enforces slug.edit.editable = false for locked content types.
 */
function applyEditLayout(existing, newEditRows, lockSlug = false, key = '') {
  const base = existing
    ? JSON.parse(typeof existing === 'string' ? existing : JSON.stringify(existing))
    : { layouts: { edit: [], list: [] }, settings: {}, metadatas: {} };

  base.layouts = base.layouts || {};
  base.layouts.edit = newEditRows;
  base.metadatas = base.metadatas || {};

  if (lockSlug && base.metadatas?.slug) {
    base.metadatas.slug.edit = {
      ...base.metadatas.slug.edit,
      editable: false,
      description: 'Automatically generated from title on creation. Never typed, immutable.',
    };
  }

  // Help text for clientLogos on Industry
  if (key.includes('industry.industry')) {
    base.metadatas.clientLogos = base.metadatas.clientLogos || {};
    base.metadatas.clientLogos.edit = {
      ...base.metadatas.clientLogos.edit,
      description: TRUST_BAR_HELP_TEXT,
    };
  }

  // Help text for heading on Trust Bar component
  if (key.includes('industry-page.trust-bar')) {
    base.metadatas.heading = base.metadatas.heading || {};
    base.metadatas.heading.edit = {
      ...base.metadatas.heading.edit,
      description: TRUST_BAR_HELP_TEXT,
    };
  }

  return base;
}

async function main() {
  const client = new Client(clientConfig);
  await client.connect();

  for (const layout of layouts) {
    // Read current config row (may not exist yet)
    const { rows } = await client.query(
      'SELECT id, value FROM strapi_core_store_settings WHERE key = $1',
      [layout.key]
    );

    const existingValue = rows.length ? rows[0].value : null;
    const lockSlug = layout.key.includes('industry') || layout.key.includes('case-study');
    const updated = applyEditLayout(existingValue, layout.editRows, lockSlug, layout.key);
    const json = JSON.stringify(updated);

    if (rows.length === 0) {
      await client.query(
        'INSERT INTO strapi_core_store_settings (key, value, type, environment, tag) VALUES ($1, $2, $3, $4, $5)',
        [layout.key, json, 'object', null, null]
      );
      console.log(`[INSERT] ${layout.key}`);
    } else {
      await client.query(
        'UPDATE strapi_core_store_settings SET value = $1 WHERE id = $2',
        [json, rows[0].id]
      );
      console.log(`[UPDATE] ${layout.key}`);
    }
  }

  console.log('\nDone. Restart Strapi (or hard-refresh the admin) to see the new layouts.');
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
