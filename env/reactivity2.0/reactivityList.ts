import { iObservable, iSubscribe } from "../types";
import { Observable } from "../helpers/observable";
import { LIST_COMMAND, listMessage, listObserver } from "./types";

export class ReactiveList<T> implements listObserver<T> {
    private listeners: ((eventData: listMessage<T>) => void)[];
    private value: iObservable<T>[];

    constructor(startValue: T[] = []) {
        this.value = startValue.map((item) => this.wrap(item));
        this.listeners = [];
    }

    subscribe(callback: (eventData?: listMessage<T>) => void): iSubscribe {
        this.listeners.push(callback);

        return {
            unsubscribe: (): void => {
                this.listeners = this.listeners.filter(listener => listener !== callback);
            }
        };
    }

    private next(eventData?: listMessage<T>): void {
        this.listeners.forEach(listener => {
            listener(eventData);
        });
    }

    insert(index: number, element: T) {
        const wrapElement = this.wrap(element);
        this.value.splice(index, 0, wrapElement);
        this.next({ command: LIST_COMMAND.INSERT, payload: { index: index, element: wrapElement } });
    }

    push(element: T) {
        const wrapElement = this.wrap(element);
        this.value.push(wrapElement);
        this.next({ command: LIST_COMMAND.PUSH, payload: { element: wrapElement } });
    }

    delete(index: number) {
        this.value.splice(index, 1);
        this.next({ command: LIST_COMMAND.DELETE, payload: { index } });
    }

    change(index: number, data: T) {
        this.value[index].next(data);
    }

    set(elements: T[]) {
        const wrapElements = elements.map((item) => this.wrap(item));
        this.value = wrapElements;
        this.next({ command: LIST_COMMAND.SET, payload: { elements: wrapElements } });
    }

    getValue() {
        return this.value;
    }

    unsubscribeAll(): void {
        this.listeners = [];
    }

    private wrap(value: any) {
        if (value instanceof Observable) return value;

        // if (Array.isArray(value)) {
        //     value.forEach((item) => this.wrap(item));
        // } else if (typeof value === "object" && value !== null) {
        //     for (const key in value) {
        //         value[key] = this.wrap(value[key]);
        //     }
        // }
        return new Observable(value);
    }
}
