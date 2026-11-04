import { createStrapi } from '@strapi/strapi';

async function createDummy() {
  console.log('Loading Strapi...');
  const app = await createStrapi({ distDir: './dist' }).load();

  try {
    const dummyData = {
      slug: 'dummy-case-study',
      title: 'DUMMY: Autonomous Energy Grid Balancing Through Multi-Agent RL',
      subtitle: 'DUMMY: Subtitle for High-Throughput Grid Optimization',
      summary: 'DUMMY: We engineered an autonomous multi-agent reinforcement learning platform to dynamically balance micro-grid renewable power distribution.',
      solutionText: 'DUMMY: Our team engineered real-time telemetry pipelines ingesting inverter signals across 50,000 edge nodes, coordinating dispatch instructions every 10 milliseconds.',
      tags: 'Clean Energy, AI Optimization, Edge Computing',
      order: 99,
      projectSummary: {
        summaryText: 'DUMMY: Project summary blurb outlining enterprise energy transformation and client milestones.',
        keyFacts: [
          { label: 'DUMMY: Industry', value: 'Clean Energy' },
          { label: 'DUMMY: Timeline', value: '4 Months' },
          { label: 'DUMMY: Deployment', value: 'Multi-Region Cloud' },
        ],
        headlineStats: [
          { value: '38%', label: 'DUMMY: Peak Reduction' },
          { value: '<5ms', label: 'DUMMY: Sync Latency' },
        ],
      },
      challengeSection: {
        challenge: 'DUMMY: Rapid adoption of distributed solar created uncontrollable localized power surges across legacy substations.',
        items: [
          { title: 'DUMMY: Grid Saturation', description: 'DUMMY: Legacy transformers overheated during peak midday generation.' },
          { title: 'DUMMY: Asymmetric Feed', description: 'DUMMY: Power feed variations risked localized brownouts.' },
          { title: 'DUMMY: Signal Latency', description: 'DUMMY: Centralized SCADA systems polled too slowly to prevent frequency drift.' },
        ],
      },
      impactSection: {
        outcomeCards: [
          { metric: '38%', title: 'DUMMY: Peak Reduction', description: 'DUMMY: Diminished midday overload.' },
          { metric: '<5ms', title: 'DUMMY: Sync Latency', description: 'DUMMY: Rapid edge peer convergence.' },
          { metric: '99.9%', title: 'DUMMY: Grid Uptime', description: 'DUMMY: Zero brownout events over six months.' },
        ],
      },
    };

    console.log('Checking if dummy case study already exists...');
    const existing = await app.documents('api::case-study.case-study').findFirst({
      filters: { slug: 'dummy-case-study' }
    });

    if (existing) {
      console.log('Dummy case study already exists (docId: ' + existing.documentId + '). Updating...');
      await app.documents('api::case-study.case-study').update({
        documentId: existing.documentId,
        data: dummyData
      });
      console.log('Updated successfully.');
    } else {
      console.log('Creating new dummy case study document...');
      const created = await app.documents('api::case-study.case-study').create({
        data: dummyData,
        status: 'published'
      });
      console.log('Created and published dummy case study (docId: ' + created.documentId + ')');
    }
  } catch (err) {
    console.error('Error during dummy case study creation:', err);
  } finally {
    process.exit(0);
  }
}

createDummy();
