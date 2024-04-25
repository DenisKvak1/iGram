import { chatManager } from "../../services/ChatService";
import { iComponent, iSubscribe } from "../../../../../env/types";
import { ChatBlock } from "../../components/chatBlock/ChatBlock";
import { ChatMembersList } from "../../components/chatMembersList/chatMembersList";

export class DesktopAdaptive {
    private chatSidePanel: iComponent;
    private chatBlock: iComponent;
    private membersList: iComponent;
    private subsc: iSubscribe;

    constructor(chatSidePanel: iComponent, chatBlock: ChatBlock, membersList: ChatMembersList) {
        this.chatSidePanel = chatSidePanel;
        this.chatBlock = chatBlock;
        this.membersList = membersList;
        this.setupSelectChatEvent();

    }

    turnOn() {
        this.selectDesktopSize();
    }

    turnOff() {
        if (this.subsc) this.subsc.unsubscribe();
    }

    private setupSelectChatEvent() {
        this.subsc = chatManager.selectChat$.subscribe((chatID) => {
            if (window.innerWidth < 1200) return;
            if (!chatID) {
                this.membersList.getComponent().classList.add("noneVisible");
            } else {
                this.membersList.getComponent().classList.remove("noneVisible");
            }
        });
    }

    private selectDesktopSize() {
        this.chatSidePanel.getComponent().classList.remove("noneVisible");
        this.chatBlock.getComponent().classList.remove("noneVisible");
        if (!chatManager.selectChat$.getValue()) {
            this.membersList.getComponent().classList.add("noneVisible");
        } else {
            this.membersList.getComponent().classList.remove("noneVisible");
        }
    }

}

