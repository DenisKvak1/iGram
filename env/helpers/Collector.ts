import { iCollector, iSubscribe } from "../types";

export class Collector implements iCollector {
    eventSubscribeList: iSubscribe[];

    constructor() {
        this.eventSubscribeList = [];
    }

    collect(...collectible: iSubscribe[]): void {
        this.eventSubscribeList.push(...collectible);
    }

    clear(): void {
        this.eventSubscribeList.forEach((subscribe) => subscribe.unsubscribe());
    }
}