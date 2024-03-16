import { iChat, IAppController, iObservable, message } from "../../../../../env/types";
import { AppController } from "../../appController";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { Observable } from "../../../../../env/helpers/observable";
import { getGroupList } from "../../hook/getList";
import { chatElementT, chatListT } from "./template";
import "./style.css"
import { sortChatsByNewest } from "../../hook/sortGroup";

export class ChatList {
    controller: IAppController
    chatListContainer: HTMLElement
    selectChat$: iObservable<string>
    private list$: iObservable<Array<iChat>>
    eventSList: Array<{unsubscribe: ()=>void}>

    constructor() {
        this.controller = AppController.getInstance()
        this.list$ = new Observable<Array<iChat>>([])
        this.selectChat$ = new Observable<string>()
        this.eventSList = []

        this.init()
    }
    init(){
        this.chatListContainer = createElementFromHTML(chatListT)
        getGroupList().then((data)=>this.setList(sortChatsByNewest(data)))
        this.controller.server.event$.subscribe((data)=>{
            if(data.command === "groupCreated"){
                this.pushList(data.payload.group)
            } else if (data.command === "leaveGroup") {
                if(this.selectChat$.getValue() === data.payload.chatID && localStorage.getItem('email') === data.payload.user.email){
                    let list = this.list$.getValue();
                    list = list.filter((item) => item.id !== data.payload.chatID);
                    this.setList(list);
                    this.selectChat$.next(null)
                }
            } else if(data.command === "friendAddedToGroup"){
                if(localStorage.getItem('email') === data.payload.user.email){
                    getGroupList(data.payload.chatID).then((data)=>{
                        this.pushList(data[0])
                    })
                }
            }
            else if(data.command === "message"){
                let list = this.list$.getValue()
                let chatI = this.list$.getValue().findIndex((item)=>item.id === data.payload.to)

                list[chatI].history.push(data.payload as message)
                this.setList(sortChatsByNewest(list))
            }
        })
    }
    createElement(){
        return this.chatListContainer
    }
    setList(chats:Array<iChat>){
        this.chatListContainer.innerHTML = ''
        this.list$.setValue([])
        this.eventSList.forEach((item)=>item.unsubscribe())
        this.eventSList = []

        chats.forEach((item)=>{
            this.pushList(item)
        })
        this.list$.next(chats)
    }
    pushList(chat:iChat){
        const chatBlock = createElementFromHTML(chatElementT)
        let avatar = chatBlock.querySelector('.chatPhotoInList') as HTMLImageElement
        avatar.src  = chat.photo

        chatBlock.onclick = ()=>{
            this.selectChat$.next(chat.id)
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set('chatID', chat.id);
            window.history.pushState({}, document.title, currentUrl.toString());
        }
        let chatName =chatBlock.querySelector('.chat_name') as HTMLElement
        let last_message = chatBlock.querySelector('.last_message')
        chatName.textContent = chat.groupName
        const latestMessage = chat.history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        last_message.textContent = latestMessage ? latestMessage.text : '';

        const subscribe = this.controller.server.event$.subscribe((data)=>{
            if(data.command === "message" && data.payload.to === chat.id){
                last_message.textContent = data.payload.text
            } else if(data.command === "setGroupPhoto" && data.payload.chatID === chat.id){
                const timestamp = new Date().getTime();
                avatar.src = `${data.payload.photo}?timestamp=${timestamp}`
            }
        })
        this.eventSList.push(subscribe)

        let list = this.list$.getValue()
        list.push(chat)
        this.list$.next(list)
        appendChild(this.chatListContainer, chatBlock)
    }

}