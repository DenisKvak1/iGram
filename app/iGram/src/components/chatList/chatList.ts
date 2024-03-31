import {
    componentsEvent,
    componentsEvent_COMMANDS,
    externalData,
    externalEventType,
    iChat,
    iObservable,
    message,
    requestData,
    requestData_COMMANDS
} from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { Observable } from "../../../../../env/helpers/observable";
import { chatElementT, chatListT } from "./template";
import "./style.css";
import { sortChatsByNewest } from "../../hook/sortChat";

export class ChatList {
    chatListContainer: HTMLElement;
    selectChat$: iObservable<string>;
    private list$: iObservable<Array<iChat>>;
    eventSList: Array<{ unsubscribe: () => void }>;
    externalEvent$: iObservable<externalData>;
    requestData$: iObservable<requestData>;
    event$: iObservable<componentsEvent>;

    constructor() {
        this.list$ = new Observable<Array<iChat>>([]);
        this.selectChat$ = new Observable<string>();
        this.eventSList = [];

        this.externalEvent$ = new Observable<externalData>;
        this.requestData$ = new Observable<requestData>();
        this.event$ = new Observable<componentsEvent>();
    }

    createElement() {
        this.chatListContainer = createElementFromHTML(chatListT);
        this.requestData$.next({ command: requestData_COMMANDS.CHATS });
        let subsc = this.externalEvent$.subscribe((data) => {
            if (data.command === requestData_COMMANDS.CHATS && data.type === externalEventType.DATA) {
                this.setList(sortChatsByNewest(data.data));
                subsc.unsubscribe();
            }
        });

        this.externalEvent$.subscribe((data) => {
            if (data.command === componentsEvent_COMMANDS.CHAT_CREATED && data.type === externalEventType.EVENT) {
                this.pushList(data.payload.chat);
            } else if (data.command === componentsEvent_COMMANDS.LEAVE_CHAT && data.type === externalEventType.EVENT) {
                if (this.selectChat$.getValue() === data.payload.chatID && localStorage.getItem("email") === data.payload.user.email) {
                    let list = this.list$.getValue();
                    list = list.filter((item) => item.id !== data.payload.chatID);
                    this.setList(list);
                    this.selectChat$.next(null);
                }
            } else if (data.command === componentsEvent_COMMANDS.FRIEND_ADD_TO_CHAT && data.type === externalEventType.EVENT) {
                if (localStorage.getItem("email") === data.payload.user.email) {
                    this.requestData$.next({
                        command: requestData_COMMANDS.CHAT,
                        payload: { chatID: data.payload.chatID }
                    });
                    let subsc = this.externalEvent$.subscribe((data) => {
                        if (data.command === requestData_COMMANDS.CHAT) {
                            this.pushList(data.payload.chat);
                            subsc.unsubscribe();
                        }
                    });
                }
            } else if (data.command === componentsEvent_COMMANDS.MESSAGE) {
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
        const subscribe = this.externalEvent$.subscribe((data) => {
            if (data.command === componentsEvent_COMMANDS.MESSAGE && data.payload.to === chat.id) {
                last_message.textContent = data.payload.text;
            } else if (data.command === componentsEvent_COMMANDS.SET_CHAT_PHOTO && data.payload.chatID === chat.id) {
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