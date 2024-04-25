import { iReactiveUserInfo, iServer, IUserService, serverWS_COMMANDS, UserInfo } from "../../../../env/types";
import { Observable } from "../../../../env/helpers/observable";
import { ReactiveUserInfo } from "./ReactiveUserInfo";
import { server } from "../modules/Server";

export class UserService implements IUserService {
    private server: iServer;
    setPhoto$ = new Observable<UserInfo>();
    activity$ = new Observable<UserInfo>();
    friendRequest$ = new Observable<iReactiveUserInfo>();
    addFriend$ = new Observable<iReactiveUserInfo>();

    constructor(server: iServer) {
        this.server = server;

        this.init();
    }

    private init(): void {
        this.setupEvents();
    }

    private setupEvents(): void {
        this.setupSetPhotoEvent();
        this.setupSetActivityEvent();
        this.setupFriendRequestEvent();
        this.setupPushFriend();
    }

    setPhoto(photo: ArrayBuffer): void {
        this.server.push({
            command: serverWS_COMMANDS.SET_USER_PHOTO,
            payload: {
                photo
            }
        });
    }

    friendRequest(login: string): void {
        this.server.push({
            command: serverWS_COMMANDS.FRIEND_REQUEST,
            payload: {
                login
            }
        });
    }

    friendResponse(login: string, accept: boolean): void {
        this.server.push({
            command: serverWS_COMMANDS.FRIEND_RESPONSE,
            payload: {
                login,
                accept
            }
        });
    }

    getFriendsList(callback: (FriendList: Array<UserInfo>) => void): void {
        this.server.getFriendsList().then((msg) => {
            callback(msg.requests);
        });
    }

    getReactiveFriendsList(callback: (FriendInviteList: Array<iReactiveUserInfo>) => void): void {
        this.getFriendsList((users) => {
            const reactiveUsers = users.map((user) => new ReactiveUserInfo(user));
            callback(reactiveUsers);
        });
    }

    getFriendsInviteList(callback: (FriendInviteList: Array<UserInfo>) => void): void {
        this.server.getFriendsInvites().then((msg) => {
            callback(msg.requests);
        });
    }

    getReactiveFriendsInviteList(callback: (FriendInviteList: Array<iReactiveUserInfo>) => void) {
        this.getFriendsInviteList((users) => {
            const reactiveUsers = users.map((user) => new ReactiveUserInfo(user));
            callback(reactiveUsers);
        });
    }

    getUserInfo(login: string, callback: (UserInfo: UserInfo) => void): void {
        this.server.getUserInfo(login).then((msg) => {
            callback(msg.user);
        });
    }


    private setupSetPhotoEvent(): void {
        this.server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.SET_USER_PHOTO) return;

            this.setPhoto$.next(msg.payload.user);
        });
    }

    private setupFriendRequestEvent(): void {
        this.server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.FRIEND_REQUEST) return;

            const reactiveUser = new ReactiveUserInfo(msg.payload.from as UserInfo);
            this.friendRequest$.next(reactiveUser);
        });
    }

    private setupSetActivityEvent(): void {
        this.server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.ACTIVITY) return;

            this.activity$.next(msg.payload.user);
        });
    }

    private setupPushFriend() {
        this.server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.ADD_FRIEND) return;

            const reactiveUser = new ReactiveUserInfo(msg.payload.user);
            this.addFriend$.next(reactiveUser);
        });

    }
}

export const userService = new UserService(server);
