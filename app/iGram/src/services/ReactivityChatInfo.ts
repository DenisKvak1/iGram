import {
    iChat,
    iObservable,
    iReactiveChatInfo,
    iReactiveMessage,
    iReactiveUserInfo
} from "../../../../env/types";
import { chatManager } from "./ChatService";
import { Observable } from "../../../../env/helpers/observable";
import { listObserver } from "../../../../env/reactivity2.0/types";
import { ReactiveList } from "../../../../env/reactivity2.0/reactivityList";
import { Collector } from "../../../../env/helpers/Collector";
import { ReactiveMessage } from "./ReactiveMessage";
import { ReactiveUserInfo } from "./ReactiveUserInfo";

export class ReactiveChatData implements iReactiveChatInfo {
    private collector = new Collector();
    private reactiveObjectToRemove: Array<iReactiveUserInfo | iReactiveMessage> = [];
    id: string;
    chatName: iObservable<string>;
    members: listObserver<iReactiveUserInfo>;
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
        const reactiveMembers = chat.members.map((user) => {
            const reactiveUser = new ReactiveUserInfo(user);
            this.reactiveObjectToRemove.push(reactiveUser);
            return reactiveUser;
        });
        this.members = new ReactiveList(reactiveMembers);
        this.photo = new Observable(chat.photo);
        this.history = new ReactiveList(chat.history.map((msg) => {
            const reactiveMsg = new ReactiveMessage(msg);
            this.reactiveObjectToRemove.push(reactiveMsg);
            return reactiveMsg;
        }));
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
                this.reactiveObjectToRemove.push(reactiveMsg);
                this.history.push(reactiveMsg);
            })
        );
    }

    private setupAddMembersEvent() {
        this.collector.collect(
            chatManager.addMember$.subscribe((data) => {
                this.reactiveObjectToRemove.push(data.user);
                this.members.push(data.user);
            })
        );
    }

    private setupRemoveMembersEvent() {
        this.collector.collect(
            chatManager.leaveChat$.subscribe((data) => {
                const index = this.members.getValue().findIndex((user) => user.getValue().email.getValue() === data.user.email.getValue());
                this.members.delete(index);
            })
        );
    }

    destroy() {
        this.reactiveObjectToRemove.forEach((obj) => obj.destroy());
        this.collector.clear();
    }
}