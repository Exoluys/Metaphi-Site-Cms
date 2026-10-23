import type { Schema, Struct } from '@strapi/strapi';

export interface CaseStudyCapabilityItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_capabilities';
  info: {
    description: 'Solution capability delivered in the case study';
    displayName: 'Capability Item';
    icon: 'cog';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    icon: Schema.Attribute.Enumeration<
      [
        'Bot',
        'Sparkles',
        'Cpu',
        'Layers',
        'Rocket',
        'Smartphone',
        'Globe',
        'Code2',
        'Cloud',
        'CloudRain',
        'Boxes',
        'Database',
        'BarChart3',
        'PieChart',
        'TrendingUp',
        'FileText',
        'Compass',
        'Layout',
        'CheckCircle',
        'GitBranch',
        'Users',
        'FileCode',
        'Briefcase',
        'Zap',
        'Activity',
        'Building2',
        'GraduationCap',
        'Landmark',
        'ShoppingCart',
        'Truck',
      ]
    > &
      Schema.Attribute.DefaultTo<'Boxes'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseStudyChallengeItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_challenges';
  info: {
    description: 'Specific business or technical challenge';
    displayName: 'Challenge Item';
    icon: 'shield-alert';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseStudyChallengeSection extends Struct.ComponentSchema {
  collectionName: 'components_case_study_challenge_sections';
  info: {
    description: 'Business challenge section with eyebrow, heading, intro text and challenge items';
    displayName: 'Business Challenge Section';
    icon: 'shield-alert';
  };
  attributes: {
    challenges: Schema.Attribute.Component<'case-study.challenge-item', true>;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    introText: Schema.Attribute.Text;
  };
}

export interface CaseStudyComparisonRow extends Struct.ComponentSchema {
  collectionName: 'components_case_study_comparison_rows';
  info: {
    description: 'Baseline vs MetaPhi comparative row';
    displayName: 'Comparison Row';
    icon: 'table';
  };
  attributes: {
    baseline: Schema.Attribute.String & Schema.Attribute.Required;
    dimension: Schema.Attribute.String & Schema.Attribute.Required;
    ours: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseStudyImpactSection extends Struct.ComponentSchema {
  collectionName: 'components_case_study_impact_sections';
  info: {
    description: 'Business impact section with outcome cards and flattened comparison table';
    displayName: 'Business Impact Section';
    icon: 'trophy';
  };
  attributes: {
    baselineHeader: Schema.Attribute.String;
    comparisonRows: Schema.Attribute.Component<
      'case-study.comparison-row',
      true
    >;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    oursHeader: Schema.Attribute.String;
    outcomeCards: Schema.Attribute.Component<'case-study.outcome-card', true>;
  };
}

export interface CaseStudyKeyFact extends Struct.ComponentSchema {
  collectionName: 'components_case_study_key_facts';
  info: {
    description: 'Case study key fact row (e.g. Client, Industry, Engagement)';
    displayName: 'Key Fact';
    icon: 'bullet-list';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseStudyOutcomeCard extends Struct.ComponentSchema {
  collectionName: 'components_case_study_outcome_cards';
  info: {
    description: 'Business impact outcome metric card';
    displayName: 'Outcome Card';
    icon: 'trophy';
  };
  attributes: {
    description: Schema.Attribute.Text;
    metric: Schema.Attribute.String & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseStudyProjectSummarySection extends Struct.ComponentSchema {
  collectionName: 'components_case_study_project_summaries';
  info: {
    description: 'Project summary section with client logo, summary text, key facts and headline stats';
    displayName: 'Project Summary Section';
    icon: 'information';
  };
  attributes: {
    clientLogo: Schema.Attribute.Media<'images'>;
    headlineStats: Schema.Attribute.Component<'case-study.stat', true>;
    keyFacts: Schema.Attribute.Component<'case-study.key-fact', true>;
    summaryText: Schema.Attribute.Text;
  };
}

export interface CaseStudySolutionSection extends Struct.ComponentSchema {
  collectionName: 'components_case_study_solution_sections';
  info: {
    description: 'Solution and capabilities section with paragraphs, side image, and capabilities list';
    displayName: 'Solution Section';
    icon: 'cog';
  };
  attributes: {
    capabilities: Schema.Attribute.Component<
      'case-study.capability-item',
      true
    >;
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    paragraphOne: Schema.Attribute.Text;
    paragraphTwo: Schema.Attribute.Text;
    sideImage: Schema.Attribute.Media<'images'>;
  };
}

export interface CaseStudyStageItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_stages';
  info: {
    description: 'Workflow phase or stage';
    displayName: 'Stage Item';
    icon: 'layer';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseStudyStat extends Struct.ComponentSchema {
  collectionName: 'components_case_study_stats';
  info: {
    description: 'Case study headline stat with value and label';
    displayName: 'Stat';
    icon: 'chart-bubble';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseStudyTakeawayItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_takeaways';
  info: {
    description: 'Numbered key takeaway or strategic learning';
    displayName: 'Takeaway Item';
    icon: 'check';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface CaseStudyTakeawaysSection extends Struct.ComponentSchema {
  collectionName: 'components_case_study_takeaways_sections';
  info: {
    description: 'Takeaways section with paragraphs, numbered takeaways, and side image';
    displayName: 'Takeaways Section';
    icon: 'check';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    paragraphOne: Schema.Attribute.Text;
    paragraphTwo: Schema.Attribute.Text;
    sideImage: Schema.Attribute.Media<'images'>;
    takeaways: Schema.Attribute.Component<'case-study.takeaway-item', true>;
  };
}

export interface CaseStudyTechGroup extends Struct.ComponentSchema {
  collectionName: 'components_case_study_tech_groups';
  info: {
    description: 'Technology category and list of tools/libraries';
    displayName: 'Tech Group';
    icon: 'code';
  };
  attributes: {
    group: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface CaseStudyTechnologySection extends Struct.ComponentSchema {
  collectionName: 'components_case_study_technology_sections';
  info: {
    description: 'Technology stack section with eyebrow, heading, intro text, and tech groups';
    displayName: 'Technology Section';
    icon: 'code';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    introText: Schema.Attribute.Text;
    techGroups: Schema.Attribute.Component<'case-study.tech-group', true>;
  };
}

export interface CaseStudyWorkflowSection extends Struct.ComponentSchema {
  collectionName: 'components_case_study_workflow_sections';
  info: {
    description: 'Workflow stages section with eyebrow, heading, subtitle, and numbered stages';
    displayName: 'Workflow Section';
    icon: 'layer';
  };
  attributes: {
    eyebrow: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    stages: Schema.Attribute.Component<'case-study.stage-item', true>;
    subtitle: Schema.Attribute.Text;
  };
}

export interface HomeCertification extends Struct.ComponentSchema {
  collectionName: 'components_home_certifications';
  info: {
    description: '';
    displayName: 'Certification';
    icon: 'shield';
  };
  attributes: {
    icon: Schema.Attribute.Enumeration<
      ['shield-check', 'award', 'lock', 'file-check']
    > &
      Schema.Attribute.DefaultTo<'shield-check'>;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    sub: Schema.Attribute.String;
  };
}

export interface HomeClientLogo extends Struct.ComponentSchema {
  collectionName: 'components_home_client_logos';
  info: {
    description: '';
    displayName: 'Client Logo';
    icon: 'alien';
  };
  attributes: {
    logo: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    order: Schema.Attribute.Integer;
  };
}

export interface HomeStat extends Struct.ComponentSchema {
  collectionName: 'components_home_stats';
  info: {
    description: '';
    displayName: 'Stat';
    icon: 'connector';
  };
  attributes: {
    label: Schema.Attribute.String;
    suffix: Schema.Attribute.String;
    value: Schema.Attribute.Integer;
  };
}

export interface IndustryPageCaseStudiesSection extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_case_studies_sections';
  info: {
    description: 'Case studies section header and copy';
    displayName: 'Case Studies Section';
    icon: 'briefcase';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    intro: Schema.Attribute.Text;
  };
}

export interface IndustryPageChallengeRow extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_challenge_rows';
  info: {
    description: 'Industry problem, cost to client, solution label and linked service';
    displayName: 'Challenge Row';
    icon: 'shield-alert';
  };
  attributes: {
    challenge: Schema.Attribute.Text & Schema.Attribute.Required;
    costToClient: Schema.Attribute.Text & Schema.Attribute.Required;
    linkedService: Schema.Attribute.Relation<
      'manyToOne',
      'api::service.service'
    >;
    solutionLabel: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface IndustryPageChallengesSection extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_challenges_sections';
  info: {
    description: 'Challenges grid with cost to client and solution service links';
    displayName: 'Challenges Section';
    icon: 'shield-alt';
  };
  attributes: {
    challenges: Schema.Attribute.Component<'industry-page.challenge-row', true>;
    ctaLabel: Schema.Attribute.String;
    ctaLink: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    sideImage: Schema.Attribute.Media<'images'>;
  };
}

export interface IndustryPageCtaBanner extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_cta_banners';
  info: {
    description: 'Bottom CTA banner above footer';
    displayName: 'CTA Banner';
    icon: 'flag';
  };
  attributes: {
    buttonLabel: Schema.Attribute.String & Schema.Attribute.Required;
    buttonLink: Schema.Attribute.String & Schema.Attribute.Required;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'>;
    text: Schema.Attribute.Text;
    themeVariant: Schema.Attribute.Enumeration<['dark', 'light', 'gradient']> &
      Schema.Attribute.DefaultTo<'dark'>;
  };
}

export interface IndustryPageHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_hero_sections';
  info: {
    description: 'Industry page hero section';
    displayName: 'Hero Section';
    icon: 'layer-group';
  };
  attributes: {
    description: Schema.Attribute.Text;
    heroImage: Schema.Attribute.Media<'images'>;
    lastReviewedDate: Schema.Attribute.Date;
    primaryCtaLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Book a consultation'>;
    primaryCtaLink: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/schedule-a-call'>;
    title: Schema.Attribute.String;
  };
}

export interface IndustryPageServiceTab extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_service_tabs';
  info: {
    description: 'Linked service with industry-specific copy and highlights';
    displayName: 'Service Tab';
    icon: 'cog';
  };
  attributes: {
    highlightTags: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    industryDescription: Schema.Attribute.Text & Schema.Attribute.Required;
    order: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<0>;
    service: Schema.Attribute.Relation<'manyToOne', 'api::service.service'> &
      Schema.Attribute.Required;
  };
}

export interface IndustryPageServicesSection extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_services_sections';
  info: {
    description: 'Services we offer tabs section';
    displayName: 'Services Section';
    icon: 'layer-group';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String;
    ctaLink: Schema.Attribute.String;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    services: Schema.Attribute.Component<'industry-page.service-tab', true>;
  };
}

export interface IndustryPageSolutionCategory extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_solution_categories';
  info: {
    description: 'Category tab grouping solutions';
    displayName: 'Solution Category';
    icon: 'folder';
  };
  attributes: {
    categoryName: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Component<'industry-page.solution-item', true>;
  };
}

export interface IndustryPageSolutionItem extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_solution_items';
  info: {
    description: 'Specific solution item inside category';
    displayName: 'Solution Item';
    icon: 'lightbulb';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    image: Schema.Attribute.Media<'images'>;
    link: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface IndustryPageSolutionsSection extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_solutions_sections';
  info: {
    description: 'Categorized solutions tabs section';
    displayName: 'Solutions Section';
    icon: 'puzzle-piece';
  };
  attributes: {
    categories: Schema.Attribute.Component<
      'industry-page.solution-category',
      true
    >;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    intro: Schema.Attribute.Text;
  };
}

export interface IndustryPageStatItem extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_stat_items';
  info: {
    description: 'Quantifiable industry stat or metric';
    displayName: 'Stat Item';
    icon: 'chart-pie';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface IndustryPageTechStackSection extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_tech_stack_sections';
  info: {
    description: 'Tech stack section grouped by category';
    displayName: 'Tech Stack Section';
    icon: 'code';
  };
  attributes: {
    groups: Schema.Attribute.Component<'service.tech-group', true>;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface IndustryPageTrustBar extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_trust_bars';
  info: {
    description: 'Trust bar header with client logos';
    displayName: 'Trust Bar';
    icon: 'handshake';
  };
  attributes: {
    heading: Schema.Attribute.String;
  };
}

export interface IndustryPageVerticalCard extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_vertical_cards';
  info: {
    description: 'Sub-vertical card with icon or uploaded SVG';
    displayName: 'Vertical Card';
    icon: 'shapes';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    uploadedIcon: Schema.Attribute.Media<'images'>;
  };
}

export interface IndustryPageVerticalsSection extends Struct.ComponentSchema {
  collectionName: 'components_industry_page_verticals_sections';
  info: {
    description: 'Sub-verticals and focus areas grid';
    displayName: 'Verticals Section';
    icon: 'th-large';
  };
  attributes: {
    heading: Schema.Attribute.String & Schema.Attribute.Required;
    intro: Schema.Attribute.Text;
    verticals: Schema.Attribute.Component<'industry-page.vertical-card', true>;
  };
}

export interface ServiceAssurance extends Struct.ComponentSchema {
  collectionName: 'components_service_assurances';
  info: {
    description: 'Operational assurance or engineering SLA';
    displayName: 'Assurance';
    icon: 'shield-check';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface ServiceBenefit extends Struct.ComponentSchema {
  collectionName: 'components_service_benefits';
  info: {
    description: 'Quantifiable benefit or value driver';
    displayName: 'Benefit';
    icon: 'thumb-up';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceBusinessFunction extends Struct.ComponentSchema {
  collectionName: 'components_service_business_functions';
  info: {
    description: 'Target business department and use case';
    displayName: 'Business Function';
    icon: 'briefcase';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceChallenge extends Struct.ComponentSchema {
  collectionName: 'components_service_challenges';
  info: {
    description: 'Technical challenge and solution';
    displayName: 'Challenge';
    icon: 'shield-alert';
  };
  attributes: {
    solution: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceComplianceBadge extends Struct.ComponentSchema {
  collectionName: 'components_service_compliance_badges';
  info: {
    description: 'Compliance or regulatory certification badge';
    displayName: 'Compliance Badge';
    icon: 'shield';
  };
  attributes: {
    standard: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceIndustryContext extends Struct.ComponentSchema {
  collectionName: 'components_service_industry_contexts';
  info: {
    description: 'Tailored industry pitch and bullet points (one per line)';
    displayName: 'Industry Context';
    icon: 'briefcase';
  };
  attributes: {
    blurb: Schema.Attribute.Text & Schema.Attribute.Required;
    bullets: Schema.Attribute.Text & Schema.Attribute.Required;
    industry: Schema.Attribute.Relation<'oneToOne', 'api::industry.industry'>;
  };
}

export interface ServiceOffering extends Struct.ComponentSchema {
  collectionName: 'components_service_offerings';
  info: {
    description: 'Core offering or capability';
    displayName: 'Offering';
    icon: 'apps';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceProcessStep extends Struct.ComponentSchema {
  collectionName: 'components_service_process_steps';
  info: {
    description: 'Step in engineering or delivery methodology';
    displayName: 'Process Step';
    icon: 'cog';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceSolutionType extends Struct.ComponentSchema {
  collectionName: 'components_service_solution_types';
  info: {
    description: 'Solution architecture type';
    displayName: 'Solution Type';
    icon: 'puzzle';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceStat extends Struct.ComponentSchema {
  collectionName: 'components_service_stats';
  info: {
    description: 'Key metric or performance indicator';
    displayName: 'Stat';
    icon: 'chart-bubble';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ServiceTechGroup extends Struct.ComponentSchema {
  collectionName: 'components_service_tech_groups';
  info: {
    description: 'Technology category and list of technologies (one per line)';
    displayName: 'Tech Group';
    icon: 'server';
  };
  attributes: {
    group: Schema.Attribute.String & Schema.Attribute.Required;
    items: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface ServiceWhyUs extends Struct.ComponentSchema {
  collectionName: 'components_service_why_uses';
  info: {
    description: 'Differentiator reason why client should choose Metaphi';
    displayName: 'Why Us';
    icon: 'star';
  };
  attributes: {
    description: Schema.Attribute.Text & Schema.Attribute.Required;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSection extends Struct.ComponentSchema {
  collectionName: 'components_shared_sections';
  info: {
    description: '';
    displayName: 'Section';
    icon: 'layer';
  };
  attributes: {
    anchor: Schema.Attribute.String & Schema.Attribute.Required;
    content: Schema.Attribute.Text;
    heading: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSeo extends Struct.ComponentSchema {
  collectionName: 'components_shared_seos';
  info: {
    description: 'Metadata for SEO and social sharing';
    displayName: 'SEO';
    icon: 'search';
  };
  attributes: {
    keywords: Schema.Attribute.String;
    metaDescription: Schema.Attribute.Text;
    metaTitle: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'case-study.capability-item': CaseStudyCapabilityItem;
      'case-study.challenge-item': CaseStudyChallengeItem;
      'case-study.challenge-section': CaseStudyChallengeSection;
      'case-study.comparison-row': CaseStudyComparisonRow;
      'case-study.impact-section': CaseStudyImpactSection;
      'case-study.key-fact': CaseStudyKeyFact;
      'case-study.outcome-card': CaseStudyOutcomeCard;
      'case-study.project-summary-section': CaseStudyProjectSummarySection;
      'case-study.solution-section': CaseStudySolutionSection;
      'case-study.stage-item': CaseStudyStageItem;
      'case-study.stat': CaseStudyStat;
      'case-study.takeaway-item': CaseStudyTakeawayItem;
      'case-study.takeaways-section': CaseStudyTakeawaysSection;
      'case-study.tech-group': CaseStudyTechGroup;
      'case-study.technology-section': CaseStudyTechnologySection;
      'case-study.workflow-section': CaseStudyWorkflowSection;
      'home.certification': HomeCertification;
      'home.client-logo': HomeClientLogo;
      'home.stat': HomeStat;
      'industry-page.case-studies-section': IndustryPageCaseStudiesSection;
      'industry-page.challenge-row': IndustryPageChallengeRow;
      'industry-page.challenges-section': IndustryPageChallengesSection;
      'industry-page.cta-banner': IndustryPageCtaBanner;
      'industry-page.hero-section': IndustryPageHeroSection;
      'industry-page.service-tab': IndustryPageServiceTab;
      'industry-page.services-section': IndustryPageServicesSection;
      'industry-page.solution-category': IndustryPageSolutionCategory;
      'industry-page.solution-item': IndustryPageSolutionItem;
      'industry-page.solutions-section': IndustryPageSolutionsSection;
      'industry-page.stat-item': IndustryPageStatItem;
      'industry-page.tech-stack-section': IndustryPageTechStackSection;
      'industry-page.trust-bar': IndustryPageTrustBar;
      'industry-page.vertical-card': IndustryPageVerticalCard;
      'industry-page.verticals-section': IndustryPageVerticalsSection;
      'service.assurance': ServiceAssurance;
      'service.benefit': ServiceBenefit;
      'service.business-function': ServiceBusinessFunction;
      'service.challenge': ServiceChallenge;
      'service.compliance-badge': ServiceComplianceBadge;
      'service.industry-context': ServiceIndustryContext;
      'service.offering': ServiceOffering;
      'service.process-step': ServiceProcessStep;
      'service.solution-type': ServiceSolutionType;
      'service.stat': ServiceStat;
      'service.tech-group': ServiceTechGroup;
      'service.why-us': ServiceWhyUs;
      'shared.section': SharedSection;
      'shared.seo': SharedSeo;
    }
  }
}
