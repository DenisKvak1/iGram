import { iObservable, iSubscribe } from "../types";

export type listObserver<T> = {
    subscribe(callback: (eventData: listMessage<T>) => void): iSubscribe;
    set(elements: T[]): void
    push(element: T): void
    insert(index: number, element: T): void
    delete(index: number): void
    change(index: number, data: T): void
    unsubscribeAll(): void
    getValue(): iObservable<T>[]
}
export type listMessage<T> = {
    command: LIST_COMMAND
    payload: {
        index?: number
        element?: iObservable<T>
        elements?: iObservable<T>[]
    }
}
export const enum LIST_COMMAND {
    INSERT = "INSERT",
    PUSH = "PUSH",
    DELETE = "DELETE",
    SET = "SET"
}


