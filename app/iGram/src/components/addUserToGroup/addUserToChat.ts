import { iComponent, iModal, iReactiveUserInfo } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { Modal } from "../modal/Modal";
import { addToChatMenuT, friendsEmptyCGT, openButtonAddToChat } from "./template";
import { selectChatService } from "../../services/ChatService";
import { userService } from "../../services/UserService";
import { listObserver } from "../../../../../env/reactivity2.0/types";
import { ReactiveList } from "../../../../../env/reactivity2.0/reactivityList";
import { registerReactivityList } from "../../../../../env/reactivity2.0/registerReactivityList";
import { UserCheckBoxBlock } from "../userCheckBoxBlock/userCheckBoxBlock";
import { Collector } from "../../../../../env/helpers/Collector";
import { conditionalRendering } from "../../../../../env/reactivity2.0/conditionalRendering";

export class AddUserToChat implements iComponent {
    private modal: iModal;
    private friendsList: HTMLElement;
    private openButton: HTMLElement;
    private addToChatMenu: HTMLElement;
    private emptyBlock: HTMLElement;
    private addToChatBtn: HTMLButtonElement;
    private readonly list: listObserver<iReactiveUserInfo>;
    private listUserToChat: Array<string>;
    private collector = new Collector();

    constructor() {
        this.list = new ReactiveList([]);
        this.listUserToChat = [];

        this.init();
    }

    private init() {
        this.initHTML();
        this.initHTMLContent();
        this.initModal();
        this.getFriendListHandler();
        this.setupEvents();
    }

    private initHTML() {
        this.openButton = createElementFromHTML(openButtonAddToChat);
        this.addToChatMenu = createElementFromHTML(addToChatMenuT);
        this.emptyBlock = createElementFromHTML(friendsEmptyCGT);
        this.friendsList = this.addToChatMenu.querySelector(".friendsList") as HTMLElement;
        this.addToChatBtn = this.addToChatMenu.querySelector(".addToGroupBtn") as HTMLButtonElement;
    }

    private setupEvents() {
        this.openButton.onclick = () => this.getFriendListHandler();
        this.addToChatBtn.onclick = () => this.addUserHandler();
        this.collector.collect(userService.addFriend$.subscribe((user) => this.pushFriendHandler(user)));
    }

    private initHTMLContent() {
        this.collector.collect(
            registerReactivityList(UserCheckBoxBlock, this.friendsList, this.list, (userCheckBoxComponent) => {
                this.checkUserHandler(userCheckBoxComponent);
            }),
            conditionalRendering(this.list, () => this.list.getValue().length === 0, this.emptyBlock, this.friendsList)
        );
    }

    private initModal() {
        this.modal = new Modal(this.addToChatMenu);
        this.modal.setOptions({ padding: "0px" });
    }

    private getFriendListHandler() {
        userService.getReactiveFriendsList((users) => {
            const members = selectChatService.chat$.getValue().members.getValue();
            users = users.filter((item) => !members.some((element) => element.getValue().email === item.email.getValue()));

            this.list.set(users);
        });
        this.modal.open();
    }

    private pushFriendHandler(user: iReactiveUserInfo) {
        const chatMember = selectChatService.chat$.getValue().members.getValue();
        if (chatMember.some((member) => member.getValue().email === user.email.getValue())) return;

        this.list.push(user);
    }

    private checkUserHandler(userCheckBoxComponent: any) {
        this.collector.collect(
            userCheckBoxComponent.check$.subscribe((event: { user: string, checked: boolean }) => {
                if (event.checked) {
                    this.listUserToChat.push(event.user);
                } else {
                    const index = this.listUserToChat.indexOf(event.user);
                    this.listUserToChat.splice(index, 1);
                }
            })
        );
    }
    
    private addUserHandler() {
        if (this.listUserToChat.length > 0) {
            this.listUserToChat.forEach((login) => {
                selectChatService.addUser(login);
            });
            this.listUserToChat = [];
            this.list.set([]);
            this.modal.close();
        }
    }

    getComponent() {
        return this.openButton;
    }

    unMounted() {
        this.collector.clear();
        this.openButton.remove();
        this.addToChatMenu.remove();
    }
}