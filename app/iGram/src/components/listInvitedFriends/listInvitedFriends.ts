import { iReactiveUserInfo, iComponent, iModal } from "../../../../../env/types";
import "./style.css";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { Modal } from "../modal/Modal";
import { buttonOpenListInvitedTemplate, friendsEmpty, friendsListTemplate } from "./template";
import { userService } from "../../services/UserService";
import { FriendInviteBlock } from "../friendInviteBlock/friendInviteBlock";
import { listObserver } from "../../../../../env/reactivity2.0/types";
import { ReactiveList } from "../../../../../env/reactivity2.0/reactivityList";
import { conditionalRendering } from "../../../../../env/reactivity2.0/conditionalRendering";
import { registerReactivityList } from "../../../../../env/reactivity2.0/registerReactivityList";
import { Collector } from "../../../../../env/helpers/Collector";


export class ListInvitedFriends implements iComponent {
    private modal: iModal;
    private friendsList: HTMLElement;
    private openButton: HTMLElement;
    private friendsListBlock: HTMLElement;
    private emptyBlock: HTMLElement;
    private readonly collector = new Collector();
    private readonly list: listObserver<iReactiveUserInfo>;

    constructor() {
        this.list = new ReactiveList([]);

        this.init();
    }

    private init() {
        this.initHTML();
        this.initModal();
        this.initFriendList();
        this.initEmptyBlock();
        this.initFriendsList();
        this.setupHandlerPushFriend();
    }

    private initHTML() {
        this.emptyBlock = createElementFromHTML(friendsEmpty);
        this.openButton = createElementFromHTML(buttonOpenListInvitedTemplate);
        this.friendsListBlock = createElementFromHTML(friendsListTemplate);
        this.friendsList = this.friendsListBlock.querySelector(".friendsList") as HTMLElement;
    }

    private initModal() {
        this.modal = new Modal(this.friendsListBlock);
        this.modal.setOptions({ maxWidth: "95%", padding: "0px" });
        this.openButton.onclick = () => this.modal.open();
    }

    private initEmptyBlock() {
        conditionalRendering(this.list, () => this.list.getValue().length === 0, this.emptyBlock, this.friendsList);
    }

    private initFriendList() {
        this.collector.collect(
            registerReactivityList<iReactiveUserInfo>(FriendInviteBlock, this.friendsList, this.list as any, (friendBlock: any) => {
                this.friendInviteBlockEventHandler(friendBlock);
            })
        );
    }

    private friendInviteBlockEventHandler(friendBlock: any) {
        this.collector.collect(
            friendBlock.friendResponse$.subscribe((data: { accept: boolean, email: string }) => {
                userService.friendResponse(data.email, data.accept);
                const list = this.list.getValue();
                const index = list.findIndex((item) => item.getValue().email.getValue() === data.email);
                this.list.delete(index);
            })
        );
    }

    private initFriendsList() {
        userService.getReactiveFriendsInviteList((friends) => {
            this.list.set(friends);
        });
    }

    private setupHandlerPushFriend() {
        this.collector.collect(
            userService.friendRequest$.subscribe((user) => {
                this.list.push(user);
            })
        );
    }

    getComponent() {
        return this.openButton;
    }

    destroy() {
        this.collector.clear();
        this.friendsListBlock.remove();
        this.openButton.remove();
    }
}