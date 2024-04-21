import { iComponent, iObservable, iReactiveMessage } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { messageFromT, messageMeT } from "../chatBlock/template";

import { formatDateStringToMessage } from "../../../../../env/helpers/formatTime";
import { reactivity } from "../../../../../env/reactivity2.0/reactivity";
import { reactivityAttribute } from "../../../../../env/reactivity2.0/reactivityAttribute";
import { Collector } from "../../../../../env/helpers/Collector";

export class MessageBlock implements iComponent {
    private message: iObservable<iReactiveMessage>;
    private messageBlock: HTMLElement;
    private photo: HTMLImageElement;
    private nameBlock: HTMLElement;
    private messageDate: HTMLElement;
    private messageText: HTMLElement;
    private collector = new Collector();

    constructor(msg: iObservable<iReactiveMessage>) {
        this.message = msg;

        this.init();
    }

    private init() {
        this.initHTML();
        this.setupHTMLUpdate();
    }

    private initHTML() {
        if (this.checkMeMessage()) {
            this.messageBlock = createElementFromHTML(messageMeT);
        } else {
            this.messageBlock = createElementFromHTML(messageFromT);
        }
        this.photo = this.messageBlock.querySelector(".userPhoto") as HTMLImageElement;
        this.nameBlock = this.messageBlock.querySelector(".message_name");
        this.messageDate = this.messageBlock.querySelector(".message_date");
        this.messageText = this.messageBlock.querySelector(".message_text");
    }

    private setupHTMLUpdate() {
        const messageValue = this.message.getValue();
        const { text, from } = messageValue;
        const { photo, name } = from;

        this.collector.collect(
            reactivity(text, this.messageText),
            reactivity(name, this.nameBlock)
        );
        if (!this.checkMeMessage()) this.collector.collect(reactivityAttribute(photo, this.photo, "src"));

        this.messageDate.textContent = formatDateStringToMessage(this.message.getValue().timestamp);
    }

    private checkMeMessage() {
        const emailFromLocalStorage = localStorage.getItem("email").toUpperCase();
        const messageEmail = this.message.getValue().from.email.getValue().toUpperCase();

        return messageEmail === emailFromLocalStorage;
    }

    getComponent() {
        return this.messageBlock;
    }

    destroy() {
        this.collector.clear();
        this.messageBlock.remove();
    }
}