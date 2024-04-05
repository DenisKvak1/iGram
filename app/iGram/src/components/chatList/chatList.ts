import { chatListCommand, componentsID, iChat, iComponent, iObservable, message } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { Observable } from "../../../../../env/helpers/observable";
import { chatElementT, chatListT } from "./template";
import "./style.css";
import { sortChatsByNewest } from "../../hook/sortChat";
import { channelInput$, channelOutput$ } from "../../modules/componentDataSharing";

export class ChatList implements iComponent{
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
        channelInput$.next({ id: componentsID.chatList, command: chatListCommand.GET_CHATS });
        let subsc = channelOutput$.subscribe((data) => {
            if (data.command !== chatListCommand.GET_CHATS) return;
            if(data.id !== componentsID.chatList) return;

            this.setList(sortChatsByNewest(data.payload.data));
            subsc.unsubscribe();
        });

        channelOutput$.subscribe((data) => {
            if (data.command === chatListCommand.CHAT_CREATED) {
                this.pushList(data.payload.chat);
            } else if (data.command === chatListCommand.LEAVE_CHAT) {
                if (this.selectChat$.getValue() === data.payload.chatID && localStorage.getItem("email") === data.payload.user.email) {
                    let list = this.list$.getValue();
                    list = list.filter((item) => item.id !== data.payload.chatID);
                    this.setList(list);
                    this.selectChat$.next(null);
                }
            } else if (data.command === chatListCommand.FRIEND_ADD_TO_CHAT) {
                if (localStorage.getItem("email") === data.payload.user.email) {
                    channelInput$.next({
                        id: componentsID.chatList,
                        command: chatListCommand.GET_CHATS,
                        payload: { chatID: data.payload.chatID }
                    });
                    let subsc = channelOutput$.subscribe((data) => {
                        if (data.command !== chatListCommand.GET_CHAT) return;

                        this.pushList(data.payload.chat);
                        subsc.unsubscribe();
                    });
                }
            } else if (data.command === chatListCommand.MESSAGE) {
                let list = this.list$.getValue();
                let chatI = this.list$.getValue().findIndex((item) => item.id === data.payload.to);

                list[chatI].history.push(data.payload as message);
                this.setList(sortChatsByNewest(list));
            }
        });
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
        const subscribe = channelOutput$.subscribe((data) => {
            if (data.command === chatListCommand.MESSAGE && data.payload.to === chat.id) {
                last_message.textContent = data.payload.text;
            } else if (data.command === chatListCommand.SET_CHAT_PHOTO &&  data.payload.chatID === chat.id) {
                const timestamp = new Date().getTime();
                avatar.src = `${data.payload.photo}?timestamp=${timestamp}`;
            }
        });
        this.eventSList.push(subscribe);

        let list = this.list$.getValue();
        list.push(chat);
        this.list$.next(list);
        appendChild(this.chatListContainer, chatBlock);
    }

}