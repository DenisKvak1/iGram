import { IAppController, iModal, iObservable } from "../../../../../env/types";
import { AppController } from "../../appController";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { buttonCreateGroupMenuTemplate, createGroupItemT, createGroupMenuT, friendsEmptyCGT } from "./template";
import { Modal } from "../modal/Modal";
import { Observable } from "../../../../../env/helpers/observable";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import "./style.css"
import { getFriendsList } from "../../hook/getList";

export class CreateGroupBlock {
    controller: IAppController
    modal: iModal
    friendsList: HTMLElement
    openButton: HTMLElement
    private list$: iObservable<Array<string>>
    private listUserToGroup: Array<string>
    constructor() {
        this.list$ = new Observable<Array<string>>([])
        this.controller = AppController.getInstance()
        this.listUserToGroup = []

        this.init()
    }
    init(){
        const openButton = createElementFromHTML(buttonCreateGroupMenuTemplate)
        const createGroupMenu = createElementFromHTML(createGroupMenuT)

        this.friendsList = createGroupMenu.querySelector('.friendsList') as HTMLElement
        this.modal = new Modal(createGroupMenu)
        this.openButton = openButton

        this.modal.setOptions({padding: "0px"})
        openButton.onclick = ()=> {
            getFriendsList().then((data)=>data ? this.setList(data) : null)
            this.modal.open()
        }
        let emptyBlock  =createElementFromHTML(friendsEmptyCGT)
        this.friendsList.appendChild(emptyBlock)


        this.list$.subscribe((data)=>{
            if(data.length===0){
                if(this.friendsList.querySelector('.friendsEmpty')) return

                this.friendsList.appendChild(emptyBlock)
            } else {
                emptyBlock.remove()
            }
        })

        let createGroupBtn = createGroupMenu.querySelector('.createGroup') as HTMLButtonElement
        let createGroupInput = createGroupMenu.querySelector('.nameGropInput input') as HTMLInputElement
        createGroupBtn.onclick = ()=>{
            if(createGroupInput.value && this.listUserToGroup.length>0){
                this.controller.server.push({
                    command: "groupCreated",
                    payload: {
                        logins: this.listUserToGroup,
                        groupName: createGroupInput.value
                    }
                })
                createGroupInput.value = ''
                this.listUserToGroup = []
                this.modal.close()
            }
        }
    }
    createElement(){
        return this.openButton
    }
    setList(friends:Array<string>){
        this.friendsList.innerHTML = ''
        friends.forEach((item)=>{
            this.pushList(item)
        })
        this.list$.next(friends)
    }
    pushList(friend:string){
        const friendBlock = createElementFromHTML(createGroupItemT)
        let chatName = friendBlock.querySelector('.chat_name') as HTMLElement
        let checkBox = friendBlock.querySelector('input')
        const photo = friendBlock.querySelector('.chatPhoto') as HTMLImageElement
        this.controller.server.getUser(friend).then((data)=>photo.src = data.user.photo)
        checkBox.onchange = (event)=>{
            let element = event.target as HTMLInputElement
            if(element.checked){
                this.listUserToGroup.push(friend)
            } else {
                this.listUserToGroup.splice(this.listUserToGroup.indexOf(friend), 1)
            }
        }
        chatName.textContent = friend

        let list = this.list$.getValue()
        list.push(friend)
        this.list$.next(list)
        appendChild(this.friendsList, friendBlock)
    }
}