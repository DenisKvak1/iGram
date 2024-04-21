import { iReactiveUserInfo, iComponent, iObservable } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { Observable } from "../../../../../env/helpers/observable";

import { friendTemplate } from "./template";
import { reactivityAttribute } from "../../../../../env/reactivity2.0/reactivityAttribute";
import { reactivity } from "../../../../../env/reactivity2.0/reactivity";
import { Collector } from "../../../../../env/helpers/Collector";

export class FriendInviteBlock implements iComponent {
    private user: iReactiveUserInfo;
    private collector = new Collector();
    private friendBlock: HTMLElement;
    private acceptBtn: HTMLButtonElement;
    private rejectBtn: HTMLButtonElement;
    private memberPhoto: HTMLImageElement;
    private userName: HTMLElement;
    friendResponse$: iObservable<{ accept: boolean, email: string }>;

    constructor(user: iObservable<iReactiveUserInfo>) {
        this.user = user.getValue();
        this.friendResponse$ = new Observable();

        this.init();
    }

    private init() {
        this.initHTML();
        this.setupHTMLContent();
        this.setupComponentEvent();
    }

    private setupComponentEvent() {
        this.setupAcceptEvent();
        this.setupRejectEvent();
    }

    private initHTML() {
        this.friendBlock = createElementFromHTML(friendTemplate);
        this.acceptBtn = this.friendBlock.querySelector(".accept_friend") as HTMLButtonElement;
        this.rejectBtn = this.friendBlock.querySelector(".reject_friend") as HTMLButtonElement;
        this.memberPhoto = this.friendBlock.querySelector(".chatPhoto") as HTMLImageElement;
        this.userName = this.friendBlock.querySelector(".chat_name") as HTMLElement;
    }

    private setupHTMLContent() {
        this.collector.collect(
            reactivityAttribute(this.user.photo, this.memberPhoto, "src"),
            reactivity(this.user.name, this.userName)
        );
    }

    private setupAcceptEvent() {
        this.acceptBtn.onclick = () => {
            this.friendResponse$.next({ accept: true, email: this.user.email.getValue() });
        };
    }

    private setupRejectEvent() {
        this.rejectBtn.onclick = () => {
            this.friendResponse$.next({ accept: false, email: this.user.email.getValue() });
        };
    }

    getComponent() {
        return this.friendBlock;
    }


    destroy() {
        this.user.destroy();
        this.collector.clear();
        this.friendBlock.remove();
    }
}