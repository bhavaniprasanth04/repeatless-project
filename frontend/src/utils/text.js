/**
 * Utility function to clean email content by decoding common HTML entities.
 * @param {string} text - The input email body, snippet, or summary.
 * @returns {string} The cleaned text.
 */
export function cleanEmailContent(text) {
  if (!text) return '';
  return text
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&ldquo;/g, '"')
    .replace(/&rdquo;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/&#96;/g, "`")
    .replace(/&bull;/g, "•");
}
