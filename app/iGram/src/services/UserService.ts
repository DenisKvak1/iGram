import { iObservable, IUserService, serverWS_COMMANDS, UserInfo } from "../../../../env/types";
import { Observable } from "../../../../env/helpers/observable";
import { server } from "../modules/Server";

export class UserService implements IUserService {
    setPhoto$: iObservable<UserInfo>;
    activity$: iObservable<UserInfo>;
    friendRequest$: iObservable<UserInfo>;

    constructor() {
        this.init();
    }

    private init(): void {
        this.setupEvents();
    }

    private setupEvents(): void {
        this.setupSetPhotoEvent();
        this.setupSetActivityEvent();
        this.setupFriendRequestEvent();
    }

    setPhoto(photo: ArrayBuffer): void {
        server.push({
            command: serverWS_COMMANDS.SET_USER_PHOTO,
            payload: {
                photo
            }
        });
    }

    friendRequest(login: string): void {
        server.push({
            command: serverWS_COMMANDS.FRIEND_REQUEST,
            payload: {
                login
            }
        });
    }

    friendResponse(login: string, accept: boolean): void {
        server.push({
            command: serverWS_COMMANDS.FRIEND_RESPONSE,
            payload: {
                login,
                accept
            }
        });
    }

    getFriendsList(callback: (FriendList: Array<UserInfo>) => void): void {
        server.getFriendsList().then((msg) => {
            callback(msg.requests);
        });
    }

    getFriendsInviteList(callback: (FriendInviteList: Array<UserInfo>) => void): void {
        server.getFriendsInvites().then((msg) => {
            callback(msg.requests);
        });
    }

    getUserInfo(login: string, callback: (UserInfo: UserInfo) => void): void {
        server.getUserInfo(login).then((msg) => {
            callback(msg.user);
        });
    }


    private setupSetPhotoEvent(): void {
        this.setPhoto$ = new Observable<UserInfo>();
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.SET_USER_PHOTO) return;

            this.setPhoto$.next(msg.payload.user);
        });
    }

    private setupFriendRequestEvent(): void {
        this.friendRequest$ = new Observable();
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.FRIEND_REQUEST) return;

            this.friendRequest$.next(msg.payload.from as UserInfo);
        });
    }

    private setupSetActivityEvent(): void {
        this.activity$ = new Observable<UserInfo>();
        server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.ACTIVITY) return;

            this.activity$.next(msg.payload.user);
        });
    }
}

export const userService = new UserService();