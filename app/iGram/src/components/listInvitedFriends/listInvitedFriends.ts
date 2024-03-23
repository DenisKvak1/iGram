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
import "./style.css";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { Modal } from "../modal/Modal";
import { buttonOpenListInvitedTemplate, friendsEmpty, friendsListTemplate, friendTemplate } from "./template";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { Observable } from "../../../../../env/helpers/observable";

export class ListInvitedFriends {
    modal: iModal;
    friendsList: HTMLElement;
    openButton: HTMLElement;
    private list$: iObservable<Array<UserInfo>>;
    eventSList: Array<{unsubscribe: ()=>void}>
    requestData$: iObservable<requestData>
    event$: iObservable<componentsEvent>
    externalEvent$: iObservable<externalData>
    constructor() {
        this.list$ = new Observable<Array<UserInfo>>([]);
        this.eventSList = []
        this.requestData$ = new Observable<requestData>()
        this.event$ = new Observable<componentsEvent>()
        this.externalEvent$ = new Observable<externalData>
    }


    createElement() {
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
        this.requestData$.next({ command: requestData_COMMANDS.FRIEND_REQUEST })
        let subc = this.externalEvent$.subscribe((data)=>{
            if(data.command === requestData_COMMANDS.FRIEND_REQUEST && data.type === externalEventType.DATA){
                this.setList(data.requests)
                subc.unsubscribe()
            }
        })

        this.externalEvent$.subscribe((data) => {
            if (data.command === componentsEvent_COMMANDS.FRIEND_REQUEST && data.type === externalEventType.EVENT) {
                this.pushList(data.payload.from as UserInfo);
            }
        });
        return this.openButton;
    }

    getElement(){
        return this.openButton;
    }

    setList(friends: Array<UserInfo>) {
        this.friendsList.innerHTML = "";
        this.eventSList.forEach((item)=>item.unsubscribe())
        this.eventSList = []

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

        const subscribe = this.externalEvent$.subscribe((data) => {
            if (data.command === componentsEvent_COMMANDS.SET_USER_PHOTO && data.payload?.user?.email === friend.email) {
                const timestamp = new Date().getTime();
                memberPhoto.src = `${data.payload.user.photo}?timestamp=${timestamp}`;
            }
        });
        this.eventSList.push(subscribe)

        acceptBtn.onclick = () => {
            this.event$.next({
                command: componentsEvent_COMMANDS.FRIEND_RESPONSE,
                payload: {
                    login: friend.email,
                    accept: true
                }
            })
            friendBlock.remove();
            let list = this.list$.getValue();
            list.splice(list.indexOf(friend), 1);
            this.list$.next(list);
        };
        rejectBtn.onclick = () => {
            this.event$.next({
                command: componentsEvent_COMMANDS.FRIEND_RESPONSE,
                payload: {
                    login: friend.email,
                    accept: false
                }
            })
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