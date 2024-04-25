import { iComponent, iObservable, iReactiveChatInfo, messageClient } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { chatInfoBlockT, chatTemplate, sendChatBlockT } from "./template";
import "./style.css";
import { Observable } from "../../../../../env/helpers/observable";
import { AddUserToChat } from "../addUserToGroup/addUserToChat";
import { chatManager, currentChatService } from "../../services/ChatService";
import { MessageBlock } from "../messageBlock/messageBlock";
import { registerReactivityList } from "../../../../../env/reactivity2.0/registerReactivityList";
import { conditionalRendering } from "../../../../../env/reactivity2.0/conditionalRendering";
import { Collector } from "../../../../../env/helpers/Collector";
import { reactivity } from "../../../../../env/reactivity2.0/reactivity";
import { setupLoadPhotoEvent } from "../../../../../env/helpers/photoLoad";
import { emojiParser } from "../../modules/EmojiParser";
import { isHTMLEmpty } from "../../../../../env/helpers/isEmptyHTML";
import { EmojiPanel } from "../emojiPanel/emojiPanel";
import { emojiConfig } from "../../../../../env/config";

export class ChatBlock implements iComponent {
    private chatBlock: HTMLElement;
    private messagesBlock: HTMLElement;
    private toSendBlock: HTMLElement;
    private toChatInfoBlock: HTMLElement;
    private leaveGroupBTN: HTMLButtonElement;
    private chatNameElement: HTMLElement;
    private inputMessage: HTMLElement;
    private sendMessageBtn: HTMLElement;
    private uploadPhotoInput: HTMLInputElement;
    private emojiPanel: iComponent;
    private collector = new Collector();
    private tempCollector = new Collector();
    private messageToSend: messageClient = { from: undefined, text: "", timestamp: "" };
    toChatList$: iObservable<null>;
    toMemberList$: iObservable<null>;


    constructor() {
        this.toChatList$ = new Observable();
        this.toMemberList$ = new Observable();

        this.init();
    }

    private init() {
        this.initHTML();
        this.initEmojiPanel();
        this.setupEmojiPanel();
        this.setupContentHTML();
        this.registerChatParts();
        this.setupPhotoChatLoader();
        this.setupLeaveGroupHandle();
        this.setupSelectChatHandle();
        this.setupSendMessageHandle();
        this.setupToChatListHandle();
        this.setupNewMessageHandler();
        this.setupMessageLoader();
    }

    private initHTML() {
        this.chatBlock = createElementFromHTML(chatTemplate);
        this.toSendBlock = createElementFromHTML(sendChatBlockT);
        this.toChatInfoBlock = createElementFromHTML(chatInfoBlockT);
        this.leaveGroupBTN = this.toChatInfoBlock.querySelector(".leaveGroup") as HTMLButtonElement;
        this.chatNameElement = this.toChatInfoBlock.querySelector(".chat_name") as HTMLElement;
        this.inputMessage = this.toSendBlock.querySelector(".sendBlock .messageInput") as HTMLInputElement;
        this.sendMessageBtn = this.toSendBlock.querySelector(".sendBlock .sendButton") as HTMLButtonElement;
        this.uploadPhotoInput = this.toSendBlock.querySelector(".clipImageInput") as HTMLInputElement;

        const addToGroup = new AddUserToChat();
        this.leaveGroupBTN.insertAdjacentElement("beforebegin", addToGroup.getComponent());
        this.messagesBlock = this.chatBlock.querySelector(".mainMessageBlock");
    }

    private initEmojiPanel() {
        this.emojiPanel = new EmojiPanel(emojiConfig);
        const clipImage = this.toSendBlock.querySelector(".clipImage");
        clipImage.insertAdjacentElement("afterend", this.emojiPanel.getComponent());
    }

    private setupEmojiPanel() {
        (this.emojiPanel as any).emoji$.subscribe((keySymbol: string) => {
            const messageInput = this.toSendBlock.querySelector(".messageInput");
            const imgEmoji = emojiParser.getEmojiBySymbol(keySymbol);
            messageInput.insertAdjacentHTML("beforeend", imgEmoji);
        });
    }

    private registerChatParts() {
        this.collector.collect(
            conditionalRendering(chatManager.selectChat$, () => Boolean(chatManager.selectChat$.getValue()), this.toChatInfoBlock, this.chatBlock),
            conditionalRendering(chatManager.selectChat$, () => Boolean(chatManager.selectChat$.getValue()), this.messagesBlock, this.chatBlock),
            conditionalRendering(chatManager.selectChat$, () => Boolean(chatManager.selectChat$.getValue()), this.toSendBlock, this.chatBlock)
        );
    }

    private setupContentHTML() {
        currentChatService.chat$.onceOr(Boolean(currentChatService.chat$.getValue()), () => {
            this.setupEventMessageAndName(currentChatService.chat$.getValue());
            this.toChatEnd();
        });
        this.collector.collect(
            currentChatService.chat$.subscribe((chat) => {
                this.setupEventMessageAndName(chat);
                this.toChatEnd();
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

    private setupPhotoChatLoader() {
        const uploadPhotoInput = this.toChatInfoBlock.querySelector(".filePhotoLoad") as HTMLInputElement;
        setupLoadPhotoEvent(uploadPhotoInput, (bufferedPhoto) => currentChatService.setPhoto(bufferedPhoto));
    }

    private setupMessageLoader() {
        const clipImageElement = this.toSendBlock.querySelector(".clipImageInput") as HTMLInputElement;
        setupLoadPhotoEvent(clipImageElement, (bufferedPhoto) => this.messageToSend.photo = bufferedPhoto);
    }

    private setupLeaveGroupHandle() {
        this.leaveGroupBTN.onclick = () => {
            currentChatService.leaveChat();
            if (window.innerWidth < 1200) {
                this.toChatList$.next();
            }
        };
    }

    private setupSelectChatHandle() {
        chatManager.selectChat$.once(() => {
            this.chatNameElement.onclick = () => {
                this.toMemberList$.next();
            };
        });
    }

    private setupNewMessageHandler() {
        chatManager.message$.subscribe((msg) => {
            if (msg.to !== chatManager.selectChat$.getValue()) return;

            setTimeout(() => this.messagesBlock.scrollTop = this.messagesBlock.scrollHeight);
        });
    }

    private toChatEnd() {
        this.messagesBlock.scrollTop = this.messagesBlock.scrollHeight;
    }

    private sendMessageFromInput() {
        const parsedMessage = emojiParser.parseFromEmoji(this.inputMessage.innerHTML);

        this.messageToSend.from = localStorage.getItem("email");
        this.messageToSend.to = chatManager.selectChat$.getValue();
        this.messageToSend.text = parsedMessage;
        currentChatService.pushMessage(this.messageToSend);
        this.messageToSend = { from: "", text: "" };
        this.uploadPhotoInput.value = null;

        this.inputMessage.innerHTML = "";
    }

    private checkEmptyMessage() {
        const inputMessage = this.toSendBlock.querySelector(".sendBlock .messageInput") as HTMLInputElement;
        const parsedMessage = emojiParser.parseFromEmoji(inputMessage.innerHTML);
        let empty = isHTMLEmpty(parsedMessage);
        if (this.messageToSend.photo) empty = false;
        return empty;
    }

    private setupSendMessageHandle() {
        this.inputMessage.onkeydown = (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                (this.emojiPanel as any).closePopover();

                if (this.checkEmptyMessage()) return;
                this.sendMessageFromInput();
            }
        };
        this.sendMessageBtn.onclick = () => {
            (this.emojiPanel as any).closePopover();

            if (this.checkEmptyMessage()) return;
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

    destroy(): void {
        this.tempCollector.clear();
        this.collector.clear();
        this.chatBlock.remove();
    }
}