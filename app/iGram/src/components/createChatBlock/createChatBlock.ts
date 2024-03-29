import {
    componentsEvent,
    componentsEvent_COMMANDS,
    externalData,
    externalEventType,
    iModal,
    iObservable,
    requestData,
    requestData_COMMANDS,
    UserInfo
} from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { buttonCreateGroupMenuTemplate, createGroupItemT, createGroupMenuT, friendsEmptyCGT } from "./template";
import { Modal } from "../modal/Modal";
import { Observable } from "../../../../../env/helpers/observable";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import "./style.css";

export class CreateChatBlock {
    modal: iModal;
    friendsList: HTMLElement;
    openButton: HTMLElement;
    private list$: iObservable<Array<UserInfo>>;
    private listUserToGroup: Array<string>;
    requestData$: iObservable<requestData>;
    event$: iObservable<componentsEvent>;
    externalEvent$: iObservable<externalData>;

    constructor() {
        this.list$ = new Observable<Array<UserInfo>>([]);
        this.listUserToGroup = [];
        this.requestData$ = new Observable<requestData>();
        this.event$ = new Observable<componentsEvent>();
        this.externalEvent$ = new Observable<externalData>;
    }

    createElement() {
        const openButton = createElementFromHTML(buttonCreateGroupMenuTemplate);
        const createGroupMenu = createElementFromHTML(createGroupMenuT);

        this.friendsList = createGroupMenu.querySelector(".friendsList") as HTMLElement;
        this.modal = new Modal(createGroupMenu);
        this.openButton = openButton;

        this.modal.setOptions({ padding: "0px", maxWidth: "95%"});
        openButton.onclick = () => {
            this.requestData$.next({ command: requestData_COMMANDS.FRIENDS });
            let subsc = this.externalEvent$.subscribe((data) => {
                if (data.command === requestData_COMMANDS.FRIENDS && data.type === externalEventType.DATA) {
                    this.setList(data.requests);
                    subsc.unsubscribe();
                }
            });

            this.modal.open();
        };
        let emptyBlock = createElementFromHTML(friendsEmptyCGT);
        this.friendsList.appendChild(emptyBlock);


        this.list$.subscribe((data) => {
            if (data.length === 0) {
                if (this.friendsList.querySelector(".friendsEmpty")) return;

                this.friendsList.appendChild(emptyBlock);
            } else {
                emptyBlock.remove();
            }
        });

        let createGroupBtn = createGroupMenu.querySelector(".createGroup") as HTMLButtonElement;
        let createGroupInput = createGroupMenu.querySelector(".nameGropInput input") as HTMLInputElement;
        createGroupBtn.onclick = () => {
            if (createGroupInput.value && this.listUserToGroup.length > 0) {
                this.event$.next({
                    command: componentsEvent_COMMANDS.CHAT_CREATED,
                    payload: {
                        logins: this.listUserToGroup,
                        chatName: createGroupInput.value
                    }
                });
                createGroupInput.value = "";
                this.listUserToGroup = [];
                this.modal.close();
            }
        };
        return this.openButton;
    }

    getElement(){
        return this.openButton;
    }

    setList(friends: Array<UserInfo>) {
        this.friendsList.innerHTML = "";
        friends.forEach((item) => {
            this.pushList(item);
        });
        this.list$.next(friends);
    }

    pushList(friend: UserInfo) {
        const friendBlock = createElementFromHTML(createGroupItemT);
        let chatName = friendBlock.querySelector(".chat_name") as HTMLElement;
        let checkBox = friendBlock.querySelector("input");
        const photo = friendBlock.querySelector(".chatPhoto") as HTMLImageElement;
        photo.src = friend.photo;
        checkBox.onchange = (event) => {
            let element = event.target as HTMLInputElement;
            if (element.checked) {
                this.listUserToGroup.push(friend.email);
            } else {
                this.listUserToGroup.splice(this.listUserToGroup.indexOf(friend.email), 1);
            }
        };
        chatName.textContent = friend.name;

        let list = this.list$.getValue();
        list.push(friend);
        this.list$.next(list);
        appendChild(this.friendsList, friendBlock);
    }
}