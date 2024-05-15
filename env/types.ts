import { listObserver } from "./reactivity2.0/types";

export type iCollector = {
    collect(...collectible: iSubscribe[]): void
    clear(): void
}
export type iSubscribe = { unsubscribe: () => void }
export type iObservable<T> = {
    subscribe: (callback: (eventData: T) => void) => iSubscribe;
    next: (eventData?: T) => void
    unsubscribeAll: () => void
    getValue: () => T
    setValue: (value: T) => void
    once: (callback: (eventData?: T) => void) => void
    onceOr: (conditions: boolean, callback: (eventData?: T) => void) => void
}
export type iServer = {
    webSocket: WebSocket
    event$: iObservable<serverMessage>
    push: (message: serverMessage) => void
    register: (loginValue: credentials, options: registerOptions) => Promise<serverResponse>
    getUserInfo: (login: string) => Promise<serverResponse>
    getFriendsInvites: () => Promise<serverResponse>
    getFriendsList: () => Promise<serverResponse>
    login: (loginValue: credentials) => Promise<serverResponse>
    checkAuth: () => Promise<serverResponse>
    getChats: () => Promise<serverResponse>
    getChat: (id: string) => Promise<serverResponse>
    ready$: iObservable<boolean>
}

export const enum serverWS_COMMANDS {
    LOGIN = "login",
    ADD_FRIEND = "addFriend",
    FRIEND_REQUEST = "friendRequest",
    FRIEND_RESPONSE = "friendResponse",
    CHAT_CREATED = "chatCreated",
    FRIEND_ADD_TO_CHAT = "friendAddedToChat",
    SET_CHAT_PHOTO = "setChatPhoto",
    SET_USER_PHOTO = "setUserPhoto",
    LEAVE_CHAT = "leaveChat",
    MESSAGE = "message",
    ACTIVITY = "activity"
}

export type componentsEvent = {
    id: componentsID
    command: string
    payload?: Partial<{
        from: UserInfo | string
        to: string
        text: string
        login: string
        logins: Array<string>
        chatName: string
        chat: iChat
        accept: boolean
        chatID: string
        timestamp: string
        photo: ArrayBuffer,
        user: UserInfo
        credentials: { [key: string]: string }
        registerOptions: registerOptions
        status: RESPONSE_STATE
        Error: string
        data: Array<iChat>
        requests: Array<UserInfo>
        jwt: string,
        email: string
    }>
}

export type iComponent = {
    getComponent: () => HTMLElement
    destroy: () => void
}

export const enum componentsID {
    main = "main",
    addToFriend = "addToFriend",
    addUserToGroup = "addUserToGroup",
    chatBlock = "chatBlock",
    chatList = "chatList",
    chatMemberList = "chatMemberList",
    chatSideBar = "chatSideBar",
    createChatBlock = "createChatBlock",
    listInvitedFriends = "listInvitedFriends",
    authForm = "authForm"
}


export const enum chatSideBarCommand {
    LEAVE_ACCOUNT = "LEAVE_ACCOUNT",
}


export const enum authFormCommand {
    LOGIN = "LOGIN",
    REGISTER = "REGISTER",
}

export type serverResponse = {
    status: RESPONSE_STATE
    Error?: string
    data?: Array<iChat>
    requests?: Array<UserInfo>
    jwt?: string,
    email?: string

    [key: string]: any
}
export type credentials = {
    email: string
    password: string
}
export type registerOptions = {
    name: string
}

export const enum RESPONSE_STATE {
    OK = "OK",
    ERROR = "ERROR"
}

export type iReactiveMessage = {
    from: iReactiveUserInfo
    to: string
    text: iObservable<string>
    photo: iObservable<string>
    timestamp: string
    destroy: () => void
};
export type fromChat = {
    from: string,
    chat: iReactiveChatInfo
};
export type ChatUserInfo = {
    chatID: string;
    user: iReactiveUserInfo;
};
export type iReactiveChatInfo = {
    id: string;
    chatName: iObservable<string>;
    members: listObserver<iReactiveUserInfo>;
    history: listObserver<iReactiveMessage>
    photo: iObservable<string>;
    destroy: () => void
}
export type UserInfo = {
    email: string
    name: string
    friends: Array<string>
    photo: string
    lastActivity: string
}
export type iReactiveUserInfo = {
    email: iObservable<string>
    name: iObservable<string>
    friends: iObservable<Array<string>>
    userPhoto: iObservable<string>
    lastActivity: iObservable<string>
    destroy: () => void
}
export type iChat = {
    id: string
    chatName: string,
    members: Array<UserInfo>
    history: Array<message>
    photo?: string
}

export type serverMessage = {
    command: serverWS_COMMANDS
    payload?: {
        from?: UserInfo | string
        to?: string
        text?: string
        login?: string
        logins?: Array<string>
        chatName?: string
        chat?: iChat
        accept?: boolean
        chatID?: string
        timestamp?: string
        photo?: ArrayBuffer | string,
        user?: UserInfo
    }
}
export type message = {
    from: UserInfo,
    to?: string,
    photo?: string,
    text: string,
    timestamp: string
}
export type messageClient = {
    from: string,
    to?: string,
    text: string,
    photo?: string | ArrayBuffer,
    timestamp?: string
}
export type IEmojiParser = {
    getEmojiBySymbol(symbol: string): string
    parseToEmoji(string: string): string
    parseFromEmoji(string: string): string
}
export type IInputMessageParser = {
    parseMessage(string: string): string
}
export type IOutputMessageParser = {
    parseMessage(string: string): string
}
// export const enum MESSAGE_STATE {
//     PENDING = "PENDING",
//     SENT = "SENT",
//     RECEIVED = "RECEIVED",
//     READ = "READ"
// }
export type IAuthController = {
    isAuth$: iObservable<boolean>;
    login: (credentials: credentials, errorCallback: Function) => void
    register: (credentials: credentials, registerOptions: registerOptions, errorCallback: Function) => void
    logout: () => void
}
export type IUserService = {
    setPhoto$: iObservable<UserInfo>;
    activity$: iObservable<UserInfo>;
    friendRequest$: iObservable<iReactiveUserInfo>;
    setPhoto: (photo: ArrayBuffer) => void;
    friendRequest: (login: string) => void;
    friendResponse: (login: string, accept: boolean) => void;
    getFriendsList: (callback: (FriendList: Array<UserInfo>) => void) => void;
    getReactiveFriendsList: (callback: (FriendInviteList: Array<iReactiveUserInfo>) => void) => void
    getFriendsInviteList: (callback: (FriendInviteList: Array<UserInfo>) => void) => void;
    getReactiveFriendsInviteList: (callback: (FriendInviteList: Array<iReactiveUserInfo>) => void) => void
    getUserInfo: (login: string, callback: (UserInfo: UserInfo) => void) => void;
};
export type IChatService = {
    load$: iObservable<boolean>
    chat$: iObservable<iReactiveChatInfo>;
    pushMessage$: iObservable<message>;
    setPhoto$: iObservable<{ chatID: string, photo: string }>;
    addMember$: iObservable<UserInfo>;
    setPhoto: (photo: ArrayBuffer) => void
    pushMessage: (message: messageClient) => void
    addUser: (login: string) => void
    leaveChat: () => void
}
export type IChatManager = {
    leaveChat$: iObservable<ChatUserInfo>;
    message$: iObservable<message>;
    chatCreated$: iObservable<fromChat>;
    addMember$: iObservable<ChatUserInfo>
    createChat: (login: Array<string>, chatName: string) => void
    getChats: () => Promise<Array<iChat>>
    getReactiveChats: () => Promise<Array<iReactiveChatInfo>>
    getChat: (chatID: string) => Promise<iChat>
    getReactiveChat: (chatID: string) => Promise<iReactiveChatInfo>
}
export type IAppController = {
    root: HTMLElement
}
export type iPopover = {
    open: () => void,
    close: () => void,
    toggle: () => void
}
export type authBlockOptions = {
    buttonName: string
    inputs: Array<authBlockInput>
}
export type authBlockInput = {
    nameInCredential: string,
    placeHolder: string,
    regExp?: string
}
export type IAuthForm = {
    createAuthBlock: () => HTMLElement
    event$: iObservable<any>;
}
export type IInputCommandHandler = Record<componentsID, (data: componentsEvent) => void>

export type iModal = {
    close$: iObservable<null>
    setContent: (content: string | Element) => void;
    setOptions: (options: IModalOptions) => void;
    open: () => void;
    close: () => void;
    destroy: () => void;
}
export type IModalOptions = {
    boxShadow?: string,
    background?: string
    width?: number;
    maxWidth?: string
    height?: number;
    maxHeight?: string
    bgColor?: string;
    bgOverlayColor?: string;
    padding?: string
    borderRadius?: string
    [key: string]: string | number
};
export type iModalOptionsFunc = {
    width?: (width: number) => void;
    maxWidth?: (maxWidth: string) => void;
    height?: (height: number) => void;
    maxHeight?: (maxHeight: string) => void;
    bgColor?: (color: string) => void;
    background: (color: string) => void,
    bgOverlayColor?: (color: number) => void;
    [key: string]: (argument: string | number) => void
}
export type iCache<T> = {
    data: T;
    time: number;
    startTime: number;
    currentTime: number;
    callback: Function;
    getData(): Promise<T>;
    setData(data: T): void;
    resetCache(): void;
}
export type iChatsCache = {
    cashBD: { [key: string]: iCache<Promise<iChat>> };
    addChat(chatId: string): void;
    getChat(id: string): Promise<iChat | undefined>;
}
