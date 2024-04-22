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

export function reactivityHTML(observer: iObservable<string>, element: HTMLElement) {
    let previousValue = observer.getValue();
    element.innerHTML = observer.getValue();

    const subsc = observer.subscribe((value) => {
        if (value === previousValue) return;

        previousValue = value;
        element.innerHTML = value;
    });
    return subsc;
}