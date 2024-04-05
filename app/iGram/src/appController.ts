import {
    addToFriendCommand,
    addUserToGroupCommand,
    authFormCommand,
    chatBlockCommand,
    chatListCommand,
    chatMemberListCommand,
    chatSideBarCommand,
    componentsEvent,
    componentsID,
    createChatBlockCommand,
    credentials,
    IAppController,
    iChatsCache,
    iServer,
    listInvitedFriendsCommand,
    mainCommand,
    serverMessage,
    serverResponse,
    serverWS_COMMANDS
} from "../../../env/types";
import { Server } from "./modules/Server";
import { MainPage } from "./pages/main/main";
import { ChatsCache } from "./modules/Cash/ChatsCash/ChatsCache";
import { channelInput$, channelOutput$ } from "./modules/componentDataSharing";

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
            this.registerComponentEvent();
            this.root.appendChild(mainPage.createPageElement());
        });
    }

    registerComponentEvent() {
        channelInput$.subscribe((data) => {
            inputCommandHandler[data.id](data);
        });
        const inputCommandHandler: Record<componentsID, (data: componentsEvent) => void> = {
            [componentsID.addToFriend]: (data: componentsEvent): void => {
                inputAddToFriendHandler[data.command as addToFriendCommand](data);
            },
            [componentsID.addUserToGroup]: (data: componentsEvent): void => {
                inputAddUserToGroupHandler[data.command as addUserToGroupCommand](data);
            },
            [componentsID.authForm]: (data: componentsEvent): void => {
                inputAuthHandler[data.command as authFormCommand](data);
            },
            [componentsID.chatBlock]: (data: componentsEvent): void => {
                inputChatBlockHandler[data.command as chatBlockCommand](data);
            },
            [componentsID.chatList]: (data: componentsEvent): void => {
                inputChatListHandler[data.command as chatListCommand](data);
            },
            [componentsID.chatMemberList]: (data: componentsEvent): void => {
                inputChatMemberListHandler[data.command as chatMemberListCommand](data);
            },
            [componentsID.chatSideBar]: (data: componentsEvent): void => {
                inputChatSideBarHandler[data.command as chatSideBarCommand](data);
            },
            [componentsID.createChatBlock]: (data: componentsEvent): void => {
                inputCreateChatBlockHandler[data.command as createChatBlockCommand](data);
            },
            [componentsID.listInvitedFriends]: (data: componentsEvent): void => {
                inputListInvitedFriendsHandler[data.command as listInvitedFriendsCommand](data);
            },
            [componentsID.main]: (data: componentsEvent): void => {
                inputMainHandler[data.command as mainCommand](data);
            }
        };
        const inputAddToFriendHandler: Record<addToFriendCommand, (data: componentsEvent) => void> = {
            [addToFriendCommand.FRIEND_REQUEST]: (data: componentsEvent): void => {
                this.server.push(data as any);
            }
        };
        const inputAddUserToGroupHandler: Record<addUserToGroupCommand, (data: componentsEvent) => void> = {
            [addUserToGroupCommand.GET_CHAT]: (data): void => {
                this.chatsCache.addChat(data.payload.chatID);
                this.chatsCache.getChat(data.payload.chatID).then((chat: any) => {
                    if (chat) {
                        channelOutput$.next({
                            id: data.id,
                            command: data.command,
                            payload: {
                                chat: chat
                            }
                        });
                    }
                });
            },
            [addUserToGroupCommand.GET_CHATS]: (data: componentsEvent): void => {
                this.server.getChats().then((data2: any) => {
                    channelOutput$.next({
                        id: data.id,
                        command: data.command,
                        payload:{
                            data: data2.data
                        },
                        ...data2
                    });
                });
            },
            [addUserToGroupCommand.GET_FRIENDS]: (data: componentsEvent): void => {
                this.server.getFriendsList().then((data2: any) => {
                    channelOutput$.next({
                        id: data.id,
                        command: data.command,
                        payload:{
                            requests: data2.requests
                        },
                        ...data2
                    });
                });
            },
            [addUserToGroupCommand.FRIEND_ADD_TO_CHAT]: (data: componentsEvent): void => {
                this.server.push(data as any);
            }
        };
        const inputChatBlockHandler: Record<chatBlockCommand, (data: componentsEvent) => void> = {
            [chatBlockCommand.GET_CHAT]: (data: componentsEvent): void => {
                this.chatsCache.addChat(data.payload.chatID);
                this.chatsCache.getChat(data.payload.chatID).then((chat: any) => {
                    if (chat) {
                        channelOutput$.next({
                            id: data.id,
                            command: data.command,
                            payload: {
                                chat: chat
                            }
                        });
                    }
                });
            },
            [chatBlockCommand.LEAVE_CHAT]: (data: componentsEvent): void => {
                this.server.push(data as any);
            },
            [chatBlockCommand.MESSAGE]: (data: componentsEvent): void => {
                this.server.push(data as any);
            },
            [chatBlockCommand.SET_CHAT_PHOTO]: (data: componentsEvent): void => {
                this.server.push(data as any);
            }
        };
        const inputChatListHandler: Record<chatListCommand, (data: componentsEvent) => void> = {
            [chatListCommand.GET_CHAT]: (data: componentsEvent): void => {
                this.chatsCache.addChat(data.payload.chatID);
                this.chatsCache.getChat(data.payload.chatID).then((chat: any) => {
                    if (chat) {
                        channelOutput$.next({
                            id: data.id,
                            command: data.command,
                            payload: {
                                chat: chat
                            }
                        });
                    }
                });
            },
            [chatListCommand.GET_CHATS]: (data: componentsEvent): void => {
                this.server.getChats().then((data2: any) => {
                    channelOutput$.next({
                        id: data.id,
                        command: data.command,
                        payload:{
                          data: data2.data
                        },
                        ...data2
                    });
                });
            },
            [chatListCommand.CHAT_CREATED]: (data: componentsEvent): void => {
                this.server.push(data as any);
            },
            [chatListCommand.FRIEND_ADD_TO_CHAT]: (data: componentsEvent): void => {
                this.server.push(data as any);
            },
            [chatListCommand.LEAVE_CHAT]: (data: componentsEvent): void => {
                this.server.push(data as any);
            },
            [chatListCommand.MESSAGE]: (data: componentsEvent): void => {
                this.server.push(data as any);
            },
            [chatListCommand.SET_CHAT_PHOTO]: (data: componentsEvent): void => {
                this.server.push(data as any);
            }
        };
        const inputChatMemberListHandler: Record<chatMemberListCommand, (data: componentsEvent) => void> = {
            [chatMemberListCommand.GET_CHAT]: (data: componentsEvent): void => {
                this.chatsCache.addChat(data.payload.chatID);
                this.chatsCache.getChat(data.payload.chatID).then((chat: any) => {
                    if (chat) {
                        channelOutput$.next({
                            id: data.id,
                            command: data.command,
                            payload: {
                                chat: chat
                            }
                        });
                    }
                });
            },
            [chatMemberListCommand.ACTIVITY]: (): void => {
            },
            [chatMemberListCommand.FRIEND_ADD_TO_CHAT]: (data: componentsEvent): void => {
                this.server.push(data as any);
            },
            [chatMemberListCommand.LEAVE_CHAT]: (data: componentsEvent): void => {
                this.server.push(data as any);
            },
            [chatMemberListCommand.SET_USER_PHOTO]: (data: componentsEvent): void => {
                this.server.push(data as any);
            }
        };
        const inputChatSideBarHandler: Record<chatSideBarCommand, (data: componentsEvent) => void> = {
            [chatSideBarCommand.LEAVE_ACCOUNT]: (): void => {
                localStorage.setItem("jwt", null);
                this.server.isAuth$.next(false);
            },
            [chatSideBarCommand.SET_USER_PHOTO]: (data: componentsEvent): void => {
                this.server.push(data as any);
            }
        };
        const inputCreateChatBlockHandler: Record<createChatBlockCommand, (data: componentsEvent) => void> = {
            [createChatBlockCommand.GET_FRIENDS]: (data: componentsEvent): void => {
                this.server.getFriendsList().then((data2: any) => {
                    channelOutput$.next({
                        id: data.id,
                        command: data.command,
                        payload:{
                            requests: data2.requests
                        },
                        ...data2
                    });
                });
            },
            [createChatBlockCommand.CHAT_CREATED]: (data: componentsEvent): void => {
                this.server.push(data as any);
            }
        };
        const inputListInvitedFriendsHandler: Record<listInvitedFriendsCommand, (data: componentsEvent) => void> = {
            [listInvitedFriendsCommand.GET_FRIEND_REQUEST]: (data): void => {
                this.server.getFriendsInvites().then((data2: any) => {
                    channelOutput$.next({
                        id: data.id,
                        command: data.command,
                        payload: {
                            requests: data2.requests || []
                        },
                        ...data2
                    });
                });
            },
            [listInvitedFriendsCommand.FRIEND_REQUEST]: (): void => {
            },
            [listInvitedFriendsCommand.FRIEND_RESPONSE]: (data: componentsEvent): void => {
                this.server.push(data as any);
            },
            [listInvitedFriendsCommand.SET_USER_PHOTO]: (data: componentsEvent): void => {
                this.server.push(data as any);
            }
        };
        const inputAuthHandler: Record<authFormCommand, (data: componentsEvent) => void> = {
            [authFormCommand.LOGIN]: (data: componentsEvent): void => {
                this.server.login(data.payload.credentials as credentials).then((resp: any) => {
                    if (resp.status !== "OK") {
                        channelOutput$.next({
                            id: componentsID.authForm,
                            command: data.command,
                            payload: {
                                Error: resp.Error
                            }
                        });
                    }
                });
            },
            [authFormCommand.REGISTER]: (data: componentsEvent): void => {
                this.server.register(data.payload.credentials as credentials, data.payload.registerOptions).then((resp: any) => {
                    if (resp.status !== "OK") {
                        channelOutput$.next({
                            id: componentsID.authForm,
                            command: data.command,
                            payload: {
                                Error: resp.Error
                            }
                        });
                    }
                });
            }
        };
        const inputMainHandler: Record<mainCommand, (data: componentsEvent) => void> = {
            [mainCommand.GET_CHAT]: (data: componentsEvent): void => {
                this.chatsCache.addChat(data.payload.chatID);
                this.chatsCache.getChat(data.payload.chatID).then((chat: any) => {
                    if (chat) {
                        channelOutput$.next({
                            id: data.id,
                            command: data.command,
                            payload: {
                                chat: chat
                            }
                        });
                    }
                });
            },
            [mainCommand.GET_CHATS]: (data: componentsEvent): void => {
                this.server.getChats().then((data2: any) => {
                    channelOutput$.next({
                        id: data.id,
                        command: data.command,
                        payload:{
                            data: data2.data
                        },
                        ...data2
                    });
                });
            }
        };
        const serverEventHandler: Record<serverWS_COMMANDS, (event: serverMessage) => void> = {
            [serverWS_COMMANDS.FRIEND_REQUEST]: (event: serverMessage) => {
                channelOutput$.next(
                    {
                        id: componentsID.listInvitedFriends,
                        ...(event as any)
                    });
            },
            [serverWS_COMMANDS.CHAT_CREATED]: (event: serverMessage) => {
                channelOutput$.next({
                    id: componentsID.chatList,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.SET_USER_PHOTO]: (event: serverMessage) => {
                channelOutput$.next({
                    id:componentsID.listInvitedFriends,
                    ...(event as any)
                });
                channelOutput$.next({
                    id:componentsID.chatMemberList,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.SET_CHAT_PHOTO]: (event: serverMessage) => {
                channelOutput$.next({
                    id: componentsID.chatList,
                    ...(event as any)
                });
                channelOutput$.next({
                    id: componentsID.chatBlock,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.FRIEND_RESPONSE]: () => {
                // channelOutput$.next({
                //     ...(event as any)
                // });
            },
            [serverWS_COMMANDS.MESSAGE]: (event: serverMessage) => {
                channelOutput$.next({
                    id: componentsID.chatList,
                    ...(event as any)
                });
                channelOutput$.next({
                    id: componentsID.chatBlock,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.FRIEND_ADD_TO_CHAT]: (event: serverMessage) => {
                channelOutput$.next({
                    id: componentsID.chatList,
                    ...(event as any)
                });
                channelOutput$.next({
                    id: componentsID.chatMemberList,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.LEAVE_CHAT]: (event: serverMessage) => {
                channelOutput$.next({
                    id: componentsID.chatList,
                    ...(event as any)
                });
                channelOutput$.next({
                    id: componentsID.chatMemberList,
                    ...(event as any)
                });
            },
            [serverWS_COMMANDS.ACTIVITY]: (event: serverMessage) => {
                channelOutput$.next({
                    id: componentsID.chatMemberList,
                    ...(event as any)
                });
            }
        };
        this.server.event$.subscribe((event) => {
            serverEventHandler[event.command](event);
        });
    }

    // const requestDataHandler: Record<requestData_COMMANDS, (data: requestData) => void> = {
    //     [requestData_COMMANDS.CHATS]: () => {
    //         this.server.getChats().then((data) => {
    //             channelOutput$.next({
    //                 type: externalEventType.DATA,
    //                 command: requestData_COMMANDS.CHATS, ...data
    //             });
    //         });
    //     },
    //     [requestData_COMMANDS.FRIEND_REQUEST]: () => {
    //         this.server.getFriendsInvites().then((data) => {
    //             channelOutput$.next({
    //                 type: externalEventType.DATA,
    //                 command: requestData_COMMANDS.FRIEND_REQUEST,
    //                 requests: data.requests || [],
    //                 ...data
    //             });
    //         });
    //     },
    //     [requestData_COMMANDS.FRIENDS]: () => {
    //         this.server.getFriendsList().then((data) => {
    //             channelOutput$.next({
    //                 type: externalEventType.DATA,
    //                 command: requestData_COMMANDS.FRIENDS, ...data
    //             });
    //         });
    //     },
    //     [requestData_COMMANDS.CHAT]: (data: requestData) => {
    //         this.chatsCache.addChat(data.payload.chatID);
    //         this.chatsCache.getChat(data.payload.chatID).then((chat) => {
    //             if (chat) {
    //                 channelOutput$.next({
    //                     type: externalEventType.DATA,
    //                     command: requestData_COMMANDS.CHAT,
    //                     payload: {
    //                         chat: chat
    //                     }
    //                 });
    //             } else {
    //                 channelOutput$.next({
    //                     type: externalEventType.DATA,
    //                     command: requestData_COMMANDS.CHAT
    //                 });
    //             }
    //         });
    //     }
    // };
    // const componentsEventHandler: Record<componentsEvent_COMMANDS, (data: componentsEvent) => void> = {
    //     [componentsEvent_COMMANDS.FRIEND_REQUEST]: (data: componentsEvent) => this.server.push((data as any)),
    //     [componentsEvent_COMMANDS.FRIEND_RESPONSE]: (data: componentsEvent) => this.server.push((data as any)),
    //     [componentsEvent_COMMANDS.CHAT_CREATED]: (data: componentsEvent) => this.server.push((data as any)),
    //     [componentsEvent_COMMANDS.LEAVE_ACCOUNT]: () => {
    //         localStorage.setItem("jwt", null);
    //         this.server.isAuth$.next(false);
    //     },
    //     [componentsEvent_COMMANDS.SET_USER_PHOTO]: (data: componentsEvent) => this.server.push((data as any)),
    //     [componentsEvent_COMMANDS.LEAVE_CHAT]: (data: componentsEvent) => this.server.push((data as any)),
    //     [componentsEvent_COMMANDS.FRIEND_ADD_TO_CHAT]: (data: componentsEvent) => this.server.push((data as any)),
    //     [componentsEvent_COMMANDS.MESSAGE]: (data: componentsEvent) => this.server.push((data as any)),
    //     [componentsEvent_COMMANDS.LOGIN]: (data: componentsEvent) => {
    //         this.server.login(data.payload.credentials as credentials).then((resp) => {
    //             if (resp.status !== "OK") {
    //                 channelOutput$.next({
    //                     command: componentsEvent_COMMANDS.LOGIN,
    //                     type: externalEventType.DATA,
    //                     payload: {
    //                         error: resp.Error
    //                     }
    //                 });
    //             }
    //         });
    //     },
    //     [componentsEvent_COMMANDS.REGISTER]: (data: componentsEvent) => {
    //         this.server.register(data.payload.credentials as credentials, data.payload.registerOptions).then((resp) => {
    //             if (resp.status !== "OK") {
    //                 channelOutput$.next({
    //                     command: componentsEvent_COMMANDS.REGISTER,
    //                     type: externalEventType.DATA,
    //                     payload: {
    //                         error: resp.Error
    //                     }
    //                 });
    //             }
    //         });
    //
    //     },
    //     [componentsEvent_COMMANDS.REMOVE_FRIEND]: () => {
    //     },
    //     [componentsEvent_COMMANDS.ACTIVITY]: () => {
    //     },
    //     [componentsEvent_COMMANDS.SET_CHAT_PHOTO]: (data: componentsEvent) => this.server.push((data as any))
    // };
    // const serverEventHandler: Record<serverWS_COMMANDS, (event: serverMessage) => void> = {
    //     [serverWS_COMMANDS.FRIEND_REQUEST]: (event: serverMessage) => {
    //         channelOutput$.next(
    //             {
    //                 type: externalEventType.EVENT,
    //                 ...(event as any)
    //             });
    //     },
    //     [serverWS_COMMANDS.CHAT_CREATED]: (event: serverMessage) => {
    //         channelOutput$.next({
    //             type: externalEventType.EVENT,
    //             ...(event as any)
    //         });
    //     },
    //     [serverWS_COMMANDS.SET_USER_PHOTO]: (event: serverMessage) => {
    //         channelOutput$.next({
    //             type: externalEventType.EVENT,
    //             ...(event as any)
    //         });
    //     },
    //     [serverWS_COMMANDS.SET_CHAT_PHOTO]: (event: serverMessage) => {
    //         channelOutput$.next({
    //             type: externalEventType.EVENT,
    //             ...(event as any)
    //         });
    //     },
    //     [serverWS_COMMANDS.FRIEND_RESPONSE]: (event: serverMessage) =>{
    //         channelOutput$.next({
    //             type: externalEventType.EVENT,
    //             ...(event as any)
    //         });
    //     },
    //     [serverWS_COMMANDS.MESSAGE]: (event: serverMessage)=>{
    //         channelOutput$.next({
    //             type: externalEventType.EVENT,
    //             ...(event as any)
    //         });
    //     },
    //     [serverWS_COMMANDS.FRIEND_ADD_TO_CHAT]: (event: serverMessage)=>{
    //         channelOutput$.next({
    //             type: externalEventType.EVENT,
    //             ...(event as any)
    //         });
    //     },
    //     [serverWS_COMMANDS.LEAVE_CHAT]: (event: serverMessage)=> {
    //         channelOutput$.next({
    //             type: externalEventType.EVENT,
    //             ...(event as any)
    //         });
    //     },
    //     [serverWS_COMMANDS.ACTIVITY]: (event: serverMessage)=>{
    //         channelOutput$.next({
    //             type: externalEventType.EVENT,
    //             ...(event as any)
    //         });
    //     },
    // };
    // mainPage.requestData$.subscribe((data) => {
    //     requestDataHandler[data.command](data);
    // });
    // mainPage.componentsEvent$.subscribe((data) => {
    //     componentsEventHandler[data.command](data);
    // });
    // this.server.event$.subscribe((event) => {
    //     serverEventHandler[event.command](event)
    // });
}
