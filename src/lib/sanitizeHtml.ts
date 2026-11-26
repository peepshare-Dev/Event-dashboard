import DOMPurify from 'dompurify';

// Allowlist for rich text written with the editor's basic toolbar (bold, lists, links).
// Anything else — scripts, styles, images, event handlers, `javascript:` links — is dropped.
const CONFIG = {
  ALLOWED_TAGS: ['p', 'div', 'br', 'b', 'strong', 'i', 'em', 'u', 'ul', 'ol', 'li', 'a'],
  ALLOWED_ATTR: ['href'],
  ALLOWED_URI_REGEXP: /^(?:https?:|mailto:)/i,
};

DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'A') {
    node.setAttribute('target', '_blank');
    node.setAttribute('rel', 'noopener noreferrer');
  }
});

/** Use on every render of stored HTML, and before saving it. */
export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, CONFIG);
}

/** Visible text only, e.g. to check that rich text isn't empty. */
export function htmlToText(html: string): string {
  return DOMPurify.sanitize(html, { ALLOWED_TAGS: [] }).replace(/&nbsp;/g, ' ').trim();
}
