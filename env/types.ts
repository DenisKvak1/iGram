
export type iObservable<T> = {
    subscribe: (callback: (eventData: T) => void) => { unsubscribe: () => void };
    next: (eventData?: T) => void
    unsubscribeAll: () => void
    getValue: () => T
    setValue: (value: T) => void
    once: (callback: (eventData?: T) => void) => void
}
export type iServer = {
    webSocket: WebSocket
    event$: iObservable<serverMessage>
    push: (message: serverMessage)=>void
    register: (loginValue: loginValue, options: registerOptions) => Promise<serverResponse>
    getUser: (login:string)=> Promise<serverResponse>
    getFriendsInvites: ()=>Promise<serverResponse>
    getFriends: ()=>Promise<serverResponse>
    login: (loginValue: loginValue) => Promise<serverResponse>
    checkAuth: ()=> Promise<serverResponse>
    getChats:(id?:string)=> Promise<serverResponse>
}
export type serverResponse = {
    status: RESPONSE_STATE
    Error?: string

    [key:string]: any
}
export type loginValue = {
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
    chatID:string
}
export type iUser = {
    email: string
    name: string
    friends: Array<string>
    photo: string
    lastActivity: string
}
export type iChat = {
    id: string
    groupName: string,
    members: Array<iUser>
    history: Array<message>
    photo?: string
}

export type serverMessage = {
    command: string
    payload: {
        from?: iUser | string
        to?: string
        text?: string
        login?: string
        logins?: Array<string>
        groupName?: string
        group?: iChat
        accept?: boolean
        chatID?: string
        timestamp?: string
        photo?: ArrayBuffer,
        user?: iUser
    }
}
export type message = {
    from: iUser,
    fromName:string
    to?: string,
    text: string,
    timestamp: string
}
export const enum MESSAGE_STATE {
    PENDING = "PENDING",
    SENT = "SENT",
    RECEIVED = "RECEIVED",
    READ = "READ"
}

export type IAppController = {
    server: iServer
    isAuth$: iObservable<boolean>
    root: HTMLElement
}
export type authBlockOptions = {
    buttonName: string
    inputs: Array<authBlockInput>
    callback: Function
}
export type authBlockInput = {
    placeHolder: string,
    regExp?: string
}
export type IAuthForm = {
    createAuthBlock: ()=> HTMLElement
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
    maxWidth?: number;
    height?: number;
    maxHeight?: number;
    bgColor?: string;
    bgOverlayColor?: string;
    padding?: string
    borderRadius?: string
    [key: string]: string | number
};
export type iModalOptionsFunc = {
    width?: (width: number) => void;
    maxWidth?: (maxWidth: number) => void;
    height?: (height: number) => void;
    maxHeight?: (maxHeight: number) => void;
    bgColor?: (color: string) => void;
    bgOverlayColor?: (color: number) => void;
    [key: string]: (argument: string | number) => void
}