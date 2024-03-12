export function createElement(tag: string, classList: Array<string> = []): HTMLElement {
  let element: HTMLElement = document.createElement(tag);

  if (Array.isArray(classList)) {
    for (let index = 0; index < classList.length; index++) {
      const item = classList[index];
      element.classList.add(item);
    }
  }

  return element;
}

export function createElementSvg(tag: string, classList: Array<string> = []): SVGElement {
  let element: SVGElement = document.createElementNS("http://www.w3.org/2000/svg", tag);

  if (Array.isArray(classList)) {
    for (let index = 0; index < classList.length; index++) {
      const item = classList[index];
      element.classList.add(item);
    }
  }

  return element;
}