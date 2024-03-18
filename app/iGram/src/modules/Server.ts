import {
    IAppController,
    iObservable,
    iServer,
    loginValue,
    serverMessage,
    registerOptions,
    serverResponse
} from "../../../../env/types";
import { Observable } from "../../../../env/helpers/observable";

export class Server implements iServer {
    url: string;
    urlWebSocket: string;
    webSocket: WebSocket;
    event$: iObservable<serverMessage>;
    private controller: IAppController;

    constructor(url: string, urlWebSocket: string, controller: IAppController) {
        this.controller = controller;
        this.url = url;
        this.urlWebSocket = urlWebSocket;
        this.webSocket = new WebSocket(`${urlWebSocket}?token=${localStorage.getItem("jwt")}`);
        this.webSocket.onclose = (event) => setTimeout(() => {
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

    async login(loginValue: loginValue): Promise<serverResponse> {
        let request = await this.sendRequest("api/login", loginValue, "POST");
        if (request.status === "OK") {
            localStorage.setItem("jwt", request.jwt);
            localStorage.setItem("email", request.email);
            this.controller.isAuth$.next(true);
        }

        this.wsReconnect();
        return request;
    }

    async register(loginValue: loginValue, options: registerOptions): Promise<serverResponse> {
        let request = await this.sendRequest("api/register", { loginValue, options }, "POST");
        if (request.status === "OK") {
            localStorage.setItem("jwt", request.jwt);
            localStorage.setItem("email", request.email);
            this.controller.isAuth$.next(true);
        }

        this.wsReconnect();
        return request;
    }

    async getChats(id?: string): Promise<serverResponse> {
        let request: serverResponse;
        if (!id) {
            request = await this.sendRequest("api/chats", {}, "GET");
        } else {
            request = await this.sendRequest(`api/chats?id=${id}`, {}, "GET");
        }
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
        this.webSocket.onclose = (event) => setTimeout(() => {
            if (!event.wasClean) {
                this.wsReconnect();
            }
        }, 3000);
    }
}