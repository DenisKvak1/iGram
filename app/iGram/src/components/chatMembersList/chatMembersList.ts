import {
    componentsEvent,
    componentsEvent_COMMANDS,
    externalData,
    externalEventType,
    iObservable,
    requestData,
    requestData_COMMANDS,
    UserInfo
} from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { containerMembersList, memberElement } from "./template";
import "./style.css";
import { Observable } from "../../../../../env/helpers/observable";
import { formatDateString } from "../../../../../env/helpers/formatTime";

export class ChatMembersList {
    containerMembersList: HTMLElement;
    membersListBlock: HTMLElement;
    selectChat$: iObservable<string>;
    toChat$: iObservable<null>;
    private list$: iObservable<Array<UserInfo>>;
    private timeUpdater: Array<NodeJS.Timeout>;
    eventSList: Array<{ unsubscribe: () => void }>;

    externalEvent$: iObservable<externalData>;
    requestData$: iObservable<requestData>;
    event$: iObservable<componentsEvent>;

    constructor(selectChat: iObservable<string>) {
        this.selectChat$ = selectChat;
        this.list$ = new Observable<Array<UserInfo>>([]);
        this.toChat$ = new Observable();
        this.timeUpdater = [];
        this.eventSList = [];

        this.externalEvent$ = new Observable<externalData>;
        this.requestData$ = new Observable<requestData>();
        this.event$ = new Observable<componentsEvent>();

        this.init();
    }

    init() {
        this.containerMembersList = createElementFromHTML(containerMembersList);
    }

    createElement() {
        this.membersListBlock = this.containerMembersList.querySelector(".membersListBlock");
        const backArrow = this.containerMembersList.querySelector(".toChat") as HTMLButtonElement;
        backArrow.onclick = () => {
            this.toChat$.next();
        };
        this.containerMembersList.classList.add("noneVisible");
        this.selectChat$.subscribe((data) => {
            if (window.innerWidth >= 1200) {
                console.log('remove')
                if (!data) {
                    this.containerMembersList.classList.add("noneVisible");
                } else {
                    this.containerMembersList.classList.remove("noneVisible");
                }
            }
        });
        this.selectChat$.subscribe((chatID) => {
            this.requestData$.next({ command: requestData_COMMANDS.CHAT, payload: { chatID: chatID } });
            let subsc = this.externalEvent$.subscribe((data) => {
                if (data.command === requestData_COMMANDS.CHAT && data.type === externalEventType.DATA) {
                    if (!data?.payload?.chat) return;
                    this.setList(data.payload.chat.members);
                    subsc.unsubscribe();
                }
            });
        });
        this.externalEvent$.subscribe((data) => {
            if (data.command === componentsEvent_COMMANDS.LEAVE_CHAT && data.type === externalEventType.EVENT && data.payload.chatID === this.selectChat$.getValue()) {
                let list = this.list$.getValue();
                list = list.filter((item) => item.email !== data.payload.user.email);
                this.setList(list);
            } else if (data.command === "friendAddedToChat") {
                this.pushList(data.payload.user);
            }
        });
        return this.containerMembersList;
    }

    getElement() {
        return this.containerMembersList;
    }

    setList(members: Array<UserInfo>) {
        this.membersListBlock.innerHTML = "";
        this.timeUpdater.forEach((item) => clearInterval(item));
        this.timeUpdater = [];
        this.eventSList.forEach((item) => item.unsubscribe());
        this.eventSList = [];

        members.forEach((item) => {
            this.pushList(item);
        });
        this.list$.next(members);
    }

    pushList(member: UserInfo) {
        const chatBlock = createElementFromHTML(memberElement);
        const memberName = chatBlock.querySelector(".chat_name");
        const memberPhoto = chatBlock.querySelector(".memberPhotoInList") as HTMLImageElement;
        const memberActivity = chatBlock.querySelector(".last_online");
        const last_onlineSign = chatBlock.querySelector(".last_onlineSign");

        let activityFormatDate = formatDateString(member.lastActivity);
        if (activityFormatDate === "В сети") last_onlineSign.textContent = "";

        memberName.textContent = member.name;
        memberPhoto.src = member.photo;
        memberActivity.textContent = activityFormatDate;

        if (member.email !== localStorage.getItem("email")) {
            const intervalId = setInterval(() => {
                let activityFormatDate = formatDateString(member.lastActivity);
                if (activityFormatDate !== "В сети") {
                    last_onlineSign.innerHTML = "Был(а)&nbsp;";
                } else {
                    last_onlineSign.textContent = "";
                }
                memberActivity.textContent = activityFormatDate;
            }, 1000 * 60);
            this.timeUpdater.push(intervalId);
        }

        const subscribe = this.externalEvent$.subscribe((data) => {
            if (data.command === componentsEvent_COMMANDS.SET_USER_PHOTO && data.type === externalEventType.EVENT && data.payload?.user?.email === member.email) {
                const timestamp = new Date().getTime();
                memberPhoto.src = `${data.payload.user.photo}?timestamp=${timestamp}`;
            } else if (data.command === componentsEvent_COMMANDS.ACTIVITY && data.type === externalEventType.EVENT && member.email === data.payload.user.email) {
                member.lastActivity = data.payload.user.lastActivity;

                let activityFormatDate = formatDateString(data.payload.user.lastActivity);
                memberActivity.textContent = activityFormatDate;
                if (activityFormatDate !== "В сети") {
                    last_onlineSign.innerHTML = "Был(а)&nbsp;";
                } else {
                    last_onlineSign.textContent = "";
                }
            }
        });
        this.eventSList.push(subscribe);

        let list = this.list$.getValue();
        list.push(member);
        this.list$.next(list);
        appendChild(this.membersListBlock, chatBlock);
    }
}