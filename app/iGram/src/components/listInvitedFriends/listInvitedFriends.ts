import { IAppController,  iModal, iObservable, iUser } from "../../../../../env/types";
import { AppController } from "../../appController";
import "./style.css";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { Modal } from "../modal/Modal";
import { buttonOpenListInvitedTemplate, friendsEmpty, friendsListTemplate, friendTemplate } from "./template";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { Observable } from "../../../../../env/helpers/observable";
import { getFriendsInviteList } from "../../hook/getList";

export class ListInvitedFriends {
    controller: IAppController;
    modal: iModal;
    friendsList: HTMLElement;
    openButton: HTMLElement;
    private list$: iObservable<Array<iUser>>;

    constructor() {
        this.list$ = new Observable<Array<iUser>>([]);
        this.controller = AppController.getInstance();

        this.init();
    }

    private init() {
        const openButton = createElementFromHTML(buttonOpenListInvitedTemplate);
        const friendsListBlock = createElementFromHTML(friendsListTemplate);

        this.friendsList = friendsListBlock.querySelector(".friendsList") as HTMLElement;
        this.modal = new Modal(friendsListBlock);
        this.modal.setOptions({maxWidth: '95%', padding: "0px"})
        openButton.onclick = () => this.modal.open();
        this.openButton = openButton;

        let emptyBlock = createElementFromHTML(friendsEmpty);
        this.friendsList.appendChild(emptyBlock);


        this.list$.subscribe((data) => {
            if (data.length === 0) {
                if (this.friendsList.querySelector(".friendsEmpty")) return;

                this.friendsList.appendChild(emptyBlock);
            } else {
                emptyBlock.remove();
            }
        });

        getFriendsInviteList().then((data) => data ? this.setList(data) : null);
        this.controller.server.event$.subscribe((data) => {
            if (data.command === "friendRequest") {
                this.pushList(data.payload.from as iUser);
            }
        });
    }

    createElement() {
        return this.openButton;
    }

    setList(friends: Array<iUser>) {
        this.friendsList.innerHTML = "";
        friends.forEach((item) => {
            this.pushList(item);
        });
        this.list$.next(friends);
    }

    pushList(friend: iUser) {
        const friendBlock = createElementFromHTML(friendTemplate);
        const acceptBtn = friendBlock.querySelector(".accept_friend") as HTMLButtonElement;
        const rejectBtn = friendBlock.querySelector(".reject_friend") as HTMLButtonElement;
        const memberPhoto = friendBlock.querySelector(".chatPhoto") as HTMLImageElement;
        memberPhoto.src = friend.photo;

        this.controller.server.event$.subscribe((data) => {
            if (data.command === "setUserPhoto" && data.payload?.user?.email === friend.email) {
                const timestamp = new Date().getTime();
                memberPhoto.src = `${data.payload.photo}?timestamp=${timestamp}`;
            }
        });

        acceptBtn.onclick = () => {
            this.controller.server.push({
                command: "friendResponse",
                payload: {
                    login: friend.email,
                    accept: true
                }
            });
            friendBlock.remove();
            let list = this.list$.getValue();
            list.splice(list.indexOf(friend), 1);
            this.list$.next(list);
        };
        rejectBtn.onclick = () => {
            this.controller.server.push({
                command: "friendResponse",
                payload: {
                    login: friend.email,
                    accept: false
                }
            });
            friendBlock.remove();
            let list = this.list$.getValue();
            list.splice(list.indexOf(friend), 1);
            this.list$.next(list);
        };
        let chatName = friendBlock.querySelector(".chat_name") as HTMLElement;
        chatName.textContent = friend.name;

        let list = this.list$.getValue();
        list.push(friend);
        this.list$.next(list);
        appendChild(this.friendsList, friendBlock);
    }
}