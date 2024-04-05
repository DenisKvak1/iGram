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
    getChat:(id:string) => Promise<serverResponse>
    ready$: iObservable<boolean>
    isAuth$: iObservable<boolean>;

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
        credentials: {[key: string]: string}
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
    createElement: ()=>void
    getElement: ()=>void
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

export const enum mainCommand{
    GET_CHATS = "GET_CHATS",
    GET_CHAT = "GET_CHAT",
}
export const enum addToFriendCommand{
    FRIEND_REQUEST = "friendRequest",
}
export const enum addUserToGroupCommand{
    GET_FRIENDS = "GET_FRIENDS",
    GET_CHATS = "GET_CHATS",
    GET_CHAT = "GET_CHAT",
    FRIEND_ADD_TO_CHAT = "friendAddedToChat",
}
export const enum chatBlockCommand{
    GET_CHAT = "GET_CHAT",
    MESSAGE = "message",
    SET_CHAT_PHOTO = "setChatPhoto",
    LEAVE_CHAT = "leaveChat",
}
export const enum chatListCommand{
    SET_CHAT_PHOTO = "setChatPhoto",
    MESSAGE = "message",
    GET_CHATS = "GET_CHATS",
    GET_CHAT = "GET_CHAT",
    LEAVE_CHAT = "leaveChat",
    FRIEND_ADD_TO_CHAT = "friendAddedToChat",
    CHAT_CREATED = "chatCreated",
}
export const enum chatMemberListCommand{
    GET_CHAT = "GET_CHAT",
    LEAVE_CHAT = "leaveChat",
    FRIEND_ADD_TO_CHAT = "friendAddedToChat",
    ACTIVITY = "activity",
    SET_USER_PHOTO = "setUserPhoto",
}
export const enum chatSideBarCommand{
    SET_USER_PHOTO = "setUserPhoto",
    LEAVE_ACCOUNT = "LEAVE_ACCOUNT",
}
export const enum createChatBlockCommand{
    GET_FRIENDS = "GET_FRIENDS",
    CHAT_CREATED = "chatCreated",
}
export const enum listInvitedFriendsCommand{
    FRIEND_REQUEST = "friendRequest",
    GET_FRIEND_REQUEST = "GET_FRIEND_REQUEST",
    SET_USER_PHOTO = "setUserPhoto",
    FRIEND_RESPONSE = "friendResponse",
}
export const enum authFormCommand{
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
