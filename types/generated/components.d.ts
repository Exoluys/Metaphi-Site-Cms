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
      'shared.section': SharedSection;
    }
  }
}
