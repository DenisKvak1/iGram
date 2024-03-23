import {
    componentsEvent,
    componentsEvent_COMMANDS,
    credentials,
    externalEventType,
    IAppController,
    iChatsCache,
    iServer, requestData,
    requestData_COMMANDS,
    serverMessage,
    serverResponse, serverWS_COMMANDS
} from "../../../env/types";
import { Server } from "./modules/Server";
import { MainPage } from "./pages/main/main";
import { ChatsCache } from "./modules/Cash/ChatsCash/ChatsCache";

export let server: iServer;

export class AppController implements IAppController {
    private static instance: AppController;
    chatsCache: iChatsCache;
    server: iServer;
    root: HTMLElement;

    private constructor() {
        this.root = document.getElementById("app");
        this.server = new Server("http://127.0.0.1:3000", "ws:///127.0.0.1:3000");
        server = this.server;
        this.server.checkAuth().then((resp: serverResponse) => {
            this.server.isAuth$.next(resp.status === "OK");
        });
        this.server.isAuth$.once(() => {
            this.init();
        });
        this.chatsCache = new ChatsCache();
    }

    static getInstance(): AppController {
        if (!AppController.instance) {
            AppController.instance = new AppController();
        }
        return AppController.instance;
    }

    private init() {
        this.server.ready$.onceOr(this.server.ready$.getValue(), () => {
            const mainPage = new MainPage(this.server.isAuth$);
            this.registerComponentEvent(mainPage);
            this.root.appendChild(mainPage.createPageElement());
        });
    }

    registerComponentEvent(mainPage: MainPage) {
        const requestDataHandler: Record<requestData_COMMANDS, (data: requestData) => void> = {
            [requestData_COMMANDS.CHATS]: () => {
                this.server.getChats().then((data) => {
                    mainPage.externalEvent$.next({
                        type: externalEventType.DATA,
                        command: requestData_COMMANDS.CHATS, ...data
                    });
                });
            },
            [requestData_COMMANDS.FRIEND_REQUEST]: () => {
                this.server.getFriendsInvites().then((data) => {
                    mainPage.externalEvent$.next({
                        type: externalEventType.DATA,
                        command: requestData_COMMANDS.FRIEND_REQUEST, ...data
                    });
                });
            },
            [requestData_COMMANDS.FRIENDS]: () => {
                this.server.getFriendsList().then((data) => {
                    mainPage.externalEvent$.next({
                        type: externalEventType.DATA,
                        command: requestData_COMMANDS.FRIENDS, ...data
                    });
                });
            },
            [requestData_COMMANDS.CHAT]: (data: requestData) => {
                this.chatsCache.addChat(data.payload.chatID);
                this.chatsCache.getChat(data.payload.chatID).then((chat) => {
                    if (chat) {
                        mainPage.externalEvent$.next({
                            type: externalEventType.DATA,
                            command: requestData_COMMANDS.CHAT,
                            payload: {
                                chat: chat
                            }
                        });
                    } else {
                        mainPage.externalEvent$.next({
                            type: externalEventType.DATA,
                            command: requestData_COMMANDS.CHAT
                        });
                    }
                });
            }
        };
        const componentsEventHandler: Record<componentsEvent_COMMANDS, (data: componentsEvent) => void> = {
            [componentsEvent_COMMANDS.FRIEND_REQUEST]: (data: componentsEvent) => this.server.push((data as any)),
            [componentsEvent_COMMANDS.FRIEND_RESPONSE]: (data: componentsEvent) => this.server.push((data as any)),
            [componentsEvent_COMMANDS.CHAT_CREATED]: (data: componentsEvent) => this.server.push((data as any)),
            [componentsEvent_COMMANDS.LEAVE_ACCOUNT]: () => {
                localStorage.setItem("jwt", null);
                this.server.isAuth$.next(false);
            },
            [componentsEvent_COMMANDS.SET_USER_PHOTO]: (data: componentsEvent) => this.server.push((data as any)),
            [componentsEvent_COMMANDS.LEAVE_CHAT]: (data: componentsEvent) => this.server.push((data as any)),
            [componentsEvent_COMMANDS.FRIEND_ADD_TO_CHAT]: (data: componentsEvent) => this.server.push((data as any)),
            [componentsEvent_COMMANDS.MESSAGE]: (data: componentsEvent) => this.server.push((data as any)),
            [componentsEvent_COMMANDS.LOGIN]: (data: componentsEvent) => {
                this.server.login(data.payload.credentials as credentials).then((resp) => {
                    if (resp.status !== "OK") {
                        mainPage.externalEvent$.next({
                            command: componentsEvent_COMMANDS.LOGIN,
                            type: externalEventType.DATA,
                            payload: {
                                error: resp.Error
                            }
                        });
                    }
                });
            },
            [componentsEvent_COMMANDS.REGISTER]: (data: componentsEvent) => {
                this.server.register(data.payload.credentials as credentials, data.payload.registerOptions).then((resp) => {
                    if (resp.status !== "OK") {
                        mainPage.externalEvent$.next({
                            command: componentsEvent_COMMANDS.REGISTER,
                            type: externalEventType.DATA,
                            payload: {
                                error: resp.Error
                            }
                        });
                    }
                });

            },
            [componentsEvent_COMMANDS.REMOVE_FRIEND]: () => {
            },
            [componentsEvent_COMMANDS.ACTIVITY]: () => {
            },
            [componentsEvent_COMMANDS.SET_CHAT_PHOTO]: () => {
            }
        };
        const serverEventHandler: Record<serverWS_COMMANDS, (event: serverMessage) => void> = {
            [serverWS_COMMANDS.FRIEND_REQUEST]: (event: serverMessage) => {
                mainPage.externalEvent$.next(
                    {
                        type: externalEventType.EVENT,
                        ...(event as any)
                    });
            },
            [serverWS_COMMANDS.CHAT_CREATED]: (event: serverMessage) => {
                mainPage.externalEvent$.next({
                    type: externalEventType.EVENT,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.SET_USER_PHOTO]: (event: serverMessage) => {
                mainPage.externalEvent$.next({
                    type: externalEventType.EVENT,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.SET_CHAT_PHOTO]: (event: serverMessage) => {
                mainPage.externalEvent$.next({
                    type: externalEventType.EVENT,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.FRIEND_RESPONSE]: (event: serverMessage) =>{
                mainPage.externalEvent$.next({
                    type: externalEventType.EVENT,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.MESSAGE]: (event: serverMessage)=>{
                mainPage.externalEvent$.next({
                    type: externalEventType.EVENT,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.FRIEND_ADD_TO_CHAT]: (event: serverMessage)=>{
                mainPage.externalEvent$.next({
                    type: externalEventType.EVENT,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.LEAVE_CHAT]: (event: serverMessage)=> {
                mainPage.externalEvent$.next({
                    type: externalEventType.EVENT,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.ACTIVITY]: (event: serverMessage)=>{
                mainPage.externalEvent$.next({
                    type: externalEventType.EVENT,
                    ...(event as any)
                });
            },
        };
        mainPage.requestData$.subscribe((data) => {
            requestDataHandler[data.command](data);
        });
        mainPage.componentsEvent$.subscribe((data) => {
            componentsEventHandler[data.command](data);
        });
        this.server.event$.subscribe((event) => {
            serverEventHandler[event.command](event)
        });
    }
}
