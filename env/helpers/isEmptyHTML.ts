export function isHTMLEmpty(HTML:string) {
    const htmlContent = HTML.replace(/&nbsp;/g, '');
    return htmlContent === '';
}
