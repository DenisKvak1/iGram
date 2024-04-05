import { chatSideBarCommand, componentsID, iComponent, iObservable } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { leaveBtnT, loadPhotoT, sidePanelTemplate } from "./template";
import { AddToFriendBlock } from "../addToFriendBlock/addToFriendBlock";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { ListInvitedFriends } from "../listInvitedFriends/listInvitedFriends";
import "./style.css";
import { CreateChatBlock } from "../createChatBlock/createChatBlock";
import { ChatList } from "../chatList/chatList";
import { Observable } from "../../../../../env/helpers/observable";
import { channelInput$ } from "../../modules/componentDataSharing";

export class ChatSideBar implements iComponent{
    selectChat$: iObservable<string>
    sideBar: HTMLElement
    constructor() {
        this.selectChat$ = new Observable<string>()
    }
    createElement(){
        const sideBar = createElementFromHTML(sidePanelTemplate)
        this.sideBar = sideBar
        let leaveButton = createElementFromHTML(leaveBtnT)
        const addToFriendBlock = new AddToFriendBlock()
        const listInvitedFriends = new ListInvitedFriends()
        const createGroupBtn = new CreateChatBlock()
        const groupList = new ChatList()

        const loadPhoto = createElementFromHTML(loadPhotoT)
        groupList.selectChat$.subscribe((data)=>this.selectChat$.next(data))
        leaveButton.onclick = ()=> {
            channelInput$.next({id: componentsID.chatSideBar,command: chatSideBarCommand.LEAVE_ACCOUNT})
        }
        const uploadPhoto = loadPhoto.querySelector(".filePhotoLoad2") as HTMLInputElement;
        uploadPhoto.onchange = () => {
            const selectedFile = uploadPhoto.files?.[0];
            if (selectedFile && (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const arrayBuffer = event.target?.result as ArrayBuffer;
                    const uint8Array = new Uint8Array(arrayBuffer);

                    channelInput$.next({
                        id: componentsID.chatSideBar,
                        command: chatSideBarCommand.SET_USER_PHOTO,
                        payload: {
                            photo: uint8Array
                        }
                    });
                };

                reader.readAsArrayBuffer(selectedFile);
            } else {
                alert("Пожалуйста, выберите файл в формате JPEG или PNG.");
                uploadPhoto.value = "";
            }

        };

        appendChild(sideBar, leaveButton)
        appendChild(sideBar, addToFriendBlock.createElement())
        appendChild(sideBar, listInvitedFriends.createElement())
        appendChild(sideBar, createGroupBtn.createElement())
        appendChild(sideBar, loadPhoto)
        appendChild(sideBar, groupList.createElement())

        return sideBar
    }
    getElement(){
        return this.sideBar
    }
}