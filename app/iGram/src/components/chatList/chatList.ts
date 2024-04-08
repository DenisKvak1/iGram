import { iChat, iComponent, iObservable } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { Observable } from "../../../../../env/helpers/observable";
import { chatElementT, chatListT } from "./template";
import "./style.css";
import { sortChatsByNewest } from "../../../../../env/helpers/sortChat";
import { ChatService, chatManager } from "../../services/ChatService";

export class ChatList implements iComponent {
    chatListContainer: HTMLElement;
    selectChat$: iObservable<string>;
    private list$: iObservable<Array<iChat>>;
    eventSList: Array<{ unsubscribe: () => void }>;

    constructor() {
        this.list$ = new Observable<Array<iChat>>([]);
        this.selectChat$ = new Observable<string>();
        this.eventSList = [];
    }

    createElement() {
        this.chatListContainer = createElementFromHTML(chatListT);
        chatManager.getChats((chats) => {
            this.setList(sortChatsByNewest(chats));
        });
        chatManager.chatCreated$.subscribe((data) => {
            this.pushList(data.chat);
        });
        chatManager.message$.subscribe((msg) => {
            let list = this.list$.getValue();
            let chatI = this.list$.getValue().findIndex((item) => item.id === msg.to);

            list[chatI].history.push(msg);
            this.setList(sortChatsByNewest(list));
        });
        chatManager.leaveChat$.subscribe((data)=>{
            if (this.selectChat$.getValue() === data.chatID && localStorage.getItem("email") === data.user.email) {
                let list = this.list$.getValue();
                list = list.filter((item) => item.id !== data.chatID);
                this.setList(list);
                this.selectChat$.next(null);
            }
        })
        chatManager.addMember$.subscribe((data)=>{
            if (localStorage.getItem("email") === data.user.email) {
                const chat = new ChatService(data.chatID);

                chat.getChat((chat) => {
                    this.pushList(chat);
                });
            }
        })
        return this.chatListContainer;
    }

    getElement() {
        return this.chatListContainer;
    }

    setList(chats: Array<iChat>) {
        this.chatListContainer.innerHTML = "";
        this.list$.setValue([]);
        this.eventSList.forEach((item) => item.unsubscribe());
        this.eventSList = [];

        chats.forEach((item) => {
            this.pushList(item);
        });
        this.list$.next(chats);
    }

    pushList(chat: iChat) {
        const chatBlock = createElementFromHTML(chatElementT);
        let avatar = chatBlock.querySelector(".chatPhotoInList") as HTMLImageElement;
        avatar.src = chat.photo;

        chatBlock.onclick = () => {
            this.selectChat$.next(chat.id);
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.set("chatID", chat.id);
            window.history.pushState({}, document.title, currentUrl.toString());
        };
        let chatName = chatBlock.querySelector(".chat_name") as HTMLElement;
        let last_message = chatBlock.querySelector(".last_message");
        chatName.textContent = chat.chatName;
        const latestMessage = chat.history.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
        last_message.textContent = latestMessage ? latestMessage.text : "";

        const chatControll = new ChatService(chat.id);
        const subscribe = chatControll.message$.subscribe((msg) => {
            last_message.textContent = msg.text;
        });
        const subscribe2 = chatControll.setPhoto$.subscribe((data) => {
            const timestamp = new Date().getTime();
            avatar.src = `${data.photo}?timestamp=${timestamp}`;
        });

        this.eventSList.push(subscribe);
        this.eventSList.push(subscribe2);

        let list = this.list$.getValue();
        list.push(chat);
        this.list$.next(list);
        appendChild(this.chatListContainer, chatBlock);
    }

}