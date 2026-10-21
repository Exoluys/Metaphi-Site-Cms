import type { Schema, Struct } from '@strapi/strapi';

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

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'home.certification': HomeCertification;
      'home.client-logo': HomeClientLogo;
      'home.stat': HomeStat;
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
    }
  }
}
