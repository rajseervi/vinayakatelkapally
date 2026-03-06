// Centralized validation utilities

export const PRODUCT_NAME_REGEX = /^[A-Za-z0-9\s/._-]+$/;

export function validateProductName(name: string): string | null {
  const trimmed = (name ?? '').trim();
  if (!trimmed) return 'Product name is required';
  // Removed space restriction as product names should allow spaces
  if (!PRODUCT_NAME_REGEX.test(trimmed)) return 'Only letters, numbers, spaces, underscore (_), hyphen (-), dot (.) and slash (/) allowed.';
  if (trimmed.length < 2 || trimmed.length > 100) return 'Length must be 2–100 characters.';
  return null;
}

export function normalizeSlug(input: string): string {
  return (input || '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^A-Za-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$|_/g, (m) => (m === '_' ? '_' : ''))
    .toLowerCase();
}