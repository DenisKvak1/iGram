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
import { Observable } from "../../../../../env/helpers/observable";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { Modal } from "../modal/Modal";
import { addToGroupItemT, addToGroupMenuT, friendsEmptyCGT, openButtonAddToGroup } from "./template";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";

export class AddUserToChat {
    modal: iModal;
    friendsList: HTMLElement;
    openButton: HTMLElement;
    private list$: iObservable<Array<UserInfo>>;
    private listUserToGroup: Array<string>;
    selectChat$: iObservable<string>;
    requestData$: iObservable<requestData>;
    event$: iObservable<componentsEvent>;
    externalEvent$: iObservable<externalData>;
    constructor(selectChat: iObservable<string>) {
        this.selectChat$ = selectChat;
        this.list$ = new Observable<Array<UserInfo>>([]);
        this.listUserToGroup = [];

        this.requestData$ = new Observable<requestData>();
        this.event$ = new Observable<componentsEvent>();
        this.externalEvent$ = new Observable<externalData>;
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
            this.requestData$.next({ command: requestData_COMMANDS.FRIENDS });
            let subsc = this.externalEvent$.subscribe((data) => {
                if (data.command === requestData_COMMANDS.FRIENDS && data.type === externalEventType.DATA) {
                    this.requestData$.next({
                        command: requestData_COMMANDS.CHAT,
                        payload: { chatID: this.selectChat$.getValue() }
                    });
                    this.requestData$.next({ command: requestData_COMMANDS.CHAT, payload: {chatID: this.selectChat$.getValue()} });
                    let subsc2 = this.externalEvent$.subscribe((chat) => {
                        if (chat.command === requestData_COMMANDS.CHAT && chat.type === externalEventType.DATA) {
                            data.requests = data.requests.filter((item) => !chat.payload.chat.members.some((element) => element.email === item.email));
                            subsc2.unsubscribe();
                            return data.requests ? this.setList(data.requests) : null;
                        }
                    });
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
        const addToGroup = addToGroupMenu.querySelector(".addToGroupBtn") as HTMLButtonElement;


        addToGroup.onclick = () => {
            if (this.listUserToGroup.length > 0) {
                this.listUserToGroup.forEach((login)=>{
                    this.event$.next({
                        command: componentsEvent_COMMANDS.FRIEND_ADD_TO_CHAT,
                        payload: {
                            login,
                            chatID: this.selectChat$.getValue()
                        }
                    })
                })
                this.listUserToGroup = [];
                this.modal.close();
            }
        };
    }
    createElement(){
        return this.openButton
    }
    setList(friends:Array<UserInfo>){
        this.friendsList.innerHTML = ''
        friends.forEach((item)=>{
            this.pushList(item)
        })
        this.list$.next(friends)
    }
    pushList(friend:UserInfo){
        const friendBlock = createElementFromHTML(addToGroupItemT)
        let chatName = friendBlock.querySelector('.chat_name') as HTMLElement
        let checkBox = friendBlock.querySelector('input')
        const photo = friendBlock.querySelector('.chatPhoto') as HTMLImageElement
        photo.src = friend.photo

        checkBox.onchange = (event)=>{
            let element = event.target as HTMLInputElement
            if(element.checked){
                this.listUserToGroup.push(friend.email)
            } else {
                this.listUserToGroup.splice(this.listUserToGroup.indexOf(friend.email), 1)
            }
        }
        chatName.textContent = friend.name

        let list = this.list$.getValue()
        list.push(friend)
        this.list$.next(list)
        appendChild(this.friendsList, friendBlock)
    }
}