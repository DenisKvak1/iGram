import {
    ChatUserInfo,
    fromChat,
    iChat,
    IChatManager,
    IChatService,
    iObservable,
    iReactiveChatInfo,
    message,
    messageClient,
    serverWS_COMMANDS,
    UserInfo
} from "../../../../env/types";
import { server } from "../modules/Server";
import { chatsCache } from "../modules/Cash/ChatsCash/ChatsCache";
import { Observable } from "../../../../env/helpers/observable";
import { ReactiveChatData } from "./ReactivityChatInfo";
import { computed } from "../../../../env/reactivity2.0/computed";

export class SelectChatService implements IChatService {
    load$ = new Observable<boolean>(false);
    chat$ = new Observable<iReactiveChatInfo>();
    pushMessage$: iObservable<message>;
    setPhoto$: iObservable<{ chatID: string, photo: string }>;
    addMember$: iObservable<UserInfo>;

    constructor() {
        this.init();
    }

    private init(): void {
        this.setupEvents();
        this.initChat();
    }

    private initChat() {
        if (chatManager.selectChat$.getValue()) {
            chatManager.getReactiveChat(chatManager.selectChat$.getValue()).then((chat) => {
                this.chat$.next(chat);
                this.load$.next(true);
            });
        } else {
            this.load$.next(true);
        }

        chatManager.selectChat$.subscribe((chatID) => {
            chatManager.getReactiveChat(chatID).then((chat) => {
                this.chat$.next(chat);
            });
        });
    }

    private setupEvents() {
        this.setupMessageEvent();
        this.setupSetPhotoEvent();
    }

    addUser(login: string): void {
        const selectChat = chatManager.selectChat$.getValue();
        server.push({
            command: serverWS_COMMANDS.FRIEND_ADD_TO_CHAT,
            payload: {
                chatID: selectChat,
                login
            }
        });
    }

    pushMessage(message: messageClient): void {
        server.push({
            command: serverWS_COMMANDS.MESSAGE,
            payload: message
        });
    }


    setPhoto(photo: ArrayBuffer): void {
        const selectChat = chatManager.selectChat$.getValue();
        server.push({
            command: serverWS_COMMANDS.SET_CHAT_PHOTO,
            payload: {
                photo,
                chatID: selectChat
            }
        });
    }

    leaveChat(): void {
        const selectChat = chatManager.selectChat$.getValue();
        server.push({
            command: serverWS_COMMANDS.LEAVE_CHAT,
            payload: {
                chatID: selectChat
            }
        });
    }


    private setupSetPhotoEvent(): void {
        this.setPhoto$ = computed(chatManager.setPhoto$, (): void | string => {
            const setPhotoEvent = chatManager.setPhoto$.getValue();
            const selectChat = chatManager.selectChat$.getValue();
            if (selectChat !== setPhotoEvent?.chatID) return;

            return setPhotoEvent.photo;
        }).observer;
    }

    private setupMessageEvent(): void {
        this.pushMessage$ = computed(chatManager.message$, (): void | message => {
            const msg = chatManager.message$.getValue();
            const selectChat = chatManager.selectChat$.getValue();
            if (msg?.to !== selectChat) return;

            return msg;
        }).observer;
    }
}

export class ChatManager implements IChatManager {
    chatCreated$: iObservable<fromChat>;
    message$: iObservable<message>;
    leaveChat$: iObservable<ChatUserInfo>;
    addMember$: iObservable<ChatUserInfo>;
    selectChat$: iObservable<string>;
    setPhoto$: iObservable<{ chatID: string, photo: string }>;

    constructor() {
        this.init();
    }

    private init(): void {
        this.createObservers();
        this.setupEvents();
    }

    private setupEvents(): void {
        this.setupLeaveChatEvent();
        this.setupChatCreateEvent();
        this.setupMessageEvent();
        this.setupAddMemberEvent();
        this.setupSetPhotoEvent();
    }

    private createObservers() {
        this.chatCreated$ = new Observable<fromChat>();
        this.leaveChat$ = new Observable<ChatUserInfo>();
        this.message$ = new Observable<message>();
        this.addMember$ = new Observable<ChatUserInfo>();
        this.setPhoto$ = new Observable();
        this.selectChat$ = new Observable("");
    }

    createChat(logins: Array<string>, chatName: string): void {
        server.push({
            command: serverWS_COMMANDS.CHAT_CREATED,
            payload: {
                chatName,
                logins
            }
        });
    }

    async getChats() {
        const chats = await server.getChats();
        return chats.data;
    }

    async getReactiveChats() {
        const chats = await server.getChats();
        const reactiveChat = chats.data.map((chat: iChat) => new ReactiveChatData(chat));
        return reactiveChat;
    }

    async getChat(chatID: string) {
        chatsCache.addChat((chatID));
        const chat = await chatsCache.getChat((chatID));

        return chat;
    }

    async getReactiveChat(chatID: string) {
        chatsCache.addChat((chatID));
        const chat = await chatsCache.getChat((chatID));
        const reactiveChat = new ReactiveChatData(chat);

        return reactiveChat;
    }

    private setupChatCreateEvent() {
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.CHAT_CREATED) return;

            const chat = new ReactiveChatData(msg.payload.chat);
            this.chatCreated$.next({ from: msg.payload.from as string, chat: chat });
        });
    }

    private setupLeaveChatEvent(): void {
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.LEAVE_CHAT) return;

            this.leaveChat$.next(msg.payload as ChatUserInfo);
        });
    }

    private setupMessageEvent(): void {
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.MESSAGE) return;

            this.message$.next(msg.payload as message);
        });
    }

    private setupAddMemberEvent(): void {
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.FRIEND_ADD_TO_CHAT) return;

            this.addMember$.next(msg.payload as ChatUserInfo);
        });
    }

    private setupSetPhotoEvent(): void {
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.SET_CHAT_PHOTO) return;

            this.setPhoto$.next(msg.payload as any);
        });
    }
}

export const chatManager = new ChatManager();
export const selectChatService = new SelectChatService();

(window as any).chatManager = chatManager;
(window as any).selectChatServer = selectChatService;