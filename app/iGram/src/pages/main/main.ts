import { AuthBlock } from "../../components/auth/AuthBlock";
import { iObservable } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { mainPageTemplate } from "./template";
import "./style.css";
import { ChatSideBar } from "../../components/ChatSidebar/ChatSideBar";
import { ChatBlock } from "../../components/chatBlock/ChatBlock";
import { ChatMembersList } from "../../components/chatMembersList/chatMembersList";
import { ChatService, chatManager } from "../../services/ChatService";

export class MainPage {
    isAuth$: iObservable<boolean>;

    constructor(isAuth$: iObservable<boolean>) {
        this.isAuth$ = isAuth$;

    }

    createPageElement() {
        let mainPage = createElementFromHTML(mainPageTemplate);
        let selectChatSubscription: { unsubscribe: () => void };
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
                const chatBlock = new ChatBlock(chatSidePanel.selectChat$);
                const membersList = new ChatMembersList(chatSidePanel.selectChat$);


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
                    const chat = new ChatService(chatID)
                    chat.getChat((chat)=>{
                        if (!chat) {
                            let url = new URL(window.location.href);
                            url.searchParams.delete("chatID");
                            window.history.replaceState(null, null, url.toString());
                            location.reload();
                            return;
                        }
                        chatSidePanel.selectChat$.next(chatID);
                    })
                }
                chatBlock.getElement().insertAdjacentElement("afterend", membersList.createElement());
                let checkResize = () => {
                    if (!(window.innerWidth >= 1200)) {
                        if (selectChatSubscription) {
                            selectChatSubscription.unsubscribe();
                        }

                        selectChatSubscription = chatSidePanel.selectChat$.subscribe(() => {
                            chatManager.getChats(() => {
                                if (!(window.innerWidth >= 1200)) {
                                    if (!chatSidePanel.selectChat$.getValue()) return;
                                    chatSidePanel.getElement().classList.add("noneVisible");
                                    chatBlock.getElement().classList.remove("noneVisible");
                                }
                                chatBlock.getElement().insertAdjacentElement("afterend", membersList.getElement());
                            })
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
                        if (!chatSidePanel.selectChat$.getValue()) {
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
        return mainPage;
    }

}