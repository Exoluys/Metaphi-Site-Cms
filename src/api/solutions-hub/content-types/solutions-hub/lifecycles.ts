declare const strapi: any;

const LOCKED_MODEL_TITLES = {
  customModel: 'Custom Solutions',
  readyModel: 'Ready-to-Configure Solutions',
  saasModel: 'SaaS Products',
};

const LOCKED_HOW_TO_CHOOSE_TITLES = {
  customRuleTitle: 'Choose Custom',
  readyRuleTitle: 'Choose Ready-to-Configure',
  saasRuleTitle: 'Choose SaaS',
};

function enforceLockedTitles(data: any) {
  if (!data) return;

  // 1. Solution model titles
  if (data.customModel) {
    data.customModel.title = LOCKED_MODEL_TITLES.customModel;
  }
  if (data.readyModel) {
    data.readyModel.title = LOCKED_MODEL_TITLES.readyModel;
  }
  if (data.saasModel) {
    data.saasModel.title = LOCKED_MODEL_TITLES.saasModel;
  }

  // 2. How to choose titles
  if (data.howToChoose) {
    data.howToChoose.customRuleTitle = LOCKED_HOW_TO_CHOOSE_TITLES.customRuleTitle;
    data.howToChoose.readyRuleTitle = LOCKED_HOW_TO_CHOOSE_TITLES.readyRuleTitle;
    data.howToChoose.saasRuleTitle = LOCKED_HOW_TO_CHOOSE_TITLES.saasRuleTitle;
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
