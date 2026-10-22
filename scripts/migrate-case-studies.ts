import { createStrapi } from '@strapi/strapi';
import fs from 'fs';
import path from 'path';

interface Outcome {
  metric: string;
  label: string;
}

interface CodeCaseStudy {
  slug: string;
  heroImageFile: string;
  alt: string;
  outcomes: Outcome[];
}

const caseStudiesData: CodeCaseStudy[] = [
  {
    slug: 'wind-farm-digital-twin',
    heroImageFile: 'showcase-wind-farm.jpg',
    alt: 'Accelerated Wind Farm Planning By 35% Through Digital Twin Solutions',
    outcomes: [
      { metric: '35%', label: 'Faster Planning' },
      { metric: '3x', label: 'Capital Decisions' },
      { metric: '100%', label: 'Model Fidelity' },
    ],
  },
  {
    slug: 'ai-medical-diagnostics',
    heroImageFile: 'showcase-healthcare-ai.jpg',
    alt: 'Streamlined Clinical Diagnostics & Reduced Scan Review Times by 45%',
    outcomes: [
      { metric: '45%', label: 'Review Speedup' },
      { metric: '99.2%', label: 'Precision Rate' },
      { metric: 'SOC2', label: 'Certified Guardrails' },
    ],
  },
  {
    slug: 'autonomous-agent-logistics',
    heroImageFile: 'showcase-logistics-ai.jpg',
    alt: 'Engineered Real-Time Autonomous Fleet Dispatch for Next-Gen Warehouses',
    outcomes: [
      { metric: '4.2x', label: 'Throughput Multiplier' },
      { metric: '28%', label: 'Energy Cut' },
      { metric: '98%', label: 'Dispatch Precision' },
    ],
  },
];

async function ensureUploadedFile(app: any, filename: string, alt: string) {
  const existing = await app.query('plugin::upload.file').findOne({
    where: { name: filename },
  });
  if (existing) {
    console.log(`  File "${filename}" already exists in media library (ID: ${existing.id}).`);
    return existing;
  }

  const filePath = path.resolve(__dirname, '..', '..', 'metaphi', 'public', filename);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Public file not found at ${filePath}`);
  }

  const stats = fs.statSync(filePath);
  const uploadService = app.plugin('upload').service('upload');

  const fileData = {
    filepath: filePath,
    originalFilename: filename,
    mimetype: filename.endsWith('.png') ? 'image/png' : 'image/jpeg',
    size: stats.size,
  };

  const [uploaded] = await uploadService.upload({
    data: {
      fileInfo: {
        name: filename,
        caption: alt,
        alternativeText: alt,
      },
    },
    files: fileData,
  });

  console.log(`  Uploaded "${filename}" to media library (ID: ${uploaded.id}).`);
  return uploaded;
}

async function runMigration() {
  console.log('Starting Case Study migration through Document Service API...');
  const app = await createStrapi({ distDir: './dist' }).load();

  // 1. Load services that reference each case study in their legacy case_studies JSON
  const rawServices = await app.db.query('api::service.service').findMany({
    where: { publishedAt: { $notNull: true } },
    select: ['id', 'documentId', 'slug', 'case_studies'],
  });

  // Map case study slug -> array of service documentIds
  const csToServicesMap = new Map<string, Set<string>>();
  for (const s of rawServices) {
    let csJson: any[] = [];
    if (typeof s.case_studies === 'string') {
      try {
        csJson = JSON.parse(s.case_studies);
      } catch (e) {
        csJson = [];
      }
    } else if (Array.isArray(s.case_studies)) {
      csJson = s.case_studies;
    }

    for (const ref of csJson) {
      if (ref?.slug) {
        if (!csToServicesMap.has(ref.slug)) {
          csToServicesMap.set(ref.slug, new Set());
        }
        csToServicesMap.get(ref.slug)!.add(s.documentId);
      }
    }
  }

  // 2. Process each of the 3 case studies
  for (const csData of caseStudiesData) {
    console.log(`\nMigrating case study: "${csData.slug}"...`);
    const existingDoc = await app.documents('api::case-study.case-study').findFirst({
      filters: { slug: csData.slug },
      populate: ['heroImage', 'projectSummary', 'relatedServices'],
    });

    if (!existingDoc) {
      console.warn(`  Warning: Case study "${csData.slug}" not found in database!`);
      continue;
    }

    const docId = existingDoc.documentId;
    console.log(`  Found document: ${existingDoc.title} (docId: ${docId})`);

    // Ensure image uploaded
    const mediaFile = await ensureUploadedFile(app, csData.heroImageFile, csData.alt);

    // Prepare headline stats
    const headlineStats = csData.outcomes.map((o) => ({
      value: o.metric,
      label: o.label,
    }));

    // Resolve related service documentIds
    const relatedServiceDocIds = Array.from(csToServicesMap.get(csData.slug) || []);
    console.log(`  Linking ${relatedServiceDocIds.length} related services.`);

    // Build update payload
    // Approved mapping:
    // - outcomes -> projectSummary.headlineStats
    // - heroImage -> media upload ID
    // - seoDescription -> leave empty (frontend falls back to trimmed summary)
    // - relatedServices -> set to relatedServiceDocIds
    // - keyFacts, challenges, capabilities, workflow, tech groups, comparison rows, takeaways stay empty/null
    const updatePayload: any = {
      heroImage: mediaFile.id,
      projectSummary: {
        summaryText: null,
        clientLogo: null,
        keyFacts: [],
        headlineStats,
      },
      relatedServices: relatedServiceDocIds,
    };

    // Update draft version
    await app.documents('api::case-study.case-study').update({
      documentId: docId,
      data: updatePayload,
    });

    // Publish to update published version identically
    await app.documents('api::case-study.case-study').publish({
      documentId: docId,
    });

    console.log(`  ✓ Successfully updated and published case study "${csData.slug}".`);
  }

  console.log('\nCase study migration complete!');
  process.exit(0);
}

runMigration().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
