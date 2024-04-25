import { iComponent, iObservable, iReactiveUserInfo } from "../../../../../env/types";
import { Collector } from "../../../../../env/helpers/Collector";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { reactivity } from "../../../../../env/reactivity2.0/reactivity";
import { computed } from "../../../../../env/reactivity2.0/computed";
import { formatDateString } from "../../../../../env/helpers/formatTime";
import { reactivityAttribute } from "../../../../../env/reactivity2.0/reactivityAttribute";
import { memberElement } from "./template";

export class ChatMemberBlock implements iComponent {
    private user: iReactiveUserInfo;
    private chatBlock: HTMLElement;
    private memberName: HTMLElement;
    private memberPhoto: HTMLImageElement;
    private memberActivity: HTMLElement;
    private collector = new Collector();
    private intervalID: NodeJS.Timeout;

    constructor(user: iObservable<iReactiveUserInfo>) {
        this.user = user.getValue();

        this.init();
    }

    private init() {
        this.initHTML();
        this.setupHTMLContent();
        this.initUpdateTimeInterval();
    }

    private initHTML() {
        this.chatBlock = createElementFromHTML(memberElement);
        this.memberName = this.chatBlock.querySelector(".chat_name");
        this.memberPhoto = this.chatBlock.querySelector(".memberPhotoInList") as HTMLImageElement;
        this.memberActivity = this.chatBlock.querySelector(".last_online");
    }

    private setupHTMLContent() {
        const activityComputed = computed(this.user.lastActivity, () => {
            let lastActivityFormat = formatDateString(this.user.lastActivity.getValue());

            if (lastActivityFormat !== "В сети") {
                lastActivityFormat = `Был(а) ${lastActivityFormat}`;
            }
            return lastActivityFormat;
        });

        this.collector.collect(
            reactivityAttribute(this.user.userPhoto, this.memberPhoto, "src"),
            reactivity(this.user.name, this.memberName),
            reactivity(activityComputed.observer, this.memberActivity),
            activityComputed.subscribe
        );
    }

    private initUpdateTimeInterval() {
        if (this.user.email.getValue() !== localStorage.getItem("email")) {
            this.intervalID = setInterval(() => {
                this.user.lastActivity.next(this.user.lastActivity.getValue());
            }, 1000 * 60);
        }
    }

    getComponent() {
        return this.chatBlock;
    }

    destroy() {
        clearInterval(this.intervalID);
        this.collector.clear();
        this.chatBlock.remove();
    }
}

