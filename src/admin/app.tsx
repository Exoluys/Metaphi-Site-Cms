import type { StrapiApp } from '@strapi/strapi/admin';

const CUSTOM_ONLY_FIELDS = new Set([
  'problemText',
  'offeringsHeading',
  'offerings',
  'useCasesHeading',
  'useCasesSubtext',
  'useCases',
  'outcomesHeading',
  'outcomesSubtext',
  'outcomes',
  'approachHeading',
  'approachSubtext',
  'approachSteps',
  'capabilitiesSubtext',
  'techApproachHeading',
  'techApproachText',
  'techApproachItems',
  'aiOpportunitiesSubtext',
  'secondaryNarrativeHeading',
  'secondaryNarrativeText',
  'modernisationHeading',
  'modernisationSubtext',
  'modernisationItems',
]);

const READY_ONLY_FIELDS = new Set([
  'whoItIsFor',
  'solutionOverview',
  'exampleWorkflow',
  'coreModules',
  'whatIsAlreadyAvailable',
  'whatCanBeConfigured',
  'whatCanBeExtended',
]);

const SAAS_ONLY_FIELDS = new Set([
  'whoItIsForText',
  'notRightFitHeading',
  'notRightFitText',
  'productScreenshots',
  'finalCtaSecondaryLabel',
]);

const SAAS_HIDDEN_FIELDS = new Set([
  ...READY_ONLY_FIELDS,
  'problemItems',
  'useCasesHeading',
  'useCasesSubtext',
  'useCases',
  'outcomesHeading',
  'outcomesSubtext',
  'outcomes',
  'industries',
  'approachSubtext',
  'techApproachHeading',
  'techApproachText',
  'techApproachItems',
  'aiOpportunitiesHeading',
  'aiOpportunitiesSubtext',
  'aiOpportunities',
  'modernisationHeading',
  'modernisationSubtext',
  'modernisationItems',
  'caseStudies',
  'relatedResources',
]);

const ALL_CONDITIONAL_FIELDS = new Set([
  ...CUSTOM_ONLY_FIELDS,
  ...READY_ONLY_FIELDS,
  ...SAAS_ONLY_FIELDS,
  ...SAAS_HIDDEN_FIELDS,
]);

function getGridCell(el: Element | null): HTMLElement | null {
  let curr: HTMLElement | null = el as HTMLElement | null;
  while (curr && curr.parentElement) {
    const parentStyle = window.getComputedStyle(curr.parentElement);
    if (parentStyle.display === 'grid') {
      return curr;
    }
    curr = curr.parentElement;
  }
  return null;
}

function detectModelType(): string | null {
  // Check combobox / select / hidden input for modelType
  const byName = document.querySelector('[name="modelType"]') as HTMLInputElement | HTMLSelectElement | HTMLButtonElement | null;
  if (byName) {
    const val = (byName as HTMLInputElement).value || byName.textContent || '';
    const trimmed = val.trim().toLowerCase();
    if (trimmed === 'custom' || trimmed === 'ready-to-configure' || trimmed === 'saas') {
      return trimmed;
    }
  }

  // Fallback: locate label containing "modelType" and read its sibling combobox text
  const labels = document.querySelectorAll('label, span');
  for (const lbl of labels) {
    const text = (lbl.textContent || '').replace('*', '').trim();
    if (text === 'modelType') {
      const cell = getGridCell(lbl);
      if (cell) {
        const combo = cell.querySelector('[role="combobox"], button, input');
        const val = ((combo as HTMLInputElement)?.value || combo?.textContent || '').trim().toLowerCase();
        if (val === 'custom' || val === 'ready-to-configure' || val === 'saas') {
          return val;
        }
      }
    }
  }
  return null;
}

function applySolutionFieldVisibility() {
  if (typeof window === 'undefined') return;
  if (!window.location.pathname.includes('api::solution.solution')) return;

  const modelType = detectModelType();
  if (!modelType) return;

  const hiddenSet =
    modelType === 'custom'
      ? new Set([...READY_ONLY_FIELDS, ...SAAS_ONLY_FIELDS])
      : modelType === 'ready-to-configure'
      ? new Set([...CUSTOM_ONLY_FIELDS, ...SAAS_ONLY_FIELDS])
      : SAAS_HIDDEN_FIELDS;

  // Scan field labels / component headings / inputs in the main form grid
  const candidates = document.querySelectorAll(
    'main label, main span, main p, main h2, main h3, main h4, main legend, main input[name], main textarea[name]'
  );
  const seenCells = new Set<HTMLElement>();

  for (const el of candidates) {
    const attrName = (el.getAttribute('name') || el.getAttribute('for') || '').trim();
    let fieldName = ALL_CONDITIONAL_FIELDS.has(attrName) ? attrName : '';
    if (!fieldName) {
      // Component/repeatable labels often look like "whoItIsFor (6)" or "offerings (0)"
      const raw = (el.textContent || '').replace('*', '').replace(/\s*\(\d+\)\s*$/, '').trim();
      if (ALL_CONDITIONAL_FIELDS.has(raw)) {
        fieldName = raw;
      }
    }

    if (!fieldName || !ALL_CONDITIONAL_FIELDS.has(fieldName)) {
      continue;
    }

    const cell = getGridCell(el);
    if (!cell || seenCells.has(cell)) continue;
    seenCells.add(cell);

    cell.style.display = hiddenSet.has(fieldName) ? 'none' : '';
  }
}

export default {
  config: {
    locales: [],
  },
  bootstrap(_app: StrapiApp) {
    if (typeof window === 'undefined') return;

    let rafId: number | null = null;
    const schedule = () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        applySolutionFieldVisibility();
      });
    };

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      characterData: true,
    });

    document.addEventListener('click', schedule, true);
    window.addEventListener('popstate', schedule);
  },
};
