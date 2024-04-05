import {
    addUserToGroupCommand,
    componentsID,
    iComponent,
    iModal,
    iObservable,
    UserInfo
} from "../../../../../env/types";
import { Observable } from "../../../../../env/helpers/observable";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { Modal } from "../modal/Modal";
import { addToGroupItemT, addToGroupMenuT, friendsEmptyCGT, openButtonAddToGroup } from "./template";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { channelInput$, channelOutput$ } from "../../modules/componentDataSharing";

export class AddUserToChat implements iComponent {
    modal: iModal;
    friendsList: HTMLElement;
    openButton: HTMLElement;
    private list$: iObservable<Array<UserInfo>>;
    private listUserToGroup: Array<string>;
    selectChat$: iObservable<string>;

    constructor(selectChat: iObservable<string>) {
        this.selectChat$ = selectChat;
        this.list$ = new Observable<Array<UserInfo>>([]);
        this.listUserToGroup = [];

        this.init();
    }

    init() {
        const openButton = createElementFromHTML(openButtonAddToGroup);
        const addToGroupMenu = createElementFromHTML(addToGroupMenuT);

        this.friendsList = addToGroupMenu.querySelector(".friendsList") as HTMLElement;
        this.modal = new Modal(addToGroupMenu);
        this.openButton = openButton;

        this.modal.setOptions({ padding: "0px" });
        openButton.onclick = () => {
            channelInput$.next({ id: componentsID.addUserToGroup, command: addUserToGroupCommand.GET_FRIENDS });
            let subsc = channelOutput$.subscribe((data) => {
                if (data.id !== componentsID.addUserToGroup) return;
                if (data.command !== addUserToGroupCommand.GET_FRIENDS) return;

                channelInput$.next({
                    id: componentsID.addUserToGroup,
                    command: addUserToGroupCommand.GET_CHAT,
                    payload: { chatID: this.selectChat$.getValue() }
                });
                let subsc2 = channelOutput$.subscribe((chat) => {
                    if (data.id !== componentsID.addUserToGroup) return;
                    if (data.command !== addUserToGroupCommand.GET_FRIENDS) return;

                    data.payload.requests = data.payload.requests.filter((item) => !chat.payload.chat.members.some((element) => element.email === item.email));
                    subsc2.unsubscribe();
                    return data.payload.requests ? this.setList(data.payload.requests) : null;
                });
                subsc.unsubscribe();

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
        const addToGroup = addToGroupMenu.querySelector(".addToGroupBtn") as HTMLButtonElement;


        addToGroup.onclick = () => {
            if (this.listUserToGroup.length > 0) {
                this.listUserToGroup.forEach((login) => {
                    channelInput$.next({
                        id: componentsID.addUserToGroup,
                        command: addUserToGroupCommand.FRIEND_ADD_TO_CHAT,
                        payload: {
                            login,
                            chatID: this.selectChat$.getValue()
                        }
                    });
                });
                this.listUserToGroup = [];
                this.modal.close();
            }
        };
    }

    createElement() {
        return this.openButton;
    }
    getElement(){
        return this.openButton
    }
    setList(friends: Array<UserInfo>) {
        this.friendsList.innerHTML = "";
        friends.forEach((item) => {
            this.pushList(item);
        });
        this.list$.next(friends);
    }

    pushList(friend: UserInfo) {
        const friendBlock = createElementFromHTML(addToGroupItemT);
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