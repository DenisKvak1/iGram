import { iObservable } from "../types";

export class Observable<T> implements iObservable<T> {
  private listeners: ((eventData: any) => void)[];
  private onceListeners: ((eventData: any) => void)[];
  private value: T;

  constructor(startValue?:T) {
    this.value = startValue
    this.listeners = [];
    this.onceListeners = []
  }

  subscribe(callback: (eventData?: T) => void): { unsubscribe: () => void } {
    this.listeners.push(callback);

    return {
      unsubscribe: (): void => {
        this.listeners = this.listeners.filter(listener => listener !== callback);
      }
    };
  }

  next(eventData?: T): void {
    this.value = eventData;
    this.listeners.forEach(listener => {
      listener(eventData);
    });
    this.onceListeners.forEach(listener => {
      listener(eventData);
    })
    this.onceListeners = []
  }
  once(callback: (eventData?: T) => void): void {
    this.onceListeners.push(callback)
  }
  getValue() {
    return this.value;
  }
  setValue(value:T) {
    this.value = value
  }
  unsubscribeAll(): void {
    this.listeners = [];
  }
}
