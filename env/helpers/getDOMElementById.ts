export function getElementById(id: string): HTMLElement | string {
  let element: HTMLElement = document.getElementById(id);
  if (!element) return "Элемент не найден";
  return element;
}