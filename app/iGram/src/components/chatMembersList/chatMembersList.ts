import { iComponent, iObservable, UserInfo } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { containerMembersList, memberElement } from "./template";
import "./style.css";
import { Observable } from "../../../../../env/helpers/observable";
import { formatDateString } from "../../../../../env/helpers/formatTime";
import { userService } from "../../services/UserService";
import { ChatService, chatManager } from "../../services/ChatService";

export class ChatMembersList implements iComponent {
    containerMembersList: HTMLElement;
    membersListBlock: HTMLElement;
    selectChat$: iObservable<string>;
    toChat$: iObservable<null>;
    private list$: iObservable<Array<UserInfo>>;
    private timeUpdater: Array<NodeJS.Timeout>;
    eventSList: Array<{ unsubscribe: () => void }>;

    constructor(selectChat: iObservable<string>) {
        this.selectChat$ = selectChat;
        this.list$ = new Observable<Array<UserInfo>>([]);
        this.toChat$ = new Observable();
        this.timeUpdater = [];
        this.eventSList = [];

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
                console.log("remove");
                if (!data) {
                    this.containerMembersList.classList.add("noneVisible");
                } else {
                    this.containerMembersList.classList.remove("noneVisible");
                }
            }
        });
        this.selectChat$.subscribe((chatID) => {
            const chat = new ChatService(chatID);
            chat.getChat((chat) => {
                if (!chat) return;
                this.setList(chat.members);
            });
        });
        chatManager.leaveChat$.subscribe((data)=>{
            let list = this.list$.getValue();
            list = list.filter((item) => item.email !== data.user.email);
            this.setList(list);
        })
        chatManager.addMember$.subscribe((data)=>{
            this.pushList(data.user);
        })
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

        const setActivitySUBC = userService.activity$.subscribe((userInfo) => {
            if (userInfo.email !== member.email) return;
            member.lastActivity = userInfo.lastActivity;

            let activityFormatDate = formatDateString(userInfo.lastActivity);
            memberActivity.textContent = activityFormatDate;
            if (activityFormatDate !== "В сети") {
                last_onlineSign.innerHTML = "Был(а)&nbsp;";
            } else {
                last_onlineSign.textContent = "";
            }
        });
        const setPhotoSUBC = userService.setPhoto$.subscribe((userInfo) => {
            if (userInfo.email !== member.email) return;
            const timestamp = new Date().getTime();
            memberPhoto.src = `${userInfo.photo}?timestamp=${timestamp}`;
        });
        this.eventSList.push(setActivitySUBC);
        this.eventSList.push(setPhotoSUBC);

        let list = this.list$.getValue();
        list.push(member);
        this.list$.next(list);
        appendChild(this.membersListBlock, chatBlock);
    }
}