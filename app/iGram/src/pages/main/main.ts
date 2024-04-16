import { AuthBlock } from "../../components/auth/AuthBlock";
import { iObservable, iSubscribe } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { mainPageTemplate } from "./template";
import "./style.css";
import { ChatSideBar } from "../../components/ChatSidebar/ChatSideBar";
import { ChatBlock } from "../../components/chatBlock/ChatBlock";
import { ChatMembersList } from "../../components/chatMembersList/chatMembersList";
import { chatManager, selectChatService } from "../../services/ChatService";

export class MainPage {
    isAuth$: iObservable<boolean>;

    constructor(isAuth$: iObservable<boolean>) {
        this.isAuth$ = isAuth$;

    }

    createPageElement() {
        let mainPage = createElementFromHTML(mainPageTemplate);
        let selectChatSubscription: iSubscribe;
        selectChatService.load$.onceOr(selectChatService.load$.getValue(),() => {
            let render = (isAuth: boolean) => {
                if (!isAuth) {
                    mainPage.innerHTML = "";
                    if (!mainPage.querySelector(".authBlock")) {
                        let authBlock = new AuthBlock();

                        mainPage.appendChild(authBlock.createElement());
                    }
                } else {
                    mainPage.querySelector(".authBlock")?.remove();
                    const currentUrl = new URL(window.location.href);
                    const chatID = currentUrl.searchParams.get("chatID");

                    const chatSidePanel = new ChatSideBar();
                    const chatBlock = new ChatBlock();
                    const membersList = new ChatMembersList();


                    chatBlock.toChatList$.subscribe(() => {
                        chatBlock.getComponent().classList.add("noneVisible");
                        chatSidePanel.getComponent().classList.remove("noneVisible");
                        let url = new URL(window.location.href);

                        url.searchParams.delete("chatID");
                        window.history.replaceState(null, null, url.toString());
                    });
                    chatBlock.toMemberList$.subscribe(() => {
                        membersList.getElement().classList.remove("noneVisible");
                        chatBlock.getComponent().classList.add("noneVisible");
                    });
                    membersList.toChat$.subscribe(() => {
                        membersList.getElement().classList.add("noneVisible");
                        chatBlock.getComponent().classList.remove("noneVisible");
                    });

                    mainPage.appendChild(chatSidePanel.getComponent());
                    mainPage.appendChild(chatBlock.getComponent());
                    chatManager.selectChat$.subscribe((data) => {
                        if (!data) {
                            membersList.getElement().classList.add("noneVisible");
                            return;
                        }
                    });
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
                    chatBlock.getComponent().insertAdjacentElement("afterend", membersList.createElement());
                    let checkResize = () => {
                        if (!(window.innerWidth >= 1200)) {
                            if (selectChatSubscription) {
                                selectChatSubscription.unsubscribe();
                            }

                            selectChatSubscription = chatManager.selectChat$.subscribe(() => {
                                chatManager.getChats().then(() => {
                                    if (!(window.innerWidth >= 1200)) {
                                        if (!chatManager.selectChat$.getValue()) return;
                                        chatSidePanel.getComponent().classList.add("noneVisible");
                                        chatBlock.getComponent().classList.remove("noneVisible");
                                    }
                                    chatBlock.getComponent().insertAdjacentElement("afterend", membersList.getElement());
                                });
                            });
                            membersList.getElement().classList.add("noneVisible");
                            if (chatManager.selectChat$.getValue()) {
                                chatSidePanel.getComponent().classList.add("noneVisible");
                                membersList.getElement().classList.add("noneVisible");
                            } else {
                                chatBlock.getComponent().classList.add("noneVisible");
                                membersList.getElement().classList.add("noneVisible");
                            }
                        }
                    };
                    checkResize();
                    window.addEventListener("resize", () => {
                        if (!(window.innerWidth >= 1200)) {
                            checkResize();
                        } else {
                            chatSidePanel.getComponent().classList.remove("noneVisible");
                            chatBlock.getComponent().classList.remove("noneVisible");
                            if (!chatManager.selectChat$.getValue()) {
                                membersList.getElement().classList.add("noneVisible");
                            } else {
                                membersList.getElement().classList.remove("noneVisible");
                            }
                        }
                    });
                }
            };
            this.isAuth$.subscribe((isAuth) => {
                render(isAuth);
            });
            render(this.isAuth$.getValue());
        });

        return mainPage;
    }

}