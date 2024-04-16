import { iReactiveUserInfo, iComponent, iModal } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { buttonCreateGroupMenuTemplate, createGroupMenuT, friendsEmptyCGT } from "./template";
import { Modal } from "../modal/Modal";
import { chatManager } from "../../services/ChatService";
import { userService } from "../../services/UserService";
import { Collector } from "../../../../../env/helpers/Collector";
import { listObserver } from "../../../../../env/reactivity2.0/types";
import { ReactiveList } from "../../../../../env/reactivity2.0/reactivityList";
import { registerReactivityList } from "../../../../../env/reactivity2.0/registerReactivityList";
import { UserCheckBoxBlock } from "../userCheckBoxBlock/userCheckBoxBlock";
import { conditionalRendering } from "../../../../../env/reactivity2.0/conditionalRendering";
import "./style.css";

export class CreateChatList implements iComponent {
    private modal: iModal;
    private friendsList: HTMLElement;
    private openButton: HTMLElement;
    private createGroupMenu: HTMLElement;
    private emptyBlock: HTMLElement;
    private createGroupBtn: HTMLElement;
    private createGroupInput: HTMLInputElement;
    private readonly list: listObserver<iReactiveUserInfo>;
    private listUserToGroup: Array<string>;

    private collector = new Collector();

    constructor() {
        this.list = new ReactiveList([]);
        this.listUserToGroup = [];

        this.init();
    }

    private init() {
        this.initHTML();
        this.initModal();
        this.setupHTMLContent();
        this.initFriendsList();
        this.setupEvents()
    }

    private initHTML() {
        this.openButton = createElementFromHTML(buttonCreateGroupMenuTemplate);
        this.createGroupMenu = createElementFromHTML(createGroupMenuT);
        this.emptyBlock = createElementFromHTML(friendsEmptyCGT);
        this.friendsList = this.createGroupMenu.querySelector(".friendsList") as HTMLElement;
        this.createGroupBtn = this.createGroupMenu.querySelector(".createGroup") as HTMLButtonElement;
        this.createGroupInput = this.createGroupMenu.querySelector(".nameGropInput input") as HTMLInputElement;
    }

    private setupEvents() {
        this.openButton.onclick = () => this.openModalHandler();
        this.createGroupBtn.onclick = () => this.createChatHandler();
        this.collector.collect(userService.addFriend$.subscribe((user) => this.pushFriendHandler(user)));
    }

    private setupHTMLContent() {
        this.collector.collect(
            registerReactivityList(UserCheckBoxBlock, this.friendsList, this.list, (userCheckBoxComponent) => {
                this.checkUserHandler(userCheckBoxComponent);
            }),
            conditionalRendering(this.list, () => this.list.getValue().length === 0, this.emptyBlock, this.friendsList)
        );
    }


    private initModal() {
        this.modal = new Modal(this.createGroupMenu);
        this.modal.setOptions({ padding: "0px", maxWidth: "95%" });
    }

    private initFriendsList() {
        userService.getReactiveFriendsList((friends) => {
            this.list.set(friends);
        });
    }

    private pushFriendHandler(user: iReactiveUserInfo) {
        this.list.push(user);
    }

    private openModalHandler() {
        this.modal.open();
    }

    private createChatHandler() {
        if (this.createGroupInput.value && this.listUserToGroup.length > 0) {
            chatManager.createChat(this.listUserToGroup, this.createGroupInput.value);
            this.createGroupInput.value = "";
            this.listUserToGroup = [];
            this.modal.close();
        }
    }

    private checkUserHandler(userCheckBoxComponent: any) {
        this.collector.collect(
            userCheckBoxComponent.check$.subscribe((event: { user: string, checked: boolean }) => {
                if (event.checked) {
                    this.listUserToGroup.push(event.user);
                } else {
                    const index = this.listUserToGroup.indexOf(event.user);
                    this.listUserToGroup.splice(index, 1);
                }
            })
        );
    }

    getComponent() {
        return this.openButton;
    }

    unMounted() {
        this.createGroupMenu.remove();
        this.openButton.remove();
    }
}