import { iObservable } from "../types";

export function reactivityAttribute(observer: iObservable<string>, element: HTMLElement, attribute:string) {
    element.setAttribute(attribute, observer.getValue())
    const subsc = observer.subscribe((value) => {
        if(attribute === 'src') value = `${value}?timestamp=${new Date().getTime()}`
        element.setAttribute(attribute, value)
    });
    return subsc
}