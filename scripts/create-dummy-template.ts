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
      body: 'DUMMY: Renewable micro-grids experience severe transient fluctuations requiring microsecond balancing.\n\nDUMMY: We deployed intelligent distributed swarms that stabilize frequency deviations before cascade failures occur.',
      seoDescription: null,
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
        eyebrow: 'DUMMY: The Problem',
        heading: 'DUMMY: High Frequency Grid Instability',
        introText: 'DUMMY: Rapid adoption of distributed solar created uncontrollable localized power surges.',
        challenges: [
          { title: 'DUMMY: Grid Saturation', description: 'DUMMY: Legacy transformers overheated during peak midday generation.' },
          { title: 'DUMMY: Asymmetric Feed', description: 'DUMMY: Power feed variations risked localized brownouts.' },
        ],
      },
      solutionSection: {
        eyebrow: 'DUMMY: The Solution',
        heading: 'DUMMY: Decentralized Swarm Coordination',
        paragraphOne: 'DUMMY: Our team engineered real-time telemetry pipelines ingesting inverter signals across 50,000 edge nodes.',
        paragraphTwo: 'DUMMY: Intelligent agents coordinate dispatch instructions every 10 milliseconds to damp harmonics.',
        capabilities: [
          { icon: 'Zap', title: 'DUMMY: Sub-second Control', description: 'DUMMY: Hardware in the loop automated response.' },
          { icon: 'Cpu', title: 'DUMMY: Fail-Safe Isolation', description: 'DUMMY: Air-gapped failover logic.' },
        ],
      },
      workflowSection: {
        eyebrow: 'DUMMY: The Process',
        heading: 'DUMMY: 4-Stage Deployment Architecture',
        subtitle: 'DUMMY: From digital twin modeling to edge firmware rollouts.',
        stages: [
          { stepNumber: '01', title: 'DUMMY: Simulation Modeling', description: 'DUMMY: Validated stability across 10,000 Monte Carlo runs.' },
          { stepNumber: '02', title: 'DUMMY: Edge Firmware Agent', description: 'DUMMY: Compiled lightweight C++ inference runtimes.' },
        ],
      },
      technologySection: {
        eyebrow: 'DUMMY: Tech Stack',
        heading: 'DUMMY: Real-Time Event Driven Architecture',
        introText: 'DUMMY: High-concurrency systems engineered for fault tolerance.',
        techGroups: [
          {
            group: 'DUMMY: Core Compute',
            items: 'Rust\nKafka\nPyTorch',
          },
        ],
      },
      impactSection: {
        eyebrow: 'DUMMY: Business Impact',
        heading: 'DUMMY: Measurable Performance Gains',
        baselineHeader: 'DUMMY: Legacy Grid',
        oursHeader: 'DUMMY: MetaPhi Swarm',
        outcomeCards: [
          { metric: '99.99%', title: 'DUMMY: Uptime', description: 'DUMMY: Zero brownout events across 12 months.' },
          { metric: '4.8x', title: 'DUMMY: Efficiency', description: 'DUMMY: Faster load balancing dispatch cycles.' },
        ],
        comparisonRows: [
          { dimension: 'DUMMY: Fault Response', baseline: '45 seconds', ours: '12 milliseconds' },
          { dimension: 'DUMMY: Curtailment Loss', baseline: '14.2%', ours: '0.8%' },
        ],
      },
      takeawaysSection: {
        eyebrow: 'DUMMY: Key Lessons',
        heading: 'DUMMY: Insights From Grid Modernization',
        paragraphOne: 'DUMMY: Edge intelligence dramatically minimizes central cloud roundtrip latency.',
        paragraphTwo: 'DUMMY: Continuous automated testing prevents catastrophic cascading edge failures.',
        takeaways: [
          { title: 'DUMMY: Latency is King', description: 'DUMMY: Local inference decisions must never wait on cloud API handshakes.' },
          { title: 'DUMMY: Observability First', description: 'DUMMY: High-resolution telemetry is non-negotiable for autonomous swarms.' },
        ],
      },
    };

    const doc = await app.documents('api::case-study.case-study').create({
      status: 'published',
      data: dummyData,
    });

    console.log('Created and published dummy case study:', doc.documentId, doc.slug);

  } catch(err: any) {
    console.error('Failed to create dummy case study:', err);
    if (err.details?.errors) {
      console.error('Validation errors:', JSON.stringify(err.details.errors, null, 2));
    }
  } finally {
    process.exit(0);
  }
}

createDummy();
