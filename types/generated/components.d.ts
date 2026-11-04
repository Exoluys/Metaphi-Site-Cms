import type { Schema, Struct } from '@strapi/strapi';

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
    description: 'Business challenge section with challenge paragraph and 3 challenge items';
    displayName: 'Business Challenge Section';
    icon: 'shield-alert';
  };
  attributes: {
    challenge: Schema.Attribute.Text;
    items: Schema.Attribute.Component<'case-study.challenge-item', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 3;
          min: 3;
        },
        number
      >;
  };
}

export interface CaseStudyImpactSection extends Struct.ComponentSchema {
  collectionName: 'components_case_study_impact_sections';
  info: {
    description: 'Business impact section with 3 outcome cards';
    displayName: 'Business Impact Section';
    icon: 'trophy';
  };
  attributes: {
    outcomeCards: Schema.Attribute.Component<'case-study.outcome-card', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 3;
          min: 3;
        },
        number
      >;
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

export interface CaseStudyTagItem extends Struct.ComponentSchema {
  collectionName: 'components_case_study_tags';
  info: {
    description: 'Tag item with title';
    displayName: 'Tag';
    icon: 'price-tag';
  };
  attributes: {
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface ContactPhoneItem extends Struct.ComponentSchema {
  collectionName: 'components_contact_phone_items';
  info: {
    description: 'Phone label and number';
    displayName: 'Phone Item';
    icon: 'phone';
  };
  attributes: {
    href: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
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
    logo: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    order: Schema.Attribute.Integer;
  };
}

export interface HomeStat extends Struct.ComponentSchema {
  collectionName: 'components_home_stats';
  info: {
    description: 'Company stat with integer value and label';
    displayName: 'Stat';
    icon: 'connector';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    suffix: Schema.Attribute.String;
    value: Schema.Attribute.Integer &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      >;
  };
}

export interface HubCapabilityCard extends Struct.ComponentSchema {
  collectionName: 'components_hub_capability_cards';
  info: {
    description: 'Card representing a custom capability';
    displayName: 'Capability Card';
    icon: 'layer';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HubChecklist extends Struct.ComponentSchema {
  collectionName: 'components_hub_checklists';
  info: {
    description: 'Checklist section with optional heading and repeatable string items';
    displayName: 'Checklist Section';
    icon: 'checkCircle';
  };
  attributes: {
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'hub.string-item', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 9;
        },
        number
      >;
  };
}

export interface HubComparisonMatrix extends Struct.ComponentSchema {
  collectionName: 'components_hub_comparison_matrices';
  info: {
    description: 'Comparison matrix section (e.g. SaaS vs Ready-to-Configure vs Custom)';
    displayName: 'Comparison Matrix';
    icon: 'apps';
  };
  attributes: {
    customColumn: Schema.Attribute.Text;
    heading: Schema.Attribute.String;
    readyColumn: Schema.Attribute.Text;
    saasColumn: Schema.Attribute.Text;
    subtext: Schema.Attribute.Text;
  };
}

export interface HubComparisonRow extends Struct.ComponentSchema {
  collectionName: 'components_hub_comparison_rows';
  info: {
    description: 'Row in comparison matrix with label and description';
    displayName: 'Comparison Row';
    icon: 'layer';
  };
  attributes: {
    description: Schema.Attribute.Text;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HubFinalCta extends Struct.ComponentSchema {
  collectionName: 'components_hub_final_ctas';
  info: {
    description: 'Standard bottom final CTA section for hub pages';
    displayName: 'Final CTA';
    icon: 'cursor';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String & Schema.Attribute.Required;
    heading: Schema.Attribute.String;
    subtext: Schema.Attribute.Text;
  };
}

export interface HubHowToChoose extends Struct.ComponentSchema {
  collectionName: 'components_hub_how_to_chooses';
  info: {
    description: 'Guidance on how to choose between solution models';
    displayName: 'How to Choose Section';
    icon: 'question';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String;
    customRule: Schema.Attribute.Text;
    customRuleTitle: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    readyRule: Schema.Attribute.Text;
    readyRuleTitle: Schema.Attribute.String;
    saasRule: Schema.Attribute.Text;
    saasRuleTitle: Schema.Attribute.String;
    subtext: Schema.Attribute.Text;
  };
}

export interface HubInfoBlock extends Struct.ComponentSchema {
  collectionName: 'components_hub_info_blocks';
  info: {
    description: 'General section block with heading, subtext, and CTA';
    displayName: 'Info Block';
    icon: 'information';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    subtext: Schema.Attribute.Text;
  };
}

export interface HubLinkItem extends Struct.ComponentSchema {
  collectionName: 'components_hub_link_items';
  info: {
    description: 'Repeatable link item with text, label and URL';
    displayName: 'Link Item';
    icon: 'link';
  };
  attributes: {
    linkLabel: Schema.Attribute.String & Schema.Attribute.Required;
    linkUrl: Schema.Attribute.String;
    text: Schema.Attribute.String;
  };
}

export interface HubOtherModelItem extends Struct.ComponentSchema {
  collectionName: 'components_hub_other_model_items';
  info: {
    description: 'Fixed other model item for SaaS hub';
    displayName: 'Other Model Item';
    icon: 'layer';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HubOtherModels extends Struct.ComponentSchema {
  collectionName: 'components_hub_other_models';
  info: {
    description: 'Block listing other solution models';
    displayName: 'Other Models Block';
    icon: 'apps';
  };
  attributes: {
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'hub.other-model-item', true> &
      Schema.Attribute.SetMinMax<
        {
          max: 2;
          min: 2;
        },
        number
      >;
  };
}

export interface HubPortfolioItem extends Struct.ComponentSchema {
  collectionName: 'components_hub_portfolio_items';
  info: {
    description: 'Item in solution portfolio with title, optional description, and optional link';
    displayName: 'Portfolio Item';
    icon: 'layer';
  };
  attributes: {
    description: Schema.Attribute.Text;
    link: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HubProcessFlow extends Struct.ComponentSchema {
  collectionName: 'components_hub_process_flows';
  info: {
    description: 'Process or delivery flow section with repeatable steps';
    displayName: 'Process Flow';
    icon: 'cog';
  };
  attributes: {
    heading: Schema.Attribute.String;
    steps: Schema.Attribute.Component<'hub.step-item', true>;
    subtext: Schema.Attribute.Text;
  };
}

export interface HubProofBlock extends Struct.ComponentSchema {
  collectionName: 'components_hub_proof_blocks';
  info: {
    description: 'Proof / case study CTA block on hub pages';
    displayName: 'Proof Block';
    icon: 'shield';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String & Schema.Attribute.Required;
    heading: Schema.Attribute.String;
  };
}

export interface HubSaasProduct extends Struct.ComponentSchema {
  collectionName: 'components_hub_saas_products';
  info: {
    description: 'SaaS product card item';
    displayName: 'SaaS Product Item';
    icon: 'shoppingCart';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    logo: Schema.Attribute.Media<'images'>;
    name: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HubSolutionModel extends Struct.ComponentSchema {
  collectionName: 'components_hub_solution_models';
  info: {
    description: 'Card representing an engagement model on the Solutions Hub';
    displayName: 'Solution Model Card';
    icon: 'apps';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String;
    description: Schema.Attribute.Text;
    tagline: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HubSolutionPortfolio extends Struct.ComponentSchema {
  collectionName: 'components_hub_solution_portfolios';
  info: {
    description: 'Solution portfolio section with repeatable items and CTA';
    displayName: 'Solution Portfolio';
    icon: 'apps';
  };
  attributes: {
    ctaLabel: Schema.Attribute.String;
    heading: Schema.Attribute.String;
    items: Schema.Attribute.Component<'hub.portfolio-item', true>;
  };
}

export interface HubStepItem extends Struct.ComponentSchema {
  collectionName: 'components_hub_step_items';
  info: {
    description: 'Step item for process and implementation flows';
    displayName: 'Step Item';
    icon: 'bulletList';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HubStringItem extends Struct.ComponentSchema {
  collectionName: 'components_hub_string_items';
  info: {
    description: 'Simple repeatable string item for checklists, rules, and outcomes';
    displayName: 'String Item';
    icon: 'bulletList';
  };
  attributes: {
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface HubTitleDescription extends Struct.ComponentSchema {
  collectionName: 'components_hub_title_descriptions';
  info: {
    description: 'Item with title and description';
    displayName: 'Title Description Item';
    icon: 'layer';
  };
  attributes: {
    description: Schema.Attribute.Text;
    title: Schema.Attribute.String & Schema.Attribute.Required;
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
      'case-study.challenge-item': CaseStudyChallengeItem;
      'case-study.challenge-section': CaseStudyChallengeSection;
      'case-study.impact-section': CaseStudyImpactSection;
      'case-study.key-fact': CaseStudyKeyFact;
      'case-study.outcome-card': CaseStudyOutcomeCard;
      'case-study.project-summary-section': CaseStudyProjectSummarySection;
      'case-study.stat': CaseStudyStat;
      'case-study.tag-item': CaseStudyTagItem;
      'contact.phone-item': ContactPhoneItem;
      'home.certification': HomeCertification;
      'home.client-logo': HomeClientLogo;
      'home.stat': HomeStat;
      'hub.capability-card': HubCapabilityCard;
      'hub.checklist': HubChecklist;
      'hub.comparison-matrix': HubComparisonMatrix;
      'hub.comparison-row': HubComparisonRow;
      'hub.final-cta': HubFinalCta;
      'hub.how-to-choose': HubHowToChoose;
      'hub.info-block': HubInfoBlock;
      'hub.link-item': HubLinkItem;
      'hub.other-model-item': HubOtherModelItem;
      'hub.other-models': HubOtherModels;
      'hub.portfolio-item': HubPortfolioItem;
      'hub.process-flow': HubProcessFlow;
      'hub.proof-block': HubProofBlock;
      'hub.saas-product': HubSaasProduct;
      'hub.solution-model': HubSolutionModel;
      'hub.solution-portfolio': HubSolutionPortfolio;
      'hub.step-item': HubStepItem;
      'hub.string-item': HubStringItem;
      'hub.title-description': HubTitleDescription;
      'shared.seo': SharedSeo;
    }
  }
}
