import { iChat, iObservable, iReactiveChatInfo, iReactiveMessage, UserInfo } from "../../../../env/types";
import { chatManager } from "./ChatService";
import { Observable } from "../../../../env/helpers/observable";
import { listObserver } from "../../../../env/reactivity2.0/types";
import { ReactiveList } from "../../../../env/reactivity2.0/reactivityList";
import { Collector } from "../../../../env/helpers/Collector";
import { ReactiveMessage } from "./ReactiveMessage";

export class ReactiveChatData implements iReactiveChatInfo {
    private collector = new Collector();
    id: string;
    chatName: iObservable<string>;
    members: listObserver<UserInfo>;
    history: listObserver<iReactiveMessage>;
    photo: iObservable<string>;

    constructor(chat: iChat) {
        this.init(chat);
    }

    private init(chat: iChat) {
        this.initObserver(chat);
        this.initEventChanges();
    }

    private initObserver(chat: iChat) {
        this.id = chat.id;
        this.chatName = new Observable(chat.chatName);
        this.members = new ReactiveList(chat.members);
        this.photo = new Observable(chat.photo);
        this.history = new ReactiveList(chat.history.map((msg) => new ReactiveMessage(msg)));
    }

    private initEventChanges() {
        this.setupPhotoChangeEvent();
        this.setupMessagePushEvent();
        this.setupAddMembersEvent();
        this.setupRemoveMembersEvent();
    }


    private setupPhotoChangeEvent() {
        this.collector.collect(
            chatManager.setPhoto$.subscribe((url) => {
                if (url.chatID !== this.id) return;

                this.photo.next(url.photo);
            })
        );
    }

    private setupMessagePushEvent() {
        this.collector.collect(
            chatManager.message$.subscribe((msg) => {
                if (msg.to !== this.id) return;

                const reactiveMsg = new ReactiveMessage(msg);
                this.history.push(reactiveMsg);
            })
        );
    }

    private setupAddMembersEvent() {
        this.collector.collect(
            chatManager.addMember$.subscribe((data) => {
                this.members.push(data.user);
            })
        );
    }

    private setupRemoveMembersEvent() {
        this.collector.collect(
            chatManager.leaveChat$.subscribe((data) => {
                const index = this.members.getValue().findIndex((user) => user.getValue().email === data.user.email);
                this.members.delete(index);
            })
        );
    }

    destroy() {
        this.collector.clear();
    }
}