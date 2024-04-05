import {
    listInvitedFriendsCommand,
    componentsID,
    iModal,
    iObservable,
    UserInfo,
    iComponent
} from "../../../../../env/types";
import "./style.css";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { Modal } from "../modal/Modal";
import { buttonOpenListInvitedTemplate, friendsEmpty, friendsListTemplate, friendTemplate } from "./template";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { Observable } from "../../../../../env/helpers/observable";
import { channelInput$, channelOutput$ } from "../../modules/componentDataSharing";

export class ListInvitedFriends implements iComponent{
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
        channelInput$.next({
            id: componentsID.listInvitedFriends,
            command: listInvitedFriendsCommand.GET_FRIEND_REQUEST
        });
        let subc = channelOutput$.subscribe((data) => {
            if (data.id !== componentsID.listInvitedFriends) return;
            if (data.command !== listInvitedFriendsCommand.GET_FRIEND_REQUEST) return;

            this.setList(data.payload.requests);
            subc.unsubscribe();
        });

        channelOutput$.subscribe((data) => {
            if(data.command !== listInvitedFriendsCommand.FRIEND_REQUEST) return

            this.pushList(data.payload.from as UserInfo);
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

        const subscribe = channelOutput$.subscribe((data) => {
            if (data.command === listInvitedFriendsCommand.SET_USER_PHOTO && data.payload?.user?.email === friend.email) {
                const timestamp = new Date().getTime();
                memberPhoto.src = `${data.payload.user.photo}?timestamp=${timestamp}`;
            }
        });
        this.eventSList.push(subscribe);

        acceptBtn.onclick = () => {
            channelInput$.next({
                id: componentsID.listInvitedFriends,
                command: listInvitedFriendsCommand.FRIEND_RESPONSE,
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
            channelInput$.next({
                id: componentsID.listInvitedFriends,
                command: listInvitedFriendsCommand.FRIEND_RESPONSE,
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