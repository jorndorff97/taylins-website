const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
};

const ENTITY_REGEX = /[&<>"']/g;

/**
 * Strips HTML tags and encodes dangerous characters from user input.
 * Use on text that will be stored in the database.
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .replace(ENTITY_REGEX, (char) => HTML_ENTITIES[char] || char)
    .trim();
}

/**
 * Sanitizes input but preserves basic length — trims to maxLength.
 */
export function sanitizeField(
  input: string | null | undefined,
  maxLength = 1000
): string | null {
  if (!input) return null;
  const cleaned = sanitizeText(input);
  return cleaned.slice(0, maxLength) || null;
}

/**
 * Sanitizes a message body (conversation/order messages).
 * Allows longer text but strips HTML.
 */
export function sanitizeMessage(input: string, maxLength = 5000): string {
  return sanitizeText(input).slice(0, maxLength);
}
