import { ChatUserInfo, fromChat, iComponent, iReactiveChatInfo } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { chatListT } from "./template";
import "./style.css";
import { sortChatsByNewest } from "../../../../../env/helpers/sortChat";
import { chatManager } from "../../services/ChatService";
import { ChatShortcutBlock } from "../ChatShortcutBlock/ChatShortcutBlock";
import { listObserver } from "../../../../../env/reactivity2.0/types";
import { ReactiveList } from "../../../../../env/reactivity2.0/reactivityList";
import { registerReactivityList } from "../../../../../env/reactivity2.0/registerReactivityList";
import { Collector } from "../../../../../env/helpers/Collector";

export class ChatShortcutList implements iComponent {
    private chatListContainer: HTMLElement;
    private readonly list: listObserver<iReactiveChatInfo>;
    private readonly collector = new Collector();

    constructor() {
        this.list = new ReactiveList([]);

        this.init();
    }

    private init() {
        this.initHTML();
        this.initHTMLContent();
        this.setupSubscribeOnEvents();
    }

    private initHTML() {
        this.chatListContainer = createElementFromHTML(chatListT);
    }

    private initHTMLContent() {
        chatManager.getReactiveChats().then((chats) => {
            this.list.set(sortChatsByNewest(chats));
        });
        this.collector.collect(
            registerReactivityList(ChatShortcutBlock, this.chatListContainer, this.list)
        );
    }

    private setupSubscribeOnEvents() {
        this.collector.collect(
            chatManager.message$.subscribe(() => this.newMessageHandler()),
            chatManager.leaveChat$.subscribe((data) => this.leaveChatHandler(data)),
            chatManager.chatCreated$.subscribe((data) => this.chatCreateHandler(data)),
            chatManager.addMember$.subscribe((data) => this.addMemberHandler(data))
        );
    }

    private chatCreateHandler(data: fromChat) {
        this.list.push(data.chat);
    }

    private newMessageHandler() {
        setTimeout(() => {
            const reactiveChats = this.list.getValue().map((item) => item.getValue());
            const sortedChat = sortChatsByNewest(reactiveChats);
            this.list.set(sortedChat);
        });
    }

    private leaveChatHandler(data: ChatUserInfo) {
        const selectChat = chatManager.selectChat$.getValue();
        const emailFromLocalStorage = localStorage.getItem("email");
        if (selectChat !== data.chatID || emailFromLocalStorage !== data.user.email.getValue()) return;

        const index = this.list.getValue().findIndex(item => item.getValue().id === data.chatID);
        this.list.delete(index);
        chatManager.selectChat$.next(null);
    }

    private addMemberHandler(data: ChatUserInfo) {
        const emailFromLocalStorage = localStorage.getItem("email");
        if (emailFromLocalStorage !== data.user.email.getValue()) return;

        chatManager.getReactiveChat(data.chatID).then((chat) => {
            this.list.push(chat);
        });
    }

    getComponent() {
        return this.chatListContainer;
    }

    destroy() {
        this.collector.clear();
        this.chatListContainer.remove();
    }
}