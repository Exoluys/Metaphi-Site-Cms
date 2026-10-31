declare const strapi: any;

const FIXED_SAAS_NAMES: Record<string, string> = {
  stockiphi: 'Stockiphi',
  taskiphi: 'Taskiphi',
};

function enforceFixedSaasNames(data: any, where?: any) {
  if (!data) return;

  const slug = data.slug || where?.slug;
  if (slug && FIXED_SAAS_NAMES[slug]) {
    data.title = FIXED_SAAS_NAMES[slug];
  }
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    enforceFixedSaasNames(data);
  },

  async beforeUpdate(event: any) {
    const { data, where } = event.params;
    enforceFixedSaasNames(data, where);
  },
};
