export { RichTextEditor } from './rich-text-editor';

/**
 * Collapse rich text, HTML, or markdown into a plain-text snippet for compact
 * previews like Kanban cards. Falls back gracefully for legacy plain-text values.
 * Runs on the client (uses the DOM when available) with a regex fallback.
 */
export function htmlToPlainText(html: string | null | undefined): string {
    return richTextToPlainText(html);
}

export function richTextToPlainText(content: string | null | undefined): string {
    if (!content) return '';

    // Legacy content stored plain text (no tags, no markdown) — return as-is.
    if (!/<[a-z][\s\S]*>/i.test(content) && !/[#*_>`\[\]!\-]/.test(content)) {
        return content.trim();
    }

    if (/<[a-z][\s\S]*>/i.test(content) && typeof document !== 'undefined') {
        const container = document.createElement('div');
        container.innerHTML = content;
        return (container.textContent || '').replace(/\s+/g, ' ').trim();
    }

    // Markdown fallback (also the primary path for markdown-stored content,
    // since notes/tasks now save as markdown rather than HTML): strip syntax
    // and any remaining tags, then decode a few common entities.
    return content
        .replace(/ ?%%size=\d+x\d*%%/g, '') // hidden image-resize suffix (see resizable-image.ts)
        .replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, '') // table separator rows, e.g. | --- | --- |
        .replace(/^#{1,6}\s+/gm, '')
        .replace(/^>\s?/gm, '')
        .replace(/^[-*+]\s+\[[ xX]\]\s+/gm, '') // task list checkboxes, e.g. "- [x] "
        .replace(/^[-*+]\s+/gm, '')
        .replace(/^\d+\.\s+/gm, '')
        .replace(/^(?:-{3,}|\*{3,}|_{3,})$/gm, '') // horizontal rules
        .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
        .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/\|/g, ' ') // remaining table cell separators
        .replace(/<[^>]+>/g, ' ')
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/\s+/g, ' ')
        .trim();
}
