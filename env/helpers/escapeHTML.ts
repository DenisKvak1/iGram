export function escapeHtml(str: string) {
    return str.replace(/<[^>]*>/g, '');
}
