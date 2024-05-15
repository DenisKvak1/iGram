import { iComponent, iObservable, iReactiveChatInfo } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { chatElementT } from "./template";
import { reactivityAttribute } from "../../../../../env/reactivity2.0/reactivityAttribute";
import { reactivity, reactivityHTML } from "../../../../../env/reactivity2.0/reactivity";
import { computed } from "../../../../../env/reactivity2.0/computed";
import { chatManager } from "../../services/ChatService";
import { Collector } from "../../../../../env/helpers/Collector";
import { inputMessageParser } from "../../services/InputMessageParser";

export class ChatShortcutBlock implements iComponent {
    private chat: iObservable<iReactiveChatInfo>;
    private chatBlock: HTMLElement;
    private avatar: HTMLImageElement;
    private chatName: HTMLElement;
    private lastMessageBlock: HTMLElement;
    private collector = new Collector();

    constructor(chat: iObservable<iReactiveChatInfo>) {
        this.chat = chat;

        this.init();
    }

    init() {
        this.initHTML();
        this.initHTMLContent();
        this.setupSelectChatEvent();
    }

    private initHTML() {
        this.chatBlock = createElementFromHTML(chatElementT);
        this.avatar = this.chatBlock.querySelector(".chatPhotoInList") as HTMLImageElement;
        this.chatName = this.chatBlock.querySelector(".chat_name") as HTMLElement;
        this.lastMessageBlock = this.chatBlock.querySelector(".last_message");
    }

    private initHTMLContent() {
        const { observer: lastMessage, subscribe: computedSubscribe } = computed(this.chat.getValue().history, () => {
            const lastMessageIndex = this.chat.getValue().history.getValue().length - 1;
            const historyMessage = this.chat.getValue().history.getValue();
            const text = historyMessage[lastMessageIndex]?.getValue().text.getValue();

            return inputMessageParser.parseMessage(text || "");
        });

        this.collector.collect(
            computedSubscribe,
            reactivityAttribute(this.chat.getValue().photo, this.avatar, "src"),
            reactivity(this.chat.getValue().chatName, this.chatName),
            reactivityHTML(lastMessage, this.lastMessageBlock)
        );
    }

    private setupSelectChatEvent() {
        this.chatBlock.onclick = () => {
            chatManager.selectChat$.next(this.chat.getValue().id);
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set("chatID", this.chat.getValue().id);
            window.history.pushState({}, document.title, currentUrl.toString());
        };
    }

    getComponent(): HTMLElement {
        return this.chatBlock;
    }


    destroy(): void {
        this.collector.clear();
        this.chatBlock.remove();
    }
}

