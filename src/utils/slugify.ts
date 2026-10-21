/**
 * Shared slugify utility for Strapi CMS
 */
export function generateSlug(text: string): string {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, "-and-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ensureUniqueSlug(
  baseSlug: string,
  existingSlugs: string[] | Set<string>,
  currentSlug?: string
): string {
  const cleanBase = generateSlug(baseSlug);
  if (!cleanBase) return "item";

  const slugSet = existingSlugs instanceof Set ? existingSlugs : new Set(existingSlugs);

  if (currentSlug && currentSlug === cleanBase) {
    return cleanBase;
  }

  if (!slugSet.has(cleanBase)) {
    return cleanBase;
  }

  let counter = 2;
  while (slugSet.has(`${cleanBase}-${counter}`)) {
    if (currentSlug && currentSlug === `${cleanBase}-${counter}`) {
      return `${cleanBase}-${counter}`;
    }
    counter++;
  }

  return `${cleanBase}-${counter}`;
}
