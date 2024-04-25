import { LIST_COMMAND, listObserver } from "./types";
import { iComponent, iObservable } from "../types";

export function registerReactivityList<T>(Component: any, container: HTMLElement, list: listObserver<T>, callback?: (component: iComponent) => void) {
    let elements: any = [];

    function createElement(item: iObservable<T>) {
        const component = new Component(item);
        elements.push(component);
        if (callback) callback(component);
        const element = component.getComponent();
        return element;
    }

    render(list.getValue());

    function render(list: iObservable<T>[]) {
        elements.forEach((element: any) => {
            element.destroy();
        });
        elements = [];
        list.forEach((item) => {
            const element = createElement(item);
            container.appendChild(element);
        });
    }


    const subsc = list.subscribe((variable) => {
        if (variable.command === LIST_COMMAND.SET) {
            render(variable.payload.elements);
        } else if (variable.command === LIST_COMMAND.PUSH) {
            const element = createElement(variable.payload.element);
            container.appendChild(element);
        } else if (variable.command === LIST_COMMAND.INSERT) {
            const component = new Component(variable.payload.element);
            elements.splice(variable.payload.index - 1, 0, component);
            if (callback) callback(component);
            const element = component.getComponent();
            container.children[variable.payload.index].insertAdjacentElement("beforebegin", element);
        } else if (variable.command === LIST_COMMAND.DELETE) {
            elements[variable.payload.index].destroy();
            elements.splice(variable.payload.index, 1);
        }
    });
    return {
        unsubscribe: () => {
            subsc.unsubscribe();
            elements.forEach((element: any) => {
                element.destroy();
            });
        }
    };
}
