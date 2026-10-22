import http from 'http';

const slugs = [
  'ai-agent-development',
  'business-intelligence',
  'cicd-pipeline-automation',
  'cloud-engineering',
  'cloud-migration',
  'cms-development',
  'crm-development',
  'data-analytics',
  'data-engineering',
  'data-visualization',
  'devops-and-kubernetes',
  'digital-transformation',
  'digital-twin-engineering',
  'erp-development',
  'generative-ai-development',
  'ml-development',
  'mobile-app-development',
  'mvp-development',
  'natural-language-processing',
  'on-demand-solutions',
  'product-design-and-ux',
  'progressive-web-apps',
  'qa-testing',
  'saas-application-development',
  'software-development',
  'web-application-development',
  'web-portal-development',
];

function fetchPage(slug: string): Promise<{ status: number; hasPh: boolean; length: number }> {
  return new Promise((resolve) => {
    http.get(`http://localhost:3000/services/${slug}`, (res) => {
      let body = '';
      res.on('data', (d) => (body += d));
      res.on('end', () => {
        resolve({
          status: res.statusCode || 0,
          hasPh: body.includes('Placeholder content:'),
          length: body.length,
        });
      });
    }).on('error', (err) => {
      resolve({ status: 500, hasPh: false, length: 0 });
    });
  });
}

async function verifyAll() {
  console.log('Comparing all 27 /services/[slug] pages:');
  let passCount = 0;

  for (const slug of slugs) {
    const res = await fetchPage(slug);
    const pass = res.status === 200 && !res.hasPh;
    if (pass) passCount++;
    console.log(
      `${slug.padEnd(30)} => Status: ${res.status} | Has Placeholder: ${res.hasPh ? 'YES' : 'NO '} | [${pass ? 'PASS' : 'FAIL'}]`
    );
  }

  console.log(`\nResult: ${passCount} / ${slugs.length} passed.`);
}

verifyAll();
