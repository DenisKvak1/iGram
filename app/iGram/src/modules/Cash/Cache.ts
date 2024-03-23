import { iCache } from "../../../../../env/types";

export class Cache<T> implements iCache<T>{
    data: T;
    time: number;
    startTime: number;
    currentTime: number;
    callback: Function;

    constructor(time: number, callback: Function) {
        this.time = time;
        this.startTime = new Date().getTime();
        this.callback = callback;
    }

    async getData() {
        this.currentTime = new Date().getTime();
        if (this.currentTime - this.startTime < this.time && this.data) {
            return this.data ? JSON.parse(JSON.stringify(this.data)) : null;
        } else {
            this.startTime = this.currentTime;
            this.setData(await this.callback())
            return this.data ? JSON.parse(JSON.stringify(this.data)) : null;
        }
    }

    setData(data: T) {
        this.data = data
    }

    resetCache() {
        this.startTime = 0;
    }
}
