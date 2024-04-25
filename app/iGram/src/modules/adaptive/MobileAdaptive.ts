import { chatManager } from "../../services/ChatService";
import { iComponent, iSubscribe } from "../../../../../env/types";
import { ChatBlock } from "../../components/chatBlock/ChatBlock";
import { ChatMembersList } from "../../components/chatMembersList/chatMembersList";

export class MobileAdaptive {
    private chatSidePanel: iComponent;
    private chatBlock: ChatBlock;
    private membersList: ChatMembersList;
    private subsc: iSubscribe;

    constructor(chatSidePanel: iComponent, chatBlock: ChatBlock, membersList: ChatMembersList) {
        this.chatSidePanel = chatSidePanel;
        this.chatBlock = chatBlock;
        this.membersList = membersList;

        this.setupToChatListEvent();
        this.setupToMemberListEvent();
        this.setupToChatEvent();
        this.setupSelectChatEvent();
    }

    turnOn() {
        this.selectMobileSize();
    }

    turnOff() {
        if (this.subsc) this.subsc.unsubscribe();
    }

    private selectMobileSize() {
        this.membersList.getComponent().classList.add("noneVisible");
        if (chatManager.selectChat$.getValue()) {
            this.chatSidePanel.getComponent().classList.add("noneVisible");
            this.membersList.getComponent().classList.add("noneVisible");
        } else {
            this.chatBlock.getComponent().classList.add("noneVisible");
            this.membersList.getComponent().classList.add("noneVisible");
        }
    }

    private setupSelectChatEvent() {
        this.subsc = chatManager.selectChat$.subscribe((chatID) => {
            if (window.innerWidth >= 1200) return;
            if (!chatID) {
                this.membersList.getComponent().classList.add("noneVisible");
                return;
            }
            if (!chatManager.selectChat$.getValue()) return;
            this.chatBlock.getComponent().classList.remove("noneVisible");
            this.chatSidePanel.getComponent().classList.add("noneVisible");
        });
    }

    private setupToChatListEvent() {
        this.chatBlock.toChatList$.subscribe(() => {
            this.chatBlock.getComponent().classList.add("noneVisible");
            this.chatSidePanel.getComponent().classList.remove("noneVisible");
            let url = new URL(window.location.href);

            url.searchParams.delete("chatID");
            window.history.replaceState(null, null, url.toString());
        });
    }

    private setupToMemberListEvent() {
        this.chatBlock.toMemberList$.subscribe(() => {
            this.membersList.getComponent().classList.remove("noneVisible");
            this.chatBlock.getComponent().classList.add("noneVisible");
        });
    }

    private setupToChatEvent() {
        this.membersList.toChat$.subscribe(() => {
            this.membersList.getComponent().classList.add("noneVisible");
            this.chatBlock.getComponent().classList.remove("noneVisible");
        });
    }
}

