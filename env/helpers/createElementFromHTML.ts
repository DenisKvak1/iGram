export function createElementFromHTML(htmlString: string): HTMLElement {
    const template = document.createElement("template");
    template.innerHTML = htmlString.trim();
    const result = template.content.firstChild;
    return result as HTMLElement;
}

export function createTemplateFromHTML(htmlString: string) {
  const template = document.createElement("template");
  template.innerHTML = htmlString.trim();
  return template
}
