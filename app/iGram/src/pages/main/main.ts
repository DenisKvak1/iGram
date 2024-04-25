import { iComponent } from "../../../../../env/types";
import "./style.css";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { mainPageTemplate } from "./template";
import { chatManager, currentChatService } from "../../services/ChatService";
import { AuthBlock } from "../../components/auth/AuthBlock";
import { ChatMembersList } from "../../components/chatMembersList/chatMembersList";
import { ChatBlock } from "../../components/chatBlock/ChatBlock";
import { ChatSideBar } from "../../components/ChatSidebar/ChatSideBar";
import { authController } from "../../services/AuthController";
import { DesktopAdaptive } from "../../modules/adaptive/DesktopAdaptive";
import { MobileAdaptive } from "../../modules/adaptive/MobileAdaptive";


export class MainPage implements iComponent {
    private mainPage: HTMLElement;
    private authBlock: AuthBlock;
    private chatSidePanel: ChatSideBar;
    private chatBlock: ChatBlock;
    private membersList: ChatMembersList;
    private mobileAdaptive: any;
    private desktopAdaptive: any;

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


    private selectAdaptiveVersion() {
        if (window.innerWidth <= 1200) {
            this.desktopAdaptive.turnOff();
            this.mobileAdaptive.turnOn();
        } else {
            this.mobileAdaptive.turnOff();
            this.desktopAdaptive.turnOn();
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
        this.desktopAdaptive = new DesktopAdaptive(this.chatSidePanel, this.chatBlock, this.membersList);
        this.mobileAdaptive = new MobileAdaptive(this.chatSidePanel, this.chatBlock, this.membersList);

        this.membersList.getComponent().classList.add("noneVisible");

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
        this.mainPage.remove();
    }
}