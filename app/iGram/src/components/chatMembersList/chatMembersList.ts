import { ChatUserInfo, iComponent, iObservable, iReactiveUserInfo } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { containerMembersList } from "./template";
import "./style.css";
import { Observable } from "../../../../../env/helpers/observable";
import { chatManager } from "../../services/ChatService";
import { listObserver } from "../../../../../env/reactivity2.0/types";
import { ReactiveList } from "../../../../../env/reactivity2.0/reactivityList";
import { registerReactivityList } from "../../../../../env/reactivity2.0/registerReactivityList";
import { ChatMemberBlock } from "../chatMemberBlock/chatMemberBlock";
import { Collector } from "../../../../../env/helpers/Collector";

export class ChatMembersList implements iComponent {
    private containerMembersList: HTMLElement;
    private membersListBlock: HTMLElement;
    private backArrow: HTMLElement;
    private list: listObserver<iReactiveUserInfo>;
    private collector = new Collector();
    toChat$: iObservable<null>;

    constructor() {
        this.list = new ReactiveList([]);
        this.toChat$ = new Observable();

        this.init();
    }

    private init() {
        this.initHTML();
        this.setupHTMLContent();
        this.setupEvents();
    }

    private initHTML() {
        this.containerMembersList = createElementFromHTML(containerMembersList);
        this.membersListBlock = this.containerMembersList.querySelector(".membersListBlock");
        this.backArrow = this.containerMembersList.querySelector(".toChat") as HTMLButtonElement;
    }

    private setupEvents() {
        this.backArrow.onclick = () => this.clickBackArrowHandler();
        this.collector.collect(
            chatManager.addMember$.subscribe((data) => this.addMemberHandler(data)),
            chatManager.leaveChat$.subscribe((data) => this.leaveChatHandler(data)),
            chatManager.selectChat$.subscribe((chatID) => this.selectChatHandler(chatID))
        );
    }

    private setupHTMLContent() {
        this.collector.collect(
            registerReactivityList(ChatMemberBlock, this.membersListBlock, this.list)
        );
    }

    private addMemberHandler(data: ChatUserInfo) {
        this.list.push(data.user);
    }

    private leaveChatHandler(data: ChatUserInfo) {
        let list = this.list.getValue();
        list = list.filter((item) => item.getValue().email.getValue() !== data.user.email.getValue());
        const formatList = list.map((item) => item.getValue());
        this.list.set(formatList);
    }

    private selectChatHandler(chatID: string) {
        chatManager.getReactiveChat(chatID).then((chat) => {
            if (!chat) return;
            const formatMembers = chat.members.getValue().map((item) => item.getValue());
            this.list.set(formatMembers);
        });
    }

    private clickBackArrowHandler() {
        this.toChat$.next();
    }

    getComponent() {
        return this.containerMembersList;
    }

    destroy() {
        this.collector.clear();
        this.containerMembersList.remove();
    }
}