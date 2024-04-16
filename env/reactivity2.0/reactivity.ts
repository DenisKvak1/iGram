import { iObservable } from "../types";

export function reactivity(observer: iObservable<string>, element: HTMLElement) {
    let previousValue = observer.getValue();
    element.textContent = observer.getValue();

    const subsc = observer.subscribe((value) => {
        if (value === previousValue) return;

        previousValue = value;
        element.textContent = value;
    });
    return subsc;
}