import { IAppController, iObservable } from "../../../../../env/types";
import { AppController } from "../../appController";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { containerMembersList, memberElement } from "./template";
import "./style.css";
import { getGroupList } from "../../hook/getList";
import { Observable } from "../../../../../env/helpers/observable";

export class ChatMembersList {
    controller: IAppController;
    containerMembersList: HTMLElement;
    membersListBlock: HTMLElement;
    selectChat$: iObservable<string>;
    private list$: iObservable<Array<string>>;

    constructor(selectChat: iObservable<string>) {
        this.selectChat$ = selectChat;
        this.controller = AppController.getInstance();
        this.list$ = new Observable<Array<string>>([]);

        this.init();
    }

    init() {
        this.containerMembersList = createElementFromHTML(containerMembersList);
        this.membersListBlock = this.containerMembersList.querySelector(".membersListBlock");

        this.selectChat$.subscribe((chatID) => {
            getGroupList(chatID).then((Chats) => {
                this.setList(Chats[0].members);
            });
        });
        this.controller.server.event$.subscribe((data) => {
            if (data.command === "leaveGroup" && data.payload.chatID === this.selectChat$.getValue()) {
                let list = this.list$.getValue();
                list = list.filter((item) => item !== data.payload.login);
                this.setList(list);
            } else if(data.command === "friendAddedToGroup"){
                this.pushList(data.payload.login)
            }
        });
    }

    getElement() {
        return this.containerMembersList;
    }

    setList(members: Array<string>) {
        this.membersListBlock.innerHTML = "";
        members.forEach((item) => {
            this.pushList(item);
        });
        this.list$.next(members);
    }

    pushList(member: string) {
        const chatBlock = createElementFromHTML(memberElement);
        const memberName = chatBlock.querySelector(".chat_name");
        const memberPhoto = chatBlock.querySelector(".memberPhotoInList") as HTMLImageElement;
        this.controller.server.getUser(member).then((data) => {
            memberName.textContent = data.user.name;
            memberPhoto.src = data.user.photo;
        });

        this.controller.server.event$.subscribe((data) => {
            if (data.command === "setUserPhoto" && data.payload.login === member) {
                const timestamp = new Date().getTime();
                memberPhoto.src = `${memberPhoto.src}?timestamp=${timestamp}`;
            }
        });

        let list = this.list$.getValue();
        list.push(member);
        this.list$.next(list);
        appendChild(this.membersListBlock, chatBlock);
    }
}