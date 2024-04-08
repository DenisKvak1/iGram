export type iObservable<T> = {
    subscribe: (callback: (eventData: T) => void) => { unsubscribe: () => void };
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
    createElement: () => void
    getElement: () => void
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

export type fromChat = {
    from: string,
    chat: iChat
};
export type ChatUserInfo = {
    chatID: string;
    user: UserInfo;
};
export type UserInfo = {
    email: string
    name: string
    friends: Array<string>
    photo: string
    lastActivity: string
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
    payload: {
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
        photo?: ArrayBuffer,
        user?: UserInfo
    }
}
export type message = {
    from: UserInfo,
    fromName: string
    to?: string,
    text: string,
    timestamp: string
}
export type messageClient = {
    from: string,
    fromName?: string
    to?: string,
    text: string,
    timestamp?: string
}
// export const enum MESSAGE_STATE {
//     PENDING = "PENDING",
//     SENT = "SENT",
//     RECEIVED = "RECEIVED",
//     READ = "READ"
// }
export type IAuthController = {
    isAuth$: iObservable<boolean>;
    login: (credentials: credentials, errorCallback:Function) => void
    register: (credentials: credentials, registerOptions: registerOptions, errorCallback:Function) => void
    logout: () => void
}
export type IUserService = {
    setPhoto$: iObservable<UserInfo>;
    activity$: iObservable<UserInfo>;
    friendRequest$: iObservable<UserInfo>
    setPhoto: (photo: ArrayBuffer) => void;
    friendRequest: (login: string) => void;
    friendResponse: (login: string, accept: boolean) => void;
    getFriendsList: (callback: (FriendList: Array<UserInfo>) => void) => void;
    getFriendsInviteList: (callback: (FriendInviteList: Array<UserInfo>) => void) => void;
    getUserInfo: (login: string, callback: (UserInfo: UserInfo) => void) => void;
};
export type IChatService = {
    message$: iObservable<message>;
    setPhoto$: iObservable<{ chatID: string, photo: string }>;
    setPhoto: (photo: ArrayBuffer) => void
    pushMessage: (message: messageClient) => void
    addUser: (login: string) => void
    getChat: (callback: (chat: iChat) => void) => void
    leaveChat: () => void
}
export type IChatManager = {
    leaveChat$: iObservable<{ chatID: string, user: UserInfo }>;
    message$: iObservable<message>;
    chatCreated$: iObservable<{ from: string, chat: iChat }>;
    addMember$: iObservable<{ chatID: string, user: UserInfo }>
    createChat: (login: Array<string>, chatName: string) => void
    getChats: (callback: (chats: Array<iChat>) => void) => void
}
export type IAppController = {
    root: HTMLElement
}
export type authBlockOptions = {
    buttonName: string
    inputs: Array<authBlockInput>
}
export type authBlockInput = {
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
