import {
    componentsEvent,
    componentsEvent_COMMANDS,
    externalData,
    iObservable,
    requestData
} from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { leaveBtnT, loadPhotoT, sidePanelTemplate } from "./template";
import { AddToFriendBlock } from "../addToFriendBlock/addToFriendBlock";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { ListInvitedFriends } from "../listInvitedFriends/listInvitedFriends";
import "./style.css";
import { CreateChatBlock } from "../createChatBlock/createChatBlock";
import { ChatList } from "../chatList/chatList";
import { Observable } from "../../../../../env/helpers/observable";

export class ChatSideBar{
    selectChat$: iObservable<string>
    externalEvent$: iObservable<externalData>
    requestData$: iObservable<requestData>
    event$: iObservable<componentsEvent>
    sideBar: HTMLElement
    constructor() {
        this.selectChat$ = new Observable<string>()

        this.externalEvent$ = new Observable<externalData>
        this.requestData$ = new Observable<requestData>()
        this.event$ = new Observable<componentsEvent>()
    }
    createElement(){
        const sideBar = createElementFromHTML(sidePanelTemplate)
        this.sideBar = sideBar
        let leaveButton = createElementFromHTML(leaveBtnT)
        const addToFriendBlock = new AddToFriendBlock()
        const listInvitedFriends = new ListInvitedFriends()
        const createGroupBtn = new CreateChatBlock()
        const groupList = new ChatList()

        this.externalEvent$.subscribe((event)=>listInvitedFriends.externalEvent$.next(event))
        this.externalEvent$.subscribe((event)=>createGroupBtn.externalEvent$.next(event))
        this.externalEvent$.subscribe((event)=>groupList.externalEvent$.next(event))
        listInvitedFriends.requestData$.subscribe((data)=> this.requestData$.next(data))
        createGroupBtn.requestData$.subscribe((data)=> this.requestData$.next(data))
        groupList.requestData$.subscribe((data)=> this.requestData$.next(data))
        addToFriendBlock.event$.subscribe((data)=> this.event$.next(data))
        listInvitedFriends.event$.subscribe((data)=> this.event$.next(data))
        createGroupBtn.event$.subscribe((data)=> this.event$.next(data))
        groupList.event$.subscribe((data)=> this.event$.next(data))

        const loadPhoto = createElementFromHTML(loadPhotoT)
        groupList.selectChat$.subscribe((data)=>this.selectChat$.next(data))
        leaveButton.onclick = ()=> {
            this.event$.next({command: componentsEvent_COMMANDS.LEAVE_ACCOUNT})
        }
        const uploadPhoto = loadPhoto.querySelector(".filePhotoLoad2") as HTMLInputElement;
        uploadPhoto.onchange = () => {
            const selectedFile = uploadPhoto.files?.[0];
            if (selectedFile && (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const arrayBuffer = event.target?.result as ArrayBuffer;
                    const uint8Array = new Uint8Array(arrayBuffer);

                    this.event$.next({
                        command: componentsEvent_COMMANDS.SET_USER_PHOTO,
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