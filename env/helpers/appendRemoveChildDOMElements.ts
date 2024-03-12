
export function appendChild(container: Element, element: Element): void | string {
  if (!container) return "Контейнер не валиден";
  if (!element) return "Элемент не валиден";
  container.appendChild(element);
}

export function removeChild(container: Element, element: Element): void | string {
  if (!container) return "Контейнер не валиден";
  if (!element) return "Элемент не валиден";
  container.removeChild(element);
}