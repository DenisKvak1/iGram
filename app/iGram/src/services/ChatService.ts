import {
    ChatUserInfo, fromChat,
    iChat,
    IChatService,
    IChatManager,
    iObservable,
    message,
    messageClient,
    serverWS_COMMANDS
} from "../../../../env/types";
import { server } from "../modules/Server";
import { chatsCache } from "../modules/Cash/ChatsCash/ChatsCache";
import { Observable } from "../../../../env/helpers/observable";

export class ChatService implements IChatService {
    private readonly chatID: string;
    message$: iObservable<message>;
    setPhoto$: iObservable<{ chatID: string, photo: string }>;

    constructor(chatID: string) {
        this.chatID = chatID;

        this.init();
    }

    private init(): void {
        this.setupEvents();
    }

    private setupEvents() {
        this.setupMessageEvent();
        this.setupSetPhotoEvent();
    }

    addUser(login: string): void {
        server.push({
            command: serverWS_COMMANDS.FRIEND_ADD_TO_CHAT,
            payload: {
                chatID: this.chatID,
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

    getChat(callback: (chat: iChat) => void): void {
        chatsCache.addChat(this.chatID);
        chatsCache.getChat(this.chatID).then((chat: any) => {
            if (chat) {
                callback(chat);
            }
        });
    }

    setPhoto(photo: ArrayBuffer): void {
        server.push({
            command: serverWS_COMMANDS.SET_CHAT_PHOTO,
            payload: {
                photo,
                chatID: this.chatID
            }
        });
    }

    leaveChat(): void {
        server.push({
            command: serverWS_COMMANDS.LEAVE_CHAT,
            payload: {
                chatID: this.chatID
            }
        });
    }

    private setupSetPhotoEvent(): void {
        this.setPhoto$ = new Observable<{ chatID: string, photo: string }>();
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.SET_CHAT_PHOTO) return;
            if (msg.payload.chatID !== this.chatID) return;

            this.setPhoto$.next(msg.payload as any);
        });
    }

    private setupMessageEvent(): void {
        this.message$ = new Observable<message>();
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.MESSAGE) return;
            if (msg.payload.to !== this.chatID) return;

            this.message$.next(msg.payload as message);
        });
    }
}

export class ChatManager implements IChatManager {
    chatCreated$: iObservable<fromChat>;
    message$: iObservable<message>;
    leaveChat$: iObservable<ChatUserInfo>;
    addMember$: iObservable<ChatUserInfo>;

    constructor() {
        this.init();
    }

    private init(): void {
        this.setupEvents();
    }

    private setupEvents(): void {
        this.setupLeaveChatEvent();
        this.setupChatCreateEvent();
        this.setupMessageEvent();
        this.setupAddMemberEvent();
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

    getChats(callback: (chats: Array<iChat>) => void): void {
        server.getChats().then((chats: any) => {
            callback(chats.data);
        });
    }


    private setupChatCreateEvent() {
        this.chatCreated$ = new Observable<{ from: string, chat: iChat }>();
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.CHAT_CREATED) return;

            this.chatCreated$.next(msg.payload as fromChat);
        });
    }

    private setupLeaveChatEvent(): void {
        this.leaveChat$ = new Observable<ChatUserInfo>();
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.LEAVE_CHAT) return;

            this.leaveChat$.next(msg.payload as ChatUserInfo);
        });
    }

    private setupMessageEvent(): void {
        this.message$ = new Observable<message>();
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.MESSAGE) return;

            this.message$.next(msg.payload as message);
        });
    }

    private setupAddMemberEvent(): void {
        this.addMember$ = new Observable<ChatUserInfo>();
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.FRIEND_ADD_TO_CHAT) return;

            this.addMember$.next(msg.payload as ChatUserInfo);
        });
    }
}

export const chatManager = new ChatManager();