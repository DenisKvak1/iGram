import {
    credentials,
    iObservable,
    iServer,
    registerOptions,
    serverMessage,
    serverResponse,
    serverWS_COMMANDS
} from "../../../../env/types";
import { Observable } from "../../../../env/helpers/observable";

export class Server implements iServer {
    url: string;
    urlWebSocket: string;
    webSocket: WebSocket;
    event$: iObservable<serverMessage>;
    ready$: iObservable<boolean>;

    constructor(url: string, urlWebSocket: string) {
        this.url = url;
        this.urlWebSocket = urlWebSocket;
        this.ready$ = new Observable<boolean>();

        this.webSocket = new WebSocket(`${urlWebSocket}?token=${localStorage.getItem("jwt")}`);
        this.webSocket.onopen = () => this.ready$.next(true);
        this.webSocket.onclose = (event) => setTimeout(() => {
            this.ready$.next(false);
            if (!event.wasClean) {
                this.wsReconnect();
            }
        }, 3000);
        this.event$ = new Observable<serverMessage>();
        this.init();
    }

    private async sendRequest(endPoint: string, data: any, type: string): Promise<serverResponse> {
        const url = `${this.url}/${endPoint}`;
        const headers = {
            "Content-Type": "application/json",
            "Authorization": localStorage.getItem("jwt") || ""
        };

        const requestOptions: RequestInit = {
            method: type,
            headers
        };

        if (type === "POST") {
            requestOptions.body = JSON.stringify(data);
        }
        try {
            const response = await fetch(url, requestOptions);
            return await response.json();
        } catch (error) {
            return Promise.reject(error);
        }
    }

    private init() {
        this.receiveMessage();
    }

    private receiveMessage() {
        this.webSocket.addEventListener("message", (event) => this.event$.next(JSON.parse(event.data)));
    }

    async checkAuth() {
        return await this.sendRequest("api/checkValidToken", null, "GET");
    }

    async push(message: serverMessage) {
        let send = () => {
            this.webSocket.send(JSON.stringify(message));
            this.webSocket.removeEventListener("open", send);
        };
        if (this.webSocket.readyState === WebSocket.OPEN) {
            send();
        } else {
            this.wsReconnect();
            this.webSocket.addEventListener("open", send);
        }
    }

    async login(loginValue: credentials): Promise<serverResponse> {
        let request = await this.sendRequest("api/login", loginValue, "POST");
        if (request.status === "OK") {
            localStorage.setItem("jwt", request.jwt);
            localStorage.setItem("email", request.email);
            this.event$.next({
                command: serverWS_COMMANDS.LOGIN
            });
        }

        this.wsReconnect();
        return request;
    }

    async register(credentials: credentials, options: registerOptions): Promise<serverResponse> {
        let request = await this.sendRequest("api/register", { credentials, options }, "POST");
        if (request.status === "OK") {
            localStorage.setItem("jwt", request.jwt);
            localStorage.setItem("email", request.email);
            this.event$.next({
                command: serverWS_COMMANDS.LOGIN
            });
        }

        this.wsReconnect();
        return request;
    }

    async getChats(): Promise<serverResponse> {
        let request: serverResponse;
        request = await this.sendRequest("api/chats", {}, "GET");
        return request;
    }

    async getChat(id: string) {
        let request: serverResponse;
        request = await this.sendRequest(`api/chats/${id}`, {}, "GET");
        return request;
    }

    async getFriendsInvites(): Promise<serverResponse> {
        return await this.sendRequest("api/getFriendsInvite", {}, "GET");
    }

    async getFriendsList(): Promise<serverResponse> {
        return await this.sendRequest("api/getFriends", {}, "GET");
    }

    async getUserInfo(login: string) {
        return await this.sendRequest(`api/getUser?login=${login}`, null, "GET");
    }

    private wsReconnect() {
        this.webSocket.close();
        this.webSocket = new WebSocket(`${this.urlWebSocket}?token=${localStorage.getItem("jwt")}`);
        this.receiveMessage();
        this.webSocket.onopen = () => this.ready$.next(true);
        this.webSocket.onclose = (event) => setTimeout(() => {
            this.webSocket.onopen = () => this.ready$.next(false);
            if (!event.wasClean) {
                this.wsReconnect();
            }
        }, 3000);
    }
}

export const server = new Server("http://127.0.0.1:3000", "ws:///127.0.0.1:3000");
