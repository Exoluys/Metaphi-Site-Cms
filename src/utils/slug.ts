/**
 * Simple, robust slugifier utility for generating clean slugs from titles.
 */
export function slugify(text: string): string {
  if (!text) return '';
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/&/g, ' and ')
    .replace(/[\s\W-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
