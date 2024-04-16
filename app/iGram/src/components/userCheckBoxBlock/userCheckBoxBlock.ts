import { iReactiveUserInfo, iComponent, iObservable } from "../../../../../env/types";
import { Collector } from "../../../../../env/helpers/Collector";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { reactivity } from "../../../../../env/reactivity2.0/reactivity";
import { reactivityAttribute } from "../../../../../env/reactivity2.0/reactivityAttribute";
import { userCheckBoxBlockTemplate } from "./template";
import { Observable } from "../../../../../env/helpers/observable";
import "./style.css";

export class UserCheckBoxBlock implements iComponent {
    private user: iReactiveUserInfo;
    private userBlock: HTMLElement;
    private chatName: HTMLElement;
    private checkBox: HTMLInputElement;
    private userPhoto: HTMLImageElement;
    check$ = new Observable<{ user: string, checked: boolean }>();

    private collector = new Collector();

    constructor(user: iObservable<iReactiveUserInfo>) {
        this.user = user.getValue();

        this.init();
    }

    private init() {
        this.initHMTL();
        this.setupHTMLContent();
        this.setupCheckBoxEvent();
    }

    private initHMTL() {
        this.userBlock = createElementFromHTML(userCheckBoxBlockTemplate);
        this.chatName = this.userBlock.querySelector(".chat_name") as HTMLElement;
        this.checkBox = this.userBlock.querySelector("input");
        this.userPhoto = this.userBlock.querySelector(".chatPhoto") as HTMLImageElement;
    }

    private setupHTMLContent() {
        this.collector.collect(
            reactivity(this.user.name, this.chatName),
            reactivityAttribute(this.user.photo, this.userPhoto, "src")
        );
    }

    private setupCheckBoxEvent() {
        this.checkBox.onchange = (event) => {
            const targetElement = event.target as HTMLInputElement;
            if (targetElement.checked) {
                this.check$.next({ user: this.user.email.getValue(), checked: true });
            } else {
                this.check$.next({ user: this.user.email.getValue(), checked: false });
            }
        };
    }

    getComponent() {
        return this.userBlock;
    }

    unMounted() {
        this.user.destroy()
        this.collector.clear();
        this.userBlock.remove();
    }
}