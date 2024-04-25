import { iReactiveUserInfo, iObservable, iReactiveMessage, message } from "../../../../env/types";
import { ReactiveUserInfo } from "./ReactiveUserInfo";
import { Observable } from "../../../../env/helpers/observable";
import { Collector } from "../../../../env/helpers/Collector";

export class ReactiveMessage implements iReactiveMessage {
    private collector = new Collector();
    private msg: message;
    from: iReactiveUserInfo;
    to: string;
    text: iObservable<string>;
    timestamp: string;
    photo: iObservable<string>

    constructor(msg: message) {
        this.msg = msg;
        this.init();
    }

    private init() {
        this.setupRef();
        this.setupRefUpdate();
    }

    private setupRef() {
        this.from = new ReactiveUserInfo(this.msg.from);
        this.to = this.msg.to;
        this.text = new Observable(this.msg.text);
        this.timestamp = this.msg.timestamp;
        this.photo = new Observable(this.msg.photo)
    }

    private setupRefUpdate() {
        this.setupMessageUpdate();
    }

    private setupMessageUpdate() {

    }

    destroy() {
        this.collector.clear();
        this.from.destroy()
    }
}