import { iObservable } from "../types";
import { listObserver } from "./types";

export function conditionalRendering(obs: iObservable<any> | listObserver<any>, conditional: () => boolean, element: HTMLElement, container: HTMLElement, position: string = "beforeend") {
    if (conditional()) {
        container.insertAdjacentElement(position as any, element);
    }

    function check() {
        if (conditional()) {
            container.insertAdjacentElement(position as any, element);
        } else {
            element.remove();
        }
    }

    const subsc = obs.subscribe(check);
    return {
        unsubscribe: () => {
            subsc.unsubscribe();
        }
    };
}