import { errors } from '@strapi/utils';

export function validateTransformationThemes(transformationThemes: any) {
  if (transformationThemes === undefined || transformationThemes === null) return;

  const items = transformationThemes.items;
  if (items !== undefined) {
    if (!Array.isArray(items) || items.length < 3) {
      const count = Array.isArray(items) ? items.length : typeof items;
      throw new errors.ValidationError(
        `transformationThemes.items must contain at least 3 items. Received ${count}.`
      );
    }

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!item || !item.text || typeof item.text !== 'string' || !item.text.trim()) {
        throw new errors.ValidationError(
          `transformationThemes.items[${i}].text is required and cannot be empty.`
        );
      }
    }
  }
}

export default {
  async beforeCreate(event: any) {
    const { data } = event.params;
    if (data?.transformationThemes) {
      validateTransformationThemes(data.transformationThemes);
    }
  },

  async beforeUpdate(event: any) {
    const { data } = event.params;
    if (data?.transformationThemes) {
      validateTransformationThemes(data.transformationThemes);
    }
  },
};

