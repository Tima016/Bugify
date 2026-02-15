import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [
            'p', 'br', 'strong', 'em', 'u', 's', 'a', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote', 'code', 'pre',
        ],
        ALLOWED_ATTR: ['href', 'target', 'rel'],
        ALLOW_DATA_ATTR: false,
    });
}

/**
 * Sanitize plain text (strip all HTML)
 */
export function sanitizeText(dirty: string): string {
    return DOMPurify.sanitize(dirty, {
        ALLOWED_TAGS: [],
        ALLOWED_ATTR: [],
    });
}

/**
 * Sanitize user input for safe display
 */
type SanitizedInput = string | number | boolean | null | undefined | SanitizedInput[] | { [key: string]: SanitizedInput };

export function sanitizeUserInput(input: unknown): SanitizedInput {
    if (typeof input === 'string') {
        return sanitizeText(input);
    }

    if (Array.isArray(input)) {
        return input.map(sanitizeUserInput);
    }

    if (typeof input === 'object' && input !== null) {
        const sanitized: { [key: string]: SanitizedInput } = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const key in input as any) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            sanitized[key] = sanitizeUserInput((input as any)[key]);
        }
        return sanitized;
    }

    return input as SanitizedInput;
}
