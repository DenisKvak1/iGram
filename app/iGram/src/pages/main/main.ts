import { iComponent, iSubscribe } from "../../../../../env/types";
import "./style.css";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { mainPageTemplate } from "./template";
import { chatManager, currentChatService } from "../../services/ChatService";
import { AuthBlock } from "../../components/auth/AuthBlock";
import { ChatMembersList } from "../../components/chatMembersList/chatMembersList";
import { ChatBlock } from "../../components/chatBlock/ChatBlock";
import { ChatSideBar } from "../../components/ChatSidebar/ChatSideBar";
import { authController } from "../../services/AuthController";

export class MainPage implements iComponent {
    private mainPage: HTMLElement;
    private authBlock: AuthBlock;
    private chatSidePanel: ChatSideBar;
    private chatBlock: ChatBlock;
    private membersList: ChatMembersList;
    private selectChatSubscription: iSubscribe;

    constructor() {
        this.init();
    }

    private init() {
        this.initHTML();
        currentChatService.load$.onceOr(currentChatService.load$.getValue(), () => {
            this.render();
            authController.isAuth$.subscribe(() => this.render());
        });
    }

    private initHTML() {
        this.mainPage = createElementFromHTML(mainPageTemplate);
    }

    private checkChatIDRoute(chatID: string) {
        if (chatID) {
            chatManager.getChat(chatID).then((chat) => {
                if (!chat) {
                    let url = new URL(window.location.href);
                    url.searchParams.delete("chatID");
                    window.history.replaceState(null, null, url.toString());
                    location.reload();
                    return;
                }
                chatManager.selectChat$.next(chatID);
            });
        }
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

    private setupSelectChatEvent() {
        chatManager.selectChat$.subscribe((chatID) => {
            if (window.innerWidth >= 1200) {
                if (!chatID) {
                    this.membersList.getComponent().classList.add("noneVisible");
                } else {
                    this.membersList.getComponent().classList.remove("noneVisible");
                }
            }
            if (!chatID) {
                this.membersList.getComponent().classList.add("noneVisible");
                return;
            }
        });
    }

    private selectDesktopSize() {
        if (this.selectChatSubscription) {
            this.selectChatSubscription.unsubscribe();
        }
        this.chatSidePanel.getComponent().classList.remove("noneVisible");
        this.chatBlock.getComponent().classList.remove("noneVisible");
        if (!chatManager.selectChat$.getValue()) {
            this.membersList.getComponent().classList.add("noneVisible");
        } else {
            this.membersList.getComponent().classList.remove("noneVisible");
        }
    }

    private selectMobileSize() {
        if (this.selectChatSubscription) {
            this.selectChatSubscription.unsubscribe();
        }

        this.selectChatSubscription = chatManager.selectChat$.subscribe(() => {
            if (!chatManager.selectChat$.getValue()) return;
            this.chatBlock.getComponent().classList.remove("noneVisible");
            this.chatSidePanel.getComponent().classList.add("noneVisible");
        });
        this.membersList.getComponent().classList.add("noneVisible");
        if (chatManager.selectChat$.getValue()) {
            this.chatSidePanel.getComponent().classList.add("noneVisible");
            this.membersList.getComponent().classList.add("noneVisible");
        } else {
            this.chatBlock.getComponent().classList.add("noneVisible");
            this.membersList.getComponent().classList.add("noneVisible");
        }
    }

    private selectAdaptiveVersion() {
        if (window.innerWidth <= 1200) {
            this.selectMobileSize();
        } else {
            this.selectDesktopSize();
        }
    }

    private setupResizeEvent() {
        let prevWidth = window.innerWidth;
        window.addEventListener("resize", () => {
            if ((prevWidth <= 1200) !== (window.innerWidth <= 1200)) {
                this.selectAdaptiveVersion();
            }
            prevWidth = window.innerWidth;
        });
    }

    private authBlockRender() {
        if (this.chatSidePanel) this.chatSidePanel.destroy();
        if (this.chatBlock) this.chatBlock.destroy();
        if (this.membersList) this.membersList.destroy();

        this.authBlock = new AuthBlock();
        this.mainPage.appendChild(this.authBlock.getComponent());
    }

    private mainChatPageRender() {
        if (this.authBlock) this.authBlock.destroy();
        const currentUrl = new URL(window.location.href);
        const chatID = currentUrl.searchParams.get("chatID");

        this.chatSidePanel = new ChatSideBar();
        this.chatBlock = new ChatBlock();
        this.membersList = new ChatMembersList();

        this.membersList.getComponent().classList.add("noneVisible");
        this.setupSelectChatEvent();
        this.setupToChatEvent();
        this.setupToMemberListEvent();
        this.setupToChatListEvent();

        this.checkChatIDRoute(chatID);

        this.mainPage.appendChild(this.chatSidePanel.getComponent());
        this.mainPage.appendChild(this.chatBlock.getComponent());
        this.mainPage.appendChild(this.membersList.getComponent());

        this.selectAdaptiveVersion();
        this.setupResizeEvent();
    }

    private render() {
        if (!authController.isAuth$.getValue()) {
            this.authBlockRender();
        } else {
            this.mainChatPageRender();
        }
    }

    getComponent() {
        return this.mainPage;
    }

    destroy() {
        if (this.selectChatSubscription) this.selectChatSubscription.unsubscribe();
        this.mainPage.remove();
    }
}