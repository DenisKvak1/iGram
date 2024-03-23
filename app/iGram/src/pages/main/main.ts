import { AuthBlock } from "../../components/auth/AuthBlock";
import {
    componentsEvent,
    externalData,
    externalEventType,
    iObservable,
    requestData,
    requestData_COMMANDS
} from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { mainPageTemplate } from "./template";
import "./style.css";
import { ChatSideBar } from "../../components/ChatSidebar/ChatSideBar";
import { ChatBlock } from "../../components/chatBlock/ChatBlock";
import { ChatMembersList } from "../../components/chatMembersList/chatMembersList";
import { Observable } from "../../../../../env/helpers/observable";

export class MainPage {
    requestData$: iObservable<requestData>;
    componentsEvent$: iObservable<componentsEvent>;
    externalEvent$: iObservable<externalData>;
    isAuth$: iObservable<boolean>;

    constructor(isAuth$: iObservable<boolean>) {
        this.isAuth$ = isAuth$;

        this.externalEvent$ = new Observable<externalData>;
        this.requestData$ = new Observable<requestData>();
        this.componentsEvent$ = new Observable<componentsEvent>();
    }

    createPageElement() {
        let mainPage = createElementFromHTML(mainPageTemplate);
        let selectChatSubscription: { unsubscribe: () => void };
        let render = (isAuth: boolean) => {
            if (!isAuth) {
                mainPage.innerHTML = "";
                if (!mainPage.querySelector(".authBlock")) {
                    let authBlock = new AuthBlock();
                    this.externalEvent$.subscribe((event) => authBlock.externalEvent$.next(event));
                    authBlock.requestData$.subscribe((data) => this.requestData$.next(data));
                    authBlock.event$.subscribe((data) => this.componentsEvent$.next(data));

                    mainPage.appendChild(authBlock.createAuthBlock());
                }
            } else {
                mainPage.querySelector(".authBlock")?.remove();
                const currentUrl = new URL(window.location.href);
                const chatID = currentUrl.searchParams.get("chatID");

                const chatSidePanel = new ChatSideBar();
                const chatBlock = new ChatBlock(chatSidePanel.selectChat$);
                const membersList = new ChatMembersList(chatSidePanel.selectChat$);

                this.externalEvent$.subscribe((event) => chatSidePanel.externalEvent$.next(event));
                this.externalEvent$.subscribe((event) => chatBlock.externalEvent$.next(event));
                this.externalEvent$.subscribe((event) => membersList.externalEvent$.next(event));
                chatSidePanel.requestData$.subscribe((data) => this.requestData$.next(data));
                chatBlock.requestData$.subscribe((data) => this.requestData$.next(data));
                membersList.requestData$.subscribe((data) => this.requestData$.next(data));
                chatSidePanel.event$.subscribe((data) => this.componentsEvent$.next(data));
                chatBlock.event$.subscribe((data) => this.componentsEvent$.next(data));
                membersList.event$.subscribe((data) => this.componentsEvent$.next(data));

                chatBlock.toChatList$.subscribe(() => {
                    chatBlock.getElement().classList.add("noneVisible");
                    chatSidePanel.getElement().classList.remove("noneVisible");
                    let url = new URL(window.location.href);

                    url.searchParams.delete("chatID");
                    window.history.replaceState(null, null, url.toString());
                });
                chatBlock.toMemberList$.subscribe(() => {
                    membersList.getElement().classList.remove("noneVisible");
                    chatBlock.getElement().classList.add("noneVisible");
                });
                membersList.toChat$.subscribe(() => {
                    membersList.getElement().classList.add("noneVisible");
                    chatBlock.getElement().classList.remove("noneVisible");
                });

                mainPage.appendChild(chatSidePanel.createElement());
                mainPage.appendChild(chatBlock.createElement());
                chatSidePanel.selectChat$.subscribe((data) => {
                    if (!data) {
                        membersList.getElement().classList.add("noneVisible");
                        return;
                    }
                });
                if (chatID) {
                    this.requestData$.next({ command: requestData_COMMANDS.CHAT, payload: { chatID: chatID } });
                    let subc = this.externalEvent$.subscribe((event) => {
                        if (event.command !== requestData_COMMANDS.CHAT || event.type !== externalEventType.DATA) return;
                        if (!event?.payload?.chat) {
                            let url = new URL(window.location.href);
                            url.searchParams.delete("chatID");
                            window.history.replaceState(null, null, url.toString());
                            location.reload();
                            return;
                        }
                        chatSidePanel.selectChat$.next(chatID);
                        subc.unsubscribe();
                    });
                }
                chatBlock.getElement().insertAdjacentElement("afterend", membersList.createElement());
                let checkResize = () => {
                    if (!(window.innerWidth >= 1200)) {
                        if (selectChatSubscription) {
                            selectChatSubscription.unsubscribe();
                        }

                        selectChatSubscription = chatSidePanel.selectChat$.subscribe((data) => {
                            this.requestData$.next({ command: requestData_COMMANDS.CHATS });
                            let subc = this.externalEvent$.subscribe((event) => {
                                if (event.command === requestData_COMMANDS.CHATS && event.type === externalEventType.DATA && data) {
                                    if (!(window.innerWidth >= 1200)) {
                                        chatSidePanel.getElement().classList.add("noneVisible");
                                        chatBlock.getElement().classList.remove("noneVisible");
                                    }
                                    chatBlock.getElement().insertAdjacentElement("afterend", membersList.getElement());
                                    subc.unsubscribe();
                                }
                            });
                        });
                        membersList.getElement().classList.add("noneVisible");
                        if (chatSidePanel.selectChat$.getValue()) {
                            chatSidePanel.getElement().classList.add("noneVisible");
                            membersList.getElement().classList.add("noneVisible");
                        } else {
                            chatBlock.getElement().classList.add("noneVisible");
                            membersList.getElement().classList.add("noneVisible");
                        }
                    }
                };
                checkResize();
                window.addEventListener("resize", () => {
                    if (!(window.innerWidth >= 1200)) {
                        checkResize();
                    } else {
                        chatSidePanel.getElement().classList.remove("noneVisible");
                        chatBlock.getElement().classList.remove("noneVisible");
                        if(!chatSidePanel.selectChat$.getValue()){
                            membersList.getElement().classList.add('noneVisible')
                        } else {
                            membersList.getElement().classList.remove('noneVisible')
                        }
                    }
                });
            }
        };
        this.isAuth$.subscribe((isAuth) => {
            render(isAuth);
        });
        render(this.isAuth$.getValue());
        return mainPage;
    }

}