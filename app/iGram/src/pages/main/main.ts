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
                const currentUrl = new URL(window.location.href);
                const chatID = currentUrl.searchParams.get('chatID');

                const chatSidePanel = new ChatSideBar()
                const chatBlock = new ChatBlock(chatSidePanel.selectChat$)
                const membersList = new ChatMembersList(chatSidePanel.selectChat$)

                mainPage.appendChild(chatSidePanel.createElement())
                mainPage.appendChild(chatBlock.getElement())
                chatSidePanel.selectChat$.subscribe((data)=>{
                    if(!data) {
                        membersList.getElement().remove()
                        return
                    }
                    getGroupList(data).then((chat)=>{
                        if(!chat) return
                        chatBlock.getElement().insertAdjacentElement('afterend', membersList.getElement())
                    })
                })

                if(chatID) {
                    getGroupList(chatID).then((chat)=>{
                        if(!chat) return
                        chatBlock.getElement().insertAdjacentElement('afterend', membersList.getElement())
                        chatSidePanel.selectChat$.next(chatID);
                    })
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