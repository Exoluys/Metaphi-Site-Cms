declare const strapi: any;

const LOCKED_OTHER_MODEL_TITLES = [
  'Need substantial tailoring?',
  'Building something strategically unique?',
];

function enforceLockedTitles(data: any) {
  if (!data) return;

  if (data.otherModels && Array.isArray(data.otherModels.items)) {
    data.otherModels.items.forEach((item: any, idx: number) => {
      if (item && LOCKED_OTHER_MODEL_TITLES[idx]) {
        item.title = LOCKED_OTHER_MODEL_TITLES[idx];
      }
    });
  }
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    enforceLockedTitles(data);
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;
    enforceLockedTitles(data);
  },
};
