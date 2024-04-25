import { iReactiveUserInfo, iObservable, UserInfo } from "../../../../env/types";
import { userService } from "./UserService";
import { Observable } from "../../../../env/helpers/observable";
import { Collector } from "../../../../env/helpers/Collector";

export class ReactiveUserInfo implements iReactiveUserInfo {
    private collector = new Collector();
    email: iObservable<string>;
    name: iObservable<string>;
    friends: iObservable<Array<string>>;
    userPhoto: iObservable<string>;
    lastActivity: iObservable<string>;

    constructor(user: UserInfo) {
        this.init(user);
    }

    private init(user: UserInfo) {
        this.initObserver(user);
        this.initEventChanges();
    }

    private initObserver(user: UserInfo) {
        this.email = new Observable(user.email);
        this.name = new Observable(user.name);
        this.friends = new Observable(user.friends);
        this.userPhoto = new Observable(user.photo);
        this.lastActivity = new Observable(user.lastActivity);
    }

    private initEventChanges() {
        this.setupActiveChangeEvent();
        this.setupPhotoChangeEvent();
    }

    private setupActiveChangeEvent() {
        this.collector.collect(
            userService.activity$.subscribe((user) => {
                if (user.email !== this.email.getValue()) return;

                this.lastActivity.next(user.lastActivity);
            })
        );
    }

    private setupPhotoChangeEvent() {
        this.collector.collect(
            userService.setPhoto$.subscribe((user) => {
                if (user.email !== this.email.getValue()) return;

                this.userPhoto.next(user.photo);
            })
        );
    }

    destroy(){
        this.collector.clear()
    }
}