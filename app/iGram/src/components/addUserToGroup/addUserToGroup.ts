import { IAppController, iModal, iObservable, iUser } from "../../../../../env/types";
import { Observable } from "../../../../../env/helpers/observable";
import { AppController } from "../../appController";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { Modal } from "../modal/Modal";
import { getFriendsList, getGroupList } from "../../hook/getList";
import { addToGroupItemT, addToGroupMenuT, friendsEmptyCGT, openButtonAddToGroup } from "./template";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";

export class AddUserToGroup {
    controller: IAppController;
    modal: iModal;
    friendsList: HTMLElement;
    openButton: HTMLElement;
    private list$: iObservable<Array<iUser>>;
    private listUserToGroup: Array<string>;
    selectChat$: iObservable<string>;

    constructor(selectChat: iObservable<string>) {
        this.selectChat$ = selectChat;
        this.list$ = new Observable<Array<iUser>>([]);
        this.controller = AppController.getInstance();
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
            getFriendsList().then((data) => {
                getGroupList(this.selectChat$.getValue()).then((chat)=>{
                    data= data.filter((item)=>!chat[0].members.some((element)=>element.email === item.email))
                    return data ? this.setList(data) : null
                })
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
                    this.controller.server.push({
                        command: 'friendAddedToGroup',
                        payload: {
                            login,
                            chatID: this.selectChat$.getValue()
                        }
                    });
                })
                this.listUserToGroup = [];
                this.modal.close();
            }
        };
    }
    createElement(){
        return this.openButton
    }
    setList(friends:Array<iUser>){
        this.friendsList.innerHTML = ''
        friends.forEach((item)=>{
            this.pushList(item)
        })
        this.list$.next(friends)
    }
    pushList(friend:iUser){
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