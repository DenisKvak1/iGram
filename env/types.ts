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
    getChats: (id?: string) => Promise<serverResponse>
    ready$: iObservable<boolean>
    isAuth$: iObservable<boolean>;

}

export const enum requestData_COMMANDS {
    CHATS = "CHATS",
    CHAT = "CHAT",
    FRIENDS = "FRIENDS",
    FRIEND_REQUEST = "FRIEND_REQUEST"
}

export const enum componentsEvent_COMMANDS {
    LOGIN = "LOGIN",
    REGISTER = "REGISTER",
    MESSAGE = "message",
    FRIEND_REQUEST = "friendRequest",
    FRIEND_RESPONSE = "friendResponse",
    REMOVE_FRIEND = "removeFriend",
    CHAT_CREATED = "chatCreated",
    FRIEND_ADD_TO_CHAT = "friendAddedToChat",
    SET_CHAT_PHOTO = "setChatPhoto",
    SET_USER_PHOTO = "setUserPhoto",
    LEAVE_CHAT = "leaveChat",
    LEAVE_ACCOUNT = "LEAVE_ACCOUNT",
    ACTIVITY = "activity"
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
    command: componentsEvent_COMMANDS
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
        credentials: {[key: string]: string}
        registerOptions: registerOptions
    }>
}
export type requestData = {
    command: requestData_COMMANDS
    payload?: Partial<{
        chatID: string
    }>
}

export const enum externalEventType {
    DATA = "DATA",
    EVENT = "EVENT"
}

export type externalData = {
    type: externalEventType
    command: requestData_COMMANDS | componentsEvent_COMMANDS
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
        photo?: ArrayBuffer,
        user?: UserInfo
        error?: string
    }
    status?: RESPONSE_STATE
    Error?: string
    data?: Array<iChat>
    requests?: Array<UserInfo>
    jwt?: string,
    email?: string
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

export type addUserT = {
    login: string
    chatID: string
}
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
// export const enum MESSAGE_STATE {
//     PENDING = "PENDING",
//     SENT = "SENT",
//     RECEIVED = "RECEIVED",
//     READ = "READ"
// }

export type IAppController = {
    server: iServer
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
    externalEvent$: iObservable<externalData>;
    requestData$: iObservable<requestData>;
    event$: iObservable<componentsEvent>;
}

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
export type iCache<T> ={
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
    cashBD: {[key:string]: iCache<Promise<iChat>>};
    addChat(chatId:string): void;
    getChat(id: string): Promise<iChat | undefined>;
}
