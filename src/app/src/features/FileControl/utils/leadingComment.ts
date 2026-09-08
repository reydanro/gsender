const MAX_SCAN_CHARS = 4000;
const MAX_SCAN_LINES = 20;

/**
 * Returns the text of any comment lines (';' or '(...)' style) found at the
 * very start of a G-code file, before the first actual command line.
 * Only scans a bounded prefix of the content so large files stay cheap.
 */
export function extractLeadingComment(content: string): string {
    if (!content) {
        return '';
    }

    const lines = content.slice(0, MAX_SCAN_CHARS).split(/\r?\n/, MAX_SCAN_LINES);
    const commentLines: string[] = [];

    for (const rawLine of lines) {
        const line = rawLine.trim();

        if (line === '') {
            continue;
        }

        const semicolonMatch = line.match(/^;\s*(.*)$/);
        if (semicolonMatch) {
            commentLines.push(semicolonMatch[1].trim());
            continue;
        }

        const parenMatch = line.match(/^\((.*)\)$/);
        if (parenMatch) {
            commentLines.push(parenMatch[1].trim());
            continue;
        }

        // first non-comment, non-empty line: stop scanning
        break;
    }

    return commentLines.filter(Boolean).join(' ');
}
