import { iComponent, iModal, iObservable, UserInfo } from "../../../../../env/types";
import "./style.css";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { Modal } from "../modal/Modal";
import { buttonOpenListInvitedTemplate, friendsEmpty, friendsListTemplate, friendTemplate } from "./template";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { Observable } from "../../../../../env/helpers/observable";
import { userService } from "../../services/UserService";

export class ListInvitedFriends implements iComponent {
    modal: iModal;
    friendsList: HTMLElement;
    openButton: HTMLElement;
    private list$: iObservable<Array<UserInfo>>;
    eventSList: Array<{ unsubscribe: () => void }>;

    constructor() {
        this.list$ = new Observable<Array<UserInfo>>([]);
        this.eventSList = [];
    }


    createElement() {
        const openButton = createElementFromHTML(buttonOpenListInvitedTemplate);
        const friendsListBlock = createElementFromHTML(friendsListTemplate);

        this.friendsList = friendsListBlock.querySelector(".friendsList") as HTMLElement;
        this.modal = new Modal(friendsListBlock);
        this.modal.setOptions({ maxWidth: "95%", padding: "0px" });
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
        userService.getFriendsInviteList((friends) => {
            this.setList(friends);
        });

        userService.friendRequest$.subscribe((user) => {
            this.pushList(user);
        });
        return this.openButton;
    }

    getElement() {
        return this.openButton;
    }

    setList(friends: Array<UserInfo>) {
        this.friendsList.innerHTML = "";
        this.eventSList.forEach((item) => item.unsubscribe());
        this.eventSList = [];

        friends.forEach((item) => {
            this.pushList(item);
        });
        this.list$.next(friends);
    }

    pushList(friend: UserInfo) {
        const friendBlock = createElementFromHTML(friendTemplate);
        const acceptBtn = friendBlock.querySelector(".accept_friend") as HTMLButtonElement;
        const rejectBtn = friendBlock.querySelector(".reject_friend") as HTMLButtonElement;
        const memberPhoto = friendBlock.querySelector(".chatPhoto") as HTMLImageElement;
        memberPhoto.src = friend.photo;

        const subscribe = userService.setPhoto$.subscribe((user) => {
            if (user?.email !== friend.email) return;

            const timestamp = new Date().getTime();
            memberPhoto.src = `${user.photo}?timestamp=${timestamp}`;
        });
        this.eventSList.push(subscribe);

        acceptBtn.onclick = () => {
            userService.friendResponse(friend.email, true);
            friendBlock.remove();
            let list = this.list$.getValue();
            list.splice(list.indexOf(friend), 1);
            this.list$.next(list);
        };
        rejectBtn.onclick = () => {
            userService.friendResponse(friend.email, false);
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