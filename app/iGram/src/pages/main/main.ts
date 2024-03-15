import { AuthBlock } from "../../components/auth/AuthBlock";
import { IAppController} from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { mainPageTemplate } from "./template";
import "./style.css"
import { ChatSideBar } from "../../components/ChatSidebar/ChatSideBar";
import { AppController } from "../../appController";
import { ChatBlock } from "../../components/chatBlock/ChatBlock";
import { ChatMembersList } from "../../components/chatMembersList/chatMembersList";
import { getGroupList } from "../../hook/getList";
export class MainPage{
    controller: IAppController
    constructor() {
        this.controller = AppController.getInstance();
    }
    createPageElement(){
        let mainPage = createElementFromHTML(mainPageTemplate)
        let render = (isAuth:boolean)=>{
            if(!isAuth){
                mainPage.innerHTML = ''
                if(!mainPage.querySelector('.authBlock')){
                    let authBlock = new AuthBlock()
                    mainPage.appendChild(authBlock.createAuthBlock())
                }
            } else {
                mainPage.querySelector('.authBlock')?.remove()
                const currentUrl = new URL(window.location.href);
                const chatID = currentUrl.searchParams.get('chatID');

                const chatSidePanel = new ChatSideBar()
                const chatBlock = new ChatBlock(chatSidePanel.selectChat$)
                const membersList = new ChatMembersList(chatSidePanel.selectChat$)

                if(!(window.innerWidth>=1200)){
                    chatBlock.toChatList$.subscribe(()=>{
                        chatBlock.getElement().classList.add('noneVisible')
                        mainPage.querySelector('.sidePanel').classList.remove('noneVisible')

                        let url = new URL(window.location.href);
                        url.searchParams.delete('chatID');
                        window.history.replaceState(null, null, url.toString());
                    })
                    chatBlock.toMemberList$.subscribe(()=>{
                        membersList.getElement().classList.remove('noneVisible')
                        chatBlock.getElement().classList.add('noneVisible')
                    })
                    membersList.toChat$.subscribe(()=>{
                        membersList.getElement().classList.add('noneVisible')
                        chatBlock.getElement().classList.remove('noneVisible')
                    })
                }

                mainPage.appendChild(chatSidePanel.createElement())
                mainPage.appendChild(chatBlock.getElement())
                chatSidePanel.selectChat$.subscribe((data)=>{
                    if(!data) {
                        membersList.getElement().remove()
                        return
                    }
                    getGroupList(data).then((chat)=>{
                        if(!chat) return
                        if(!(window.innerWidth>=1200)){
                            mainPage.querySelector('.sidePanel').classList.add('noneVisible')
                            chatBlock.getElement().classList.remove('noneVisible')
                        }
                        chatBlock.getElement().insertAdjacentElement('afterend', membersList.getElement())
                    })
                })

                if(chatID) {
                    if(!(window.innerWidth>=1200)){
                        mainPage.querySelector('.sidePanel').classList.add('noneVisible')
                        membersList.getElement().classList.add('noneVisible')
                    }
                    getGroupList(chatID).then((chat)=>{
                        if(!chat) {
                            let url = new URL(window.location.href);
                            url.searchParams.delete('chatID');
                            window.history.replaceState(null, null, url.toString());
                            location.reload()
                            return
                        }
                        chatBlock.getElement().insertAdjacentElement('afterend', membersList.getElement())
                        chatSidePanel.selectChat$.next(chatID);
                    })
                } else {
                    console.log(window.innerWidth)

                    if(!(window.innerWidth>=1200)){
                        chatBlock.getElement().classList.add('noneVisible')
                        membersList.getElement().classList.add('noneVisible')
                    }
                }
            }
        }
        this.controller.isAuth$.subscribe((isAuth)=>{
            render(isAuth)
        })
        render(this.controller.isAuth$.getValue())
        return mainPage
    }
}