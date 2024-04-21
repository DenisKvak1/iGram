import { iComponent } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { leaveBtnT, loadPhotoT, sidePanelTemplate } from "./template";
import { AddToFriendBlock } from "../addToFriendBlock/addToFriendBlock";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { ListInvitedFriends } from "../listInvitedFriends/listInvitedFriends";
import "./style.css";
import { CreateChatList } from "../createChatList/createChatList";
import { ChatShortcutList } from "../chatShortcutList/chatShortcutList";
import { userService } from "../../services/UserService";
import { authController } from "../../services/AuthController";
import { setupLoadPhotoEvent } from "../../../../../env/helpers/photoLoad";

export class ChatSideBar implements iComponent {
    private sideBar: HTMLElement;
    private leaveButton: HTMLElement;
    private loadPhoto: HTMLElement;
    private addToFriendBlock: iComponent;
    private listInvitedFriends: iComponent;
    private createGroupBtn: iComponent;
    private chatList: iComponent;

    constructor() {
        this.init();
    }

    private init() {
        this.initHTML();
        this.initComponent();
        this.setupEvents();
        this.compositionComponent();
    }

    private setupEvents() {
        this.setupLogoutEvent();
        this.setupLoadPhotoEvent();
    }

    private initHTML() {
        this.sideBar = createElementFromHTML(sidePanelTemplate);
        this.leaveButton = createElementFromHTML(leaveBtnT);
        this.loadPhoto = createElementFromHTML(loadPhotoT);
    }

    private initComponent() {
        this.addToFriendBlock = new AddToFriendBlock();
        this.listInvitedFriends = new ListInvitedFriends();
        this.createGroupBtn = new CreateChatList();
        this.chatList = new ChatShortcutList();
    }

    private setupLogoutEvent() {
        this.leaveButton.onclick = () => {
            authController.logout();
        };
    }

    private setupLoadPhotoEvent() {
        const uploadPhoto = this.loadPhoto.querySelector(".filePhotoLoad2") as HTMLInputElement;
        setupLoadPhotoEvent(uploadPhoto, (bufferedPhoto) => userService.setPhoto(bufferedPhoto));
    }

    private compositionComponent() {
        appendChild(this.sideBar, this.leaveButton);
        appendChild(this.sideBar, this.addToFriendBlock.getComponent());
        appendChild(this.sideBar, this.listInvitedFriends.getComponent());
        appendChild(this.sideBar, this.createGroupBtn.getComponent());
        appendChild(this.sideBar, this.loadPhoto);
        appendChild(this.sideBar, this.chatList.getComponent());
    }



    getComponent() {
        return this.sideBar;
    }

    destroy(){
        this.sideBar.remove()
    }
}