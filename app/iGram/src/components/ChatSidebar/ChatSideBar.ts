import { IAppController, iObservable } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { leaveBtnT, loadPhotoT, sidePanelTemplate } from "./template";
import { AddToFriendBlock } from "../addToFriendBlock/addToFriendBlock";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { AppController } from "../../appController";
import { ListInvitedFriends } from "../listInvitedFriends/listInvitedFriends";
import "./style.css"
import { CreateGroupBlock } from "../createGroupBlock/createGroupBlock";
import { ChatList } from "../chatList/chatList";
import { Observable } from "../../../../../env/helpers/observable";
export class ChatSideBar{
    controller: IAppController
    selectChat$: iObservable<string>

    constructor() {
        this.controller = AppController.getInstance();
        this.selectChat$ = new Observable<string>()

    }
    createElement(){
        const sideBar = createElementFromHTML(sidePanelTemplate)
        let leaveButton = createElementFromHTML(leaveBtnT)
        const addToFriendBlock = new AddToFriendBlock()
        const listInvitedFriends = new ListInvitedFriends()
        const createGroupBtn = new CreateGroupBlock()
        const groupList = new ChatList()
        const loadPhoto = createElementFromHTML(loadPhotoT)
        groupList.selectChat$.subscribe((data)=>this.selectChat$.next(data))
        leaveButton.onclick = ()=> {
            localStorage.setItem('jwt', null)
            this.controller.isAuth$.next(false)
        }
        const uploadPhoto = loadPhoto.querySelector(".filePhotoLoad2") as HTMLInputElement;
        uploadPhoto.onchange = () => {
            const selectedFile = uploadPhoto.files?.[0];
            if (selectedFile && (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const arrayBuffer = event.target?.result as ArrayBuffer;
                    const uint8Array = new Uint8Array(arrayBuffer);

                    this.controller.server.push({
                        command: "setUserPhoto",
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
}