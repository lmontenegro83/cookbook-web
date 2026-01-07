/**
 * Utility functions for text processing and display
 * 
 * Design Philosophy: Modern Culinary Minimalism
 * - Clarity: Ensure all text is properly decoded and displayed
 * - Precision: Handle edge cases and special characters correctly
 */

/**
 * Decode HTML entities in text
 * @param text - Text containing HTML entities
 * @returns Decoded text
 */
export function decodeHtmlEntities(text: string): string {
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

/**
 * Truncate text to a maximum length with ellipsis
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Clean HTML tags from text
 * @param html - HTML string
 * @returns Plain text without HTML tags
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}
