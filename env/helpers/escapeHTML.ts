export function escapeHtml(str: string) {
    return str.replace(/[&<>"']/g, function(m) {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            "\"": "&quot;",
            "'": "&#039;"
        }[m];
    });
}