import { IAppController, iObservable, iUser } from "../../../../../env/types";
import { AppController } from "../../appController";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { containerMembersList, memberElement } from "./template";
import "./style.css";
import { getGroupList } from "../../hook/getList";
import { Observable } from "../../../../../env/helpers/observable";
import { formatDateString } from "../../../../../env/helpers/formatTime";

export class ChatMembersList {
    controller: IAppController;
    containerMembersList: HTMLElement;
    membersListBlock: HTMLElement;
    selectChat$: iObservable<string>;
    toChat$: iObservable<null>
    private list$: iObservable<Array<iUser>>;
    private timeUpdater: Array<NodeJS.Timeout>;
    eventSList: Array<{unsubscribe: ()=>void}>

    constructor(selectChat: iObservable<string>) {
        this.selectChat$ = selectChat;
        this.controller = AppController.getInstance();
        this.list$ = new Observable<Array<iUser>>([]);
        this.toChat$ = new Observable()
        this.timeUpdater = []
        this.eventSList = []

        this.init();
    }

    init() {
        this.containerMembersList = createElementFromHTML(containerMembersList);
        this.membersListBlock = this.containerMembersList.querySelector(".membersListBlock");
        const backArrow = this.containerMembersList.querySelector('.toChat') as HTMLButtonElement
        backArrow.onclick = ()=>{
            this.toChat$.next()
        }
        this.selectChat$.subscribe((chatID) => {
            getGroupList(chatID).then((Chats) => {
                this.setList(Chats[0].members);
            });
        });
        this.controller.server.event$.subscribe((data) => {
            if (data.command === "leaveGroup" && data.payload.chatID === this.selectChat$.getValue()) {
                let list = this.list$.getValue();
                list = list.filter((item) => item.email !== data.payload.user.email);
                this.setList(list);
            } else if (data.command === "friendAddedToGroup") {
                this.pushList(data.payload.user);
            }
        });
    }

    getElement() {
        return this.containerMembersList;
    }

    setList(members: Array<iUser>) {
        this.membersListBlock.innerHTML = "";
        this.timeUpdater.forEach((item)=> clearInterval(item))
        this.timeUpdater = []
        this.eventSList.forEach((item)=>item.unsubscribe())
        this.eventSList = []

        members.forEach((item) => {
            this.pushList(item);
        });
        this.list$.next(members);
    }

    pushList(member: iUser) {
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

        const subscribe = this.controller.server.event$.subscribe((data) => {
            if (data.command === "setUserPhoto" && data.payload?.user?.email === member.email) {
                const timestamp = new Date().getTime();
                memberPhoto.src = `${data.payload.user.photo}?timestamp=${timestamp}`;
            } else if (data.command === "activity" && member.email === data.payload.user.email) {
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
        this.eventSList.push(subscribe)

        let list = this.list$.getValue();
        list.push(member);
        this.list$.next(list);
        appendChild(this.membersListBlock, chatBlock);
    }
}