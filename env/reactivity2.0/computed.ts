import { iObservable, iSubscribe } from "../types";
import { Observable } from "../helpers/observable";
import { listObserver } from "./types";
import { Collector } from "../helpers/Collector";

export function computed<T>(depends: iObservable<T> | iObservable<T>[] | listObserver<T> | listObserver<T>[], expression: () => any): {observer: iObservable<any>, subscribe: iSubscribe} {
    const computedObsc = new Observable(expression());
    const collector = new Collector();

    async function updateComputedValue() {
        const result = await expression();
        computedObsc.next(result);
    }

    if (!Array.isArray(depends)) {
        collector.collect(
            depends.subscribe(updateComputedValue)
        );
    } else {
        depends.forEach((depend) => {
            collector.collect(
                depend.subscribe(updateComputedValue)
            );
        });
    }
    return {
        observer: computedObsc, subscribe: {
            unsubscribe: () => {
                collector.clear();
            }
        }
    };
}