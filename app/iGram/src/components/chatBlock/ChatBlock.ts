import { iComponent, iObservable, iReactiveChatInfo } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { chatInfoBlockT, chatTemplate, sendChatBlockT } from "./template";
import "./style.css";
import { Observable } from "../../../../../env/helpers/observable";
import { AddUserToChat } from "../addUserToGroup/addUserToChat";
import { chatManager, selectChatService } from "../../services/ChatService";
import { MessageBlock } from "../messageBlock/messageBlock";
import { registerReactivityList } from "../../../../../env/reactivity2.0/registerReactivityList";
import { conditionalRendering } from "../../../../../env/reactivity2.0/conditionalRendering";
import { Collector } from "../../../../../env/helpers/Collector";
import { reactivity } from "../../../../../env/reactivity2.0/reactivity";
import { setupLoadPhotoEvent } from "../../../../../env/helpers/photoLoad";

export class ChatBlock implements iComponent {
    private chatBlock: HTMLElement;
    private messagesBlock: HTMLElement;
    private toSendBlock: HTMLElement;
    private toChatInfoBlock: HTMLElement;
    private leaveGroupBTN: HTMLButtonElement;
    private chatNameElement: HTMLElement;
    private collector = new Collector();
    private tempCollector = new Collector();
    toChatList$: iObservable<null>;
    toMemberList$: iObservable<null>;


    constructor() {
        this.toChatList$ = new Observable();
        this.toMemberList$ = new Observable();

        this.init();
    }

    private init() {
        this.initHTML();
        this.setupContentHTML();
        this.setupEmptyChat();
        this.setupPhotoLoaderHandle();
        this.setupLeaveGroupHandle();
        this.setupSelectChatHandle();
        this.setupSendMessageHandle();
        this.setupToChatListHandle();
        this.setupNewMessageHandler();
    }

    private initHTML() {
        this.chatBlock = createElementFromHTML(chatTemplate);
        this.toSendBlock = createElementFromHTML(sendChatBlockT);
        this.toChatInfoBlock = createElementFromHTML(chatInfoBlockT);
        this.leaveGroupBTN = this.toChatInfoBlock.querySelector(".leaveGroup") as HTMLButtonElement;
        const addToGroup = new AddUserToChat();
        this.leaveGroupBTN.insertAdjacentElement("beforebegin", addToGroup.getComponent());
        this.messagesBlock = this.chatBlock.querySelector(".mainMessageBlock");
    }

    private setupEmptyChat() {
        this.collector.collect(
            conditionalRendering(chatManager.selectChat$, () => Boolean(chatManager.selectChat$.getValue()), this.toChatInfoBlock, this.chatBlock),
            conditionalRendering(chatManager.selectChat$, () => Boolean(chatManager.selectChat$.getValue()), this.messagesBlock, this.chatBlock),
            conditionalRendering(chatManager.selectChat$, () => Boolean(chatManager.selectChat$.getValue()), this.toSendBlock, this.chatBlock)
        );
        this.messagesBlock = this.chatBlock.querySelector(".mainMessageBlock");
    }

    private setupContentHTML() {
        selectChatService.chat$.onceOr(Boolean(selectChatService.chat$.getValue()), () => {
            this.setupEventMessageAndName(selectChatService.chat$.getValue());
        });
        this.collector.collect(
            selectChatService.chat$.subscribe((chat) => {
                this.setupEventMessageAndName(chat);
            })
        );
    }

    private setupEventMessageAndName(chat: iReactiveChatInfo) {
        this.tempCollector.clear();
        this.tempCollector.collect(
            registerReactivityList(MessageBlock, this.messagesBlock, chat.history),
            reactivity(chat.chatName, this.chatNameElement)
        );
    }

    private setupPhotoLoaderHandle() {
        const uploadPhotoInput = this.toChatInfoBlock.querySelector(".filePhotoLoad") as HTMLInputElement;
        setupLoadPhotoEvent(uploadPhotoInput, (bufferedPhoto) => selectChatService.setPhoto(bufferedPhoto));
    }

    private setupLeaveGroupHandle() {
        this.leaveGroupBTN.onclick = () => {
            selectChatService.leaveChat();
            if (window.innerWidth < 1200) {
                this.toChatList$.next();
            }
        };
    }

    private setupSelectChatHandle() {
        chatManager.selectChat$.once(() => {
            this.chatNameElement = this.chatBlock.querySelector(".chat_name") as HTMLElement;
            this.chatNameElement.onclick = () => {
                this.toMemberList$.next();
            };
        });
    }

    setupNewMessageHandler() {
        chatManager.message$.subscribe((msg) => {
            if (msg.to !== chatManager.selectChat$.getValue()) return;

            setTimeout(() => this.messagesBlock.scrollTop = this.messagesBlock.scrollHeight);
        });
    }

    private sendMessageFromInput() {
        const inputMessage = this.toSendBlock.querySelector(".sendBlock input") as HTMLInputElement;
        if (!inputMessage.value) return;
        selectChatService.pushMessage({
            from: localStorage.getItem("email"),
            to: chatManager.selectChat$.getValue(),
            text: inputMessage.value
        });
        inputMessage.value = "";
    }

    private setupSendMessageHandle() {
        const inputMessage = this.toSendBlock.querySelector(".sendBlock input") as HTMLInputElement;
        const sendMessageBtn = this.toSendBlock.querySelector(".sendBlock button") as HTMLButtonElement;

        inputMessage.onkeydown = (event) => {
            if (event.key === "Enter") {
                this.sendMessageFromInput();
            }
        };
        sendMessageBtn.onclick = () => {
            this.sendMessageFromInput();
        };
    }

    private setupToChatListHandle() {
        const toChatListBtn = this.toChatInfoBlock.querySelector(".toChat") as HTMLButtonElement;
        toChatListBtn.onclick = () => {
            this.toChatList$.next();
            chatManager.selectChat$.next(null);
        };
    }

    getComponent(): HTMLElement {
        return this.chatBlock;
    }

    unMounted(): void {
        this.tempCollector.clear();
        this.collector.clear();
        this.chatBlock.remove();
    }
}