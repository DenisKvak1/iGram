import {
    ChatUserInfo,
    fromChat,
    iChat,
    IChatManager,
    IChatService,
    iObservable,
    iReactiveChatInfo, iServer,
    message,
    messageClient,
    serverWS_COMMANDS,
    UserInfo
} from "../../../../env/types";
import { chatsCache } from "../modules/Cash/ChatsCash/ChatsCache";
import { Observable } from "../../../../env/helpers/observable";
import { ReactiveChatData } from "./ReactivityChatInfo";
import { computed } from "../../../../env/reactivity2.0/computed";
import { ReactiveUserInfo } from "./ReactiveUserInfo";
import { server } from "../modules/Server";

export class CurrentChatService implements IChatService {
    private server: iServer;
    load$ = new Observable<boolean>(false);
    chat$ = new Observable<iReactiveChatInfo>();
    pushMessage$: iObservable<message>;
    setPhoto$: iObservable<{ chatID: string, photo: string }>;
    addMember$: iObservable<UserInfo>;

    constructor(server: iServer) {
        this.server = server;

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
        this.server.push({
            command: serverWS_COMMANDS.FRIEND_ADD_TO_CHAT,
            payload: {
                chatID: selectChat,
                login
            }
        });
    }

    pushMessage(message: messageClient): void {
        this.server.push({
            command: serverWS_COMMANDS.MESSAGE,
            payload: message
        });
    }


    setPhoto(photo: ArrayBuffer): void {
        const selectChat = chatManager.selectChat$.getValue();
        this.server.push({
            command: serverWS_COMMANDS.SET_CHAT_PHOTO,
            payload: {
                photo,
                chatID: selectChat
            }
        });
    }

    leaveChat(): void {
        const selectChat = chatManager.selectChat$.getValue();
        this.server.push({
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
    private server: iServer
    chatCreated$: iObservable<fromChat>;
    message$: iObservable<message>;
    leaveChat$: iObservable<ChatUserInfo>;
    addMember$: iObservable<ChatUserInfo>;
    selectChat$: iObservable<string>;
    setPhoto$: iObservable<{ chatID: string, photo: string }>;

    constructor(server:iServer) {
        this.server = server

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
        this.server.push({
            command: serverWS_COMMANDS.CHAT_CREATED,
            payload: {
                chatName,
                logins
            }
        });
    }

    async getChats() {
        const chats = await this.server.getChats();
        return chats.data;
    }

    async getReactiveChats() {
        const chats = await this.server.getChats();
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
        this.server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.CHAT_CREATED) return;

            const chat = new ReactiveChatData(msg.payload.chat);
            this.chatCreated$.next({ from: msg.payload.from as string, chat: chat });
        });
    }

    private setupLeaveChatEvent(): void {
        this.server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.LEAVE_CHAT) return;
            const message = {
                chatID: msg.payload.chatID,
                user: new ReactiveUserInfo(msg.payload.user)
            };
            this.leaveChat$.next(message);
        });
    }

    private setupMessageEvent(): void {
        this.server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.MESSAGE) return;

            this.message$.next(msg.payload as message);
        });
    }

    private setupAddMemberEvent(): void {
        this.server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.FRIEND_ADD_TO_CHAT) return;
            const message = {
                chatID: msg.payload.chatID,
                user: new ReactiveUserInfo(msg.payload.user)
            };
            this.addMember$.next(message);
        });
    }

    private setupSetPhotoEvent(): void {
        this.server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.SET_CHAT_PHOTO) return;

            this.setPhoto$.next(msg.payload as any);
        });
    }
}

export const chatManager = new ChatManager(server);
export const currentChatService = new CurrentChatService(server);
