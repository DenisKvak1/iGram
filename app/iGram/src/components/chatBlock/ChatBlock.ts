import { iComponent, iObservable, message } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { chatInfoBlockT, chatTemplate, messageFromT, messageMeT, sendChatBlockT } from "./template";
import "./style.css";
import { Observable } from "../../../../../env/helpers/observable";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { AddUserToChat } from "../addUserToGroup/addUserToChat";
import { formatDateStringToMessage } from "../../../../../env/helpers/formatTime";
import { ChatService, chatManager } from "../../services/ChatService";
import { userService } from "../../services/UserService";

export class ChatBlock implements iComponent {
    chatBlock: HTMLElement;
    messages$: iObservable<Array<message>>;
    messagesBlock: HTMLElement;
    selectChat$: iObservable<string>;
    toChatList$: iObservable<null>;
    toMemberList$: iObservable<null>;

    eventSList: Array<{ unsubscribe: () => void }>;

    constructor(selectChat: iObservable<string>) {
        this.selectChat$ = selectChat;
        this.messages$ = new Observable<Array<message>>([]);
        this.toChatList$ = new Observable();
        this.toMemberList$ = new Observable();
        this.eventSList = [];
    }

    createElement() {
        this.chatBlock = createElementFromHTML(chatTemplate);
        this.messagesBlock = this.chatBlock.querySelector(".mainMessageBlock");

        this.selectChat$.subscribe(async (chatID) => {
            if (!chatID) return;
            const chat = new ChatService(chatID)
            chat.getChat((chat) => {
                if (!chat) return;
                let historyMessages = chat.history;
                let groupName = chat.chatName;
                let chatNameElement = this.chatBlock.querySelector(".chat_name") as HTMLElement;
                chatNameElement.textContent = groupName;
                chatNameElement.onclick = () => {
                    this.toMemberList$.next();
                };
                this.setMessages(historyMessages);
            })
        });
        chatManager.message$.subscribe((msg)=>{
            if(msg.to !== this.selectChat$.getValue()) return
            this.pushMessage(msg);
        })

        let checkEmpty = (data: string) => {
            let sendBlock = this.chatBlock.querySelector(".sendBlock");
            let chatInfoBlock = this.chatBlock.querySelector(".chatInfoBlock");

            if (!data) {
                if (!sendBlock && !chatInfoBlock) return;
                sendBlock.remove();
                chatInfoBlock.remove();
                while (this.messagesBlock.firstChild) {
                    this.messagesBlock.firstChild.remove();
                }
            } else {
                if (sendBlock) return;

                const toSendBlock = createElementFromHTML(sendChatBlockT);
                const toChatInfoBlock = createElementFromHTML(chatInfoBlockT);
                const inputMessage = toSendBlock.querySelector(".sendBlock input") as HTMLInputElement;
                const sendMessageBtn = toSendBlock.querySelector(".sendBlock button") as HTMLButtonElement;
                const uploadPhoto = toChatInfoBlock.querySelector(".filePhotoLoad") as HTMLInputElement;
                const leaveGroup = toChatInfoBlock.querySelector(".leaveGroup") as HTMLButtonElement;
                const addToGruup = new AddUserToChat(this.selectChat$);
                const toChatListBtn = toChatInfoBlock.querySelector(".toChat") as HTMLButtonElement;
                toChatListBtn.onclick = () => {
                    this.toChatList$.next();
                    this.selectChat$.next(null);
                };

                leaveGroup.insertAdjacentElement("beforebegin", addToGruup.createElement());

                uploadPhoto.onchange = () => {
                    const selectedFile = uploadPhoto.files?.[0];

                    if (selectedFile && (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const arrayBuffer = event.target?.result as ArrayBuffer;
                            const uint8Array = new Uint8Array(arrayBuffer);
                            const chat = new ChatService(this.selectChat$.getValue());
                            chat.setPhoto(uint8Array);
                        };

                        reader.readAsArrayBuffer(selectedFile);
                    } else {
                        alert("Пожалуйста, выберите файл в формате JPEG или PNG.");
                        uploadPhoto.value = "";
                    }

                };
                let sendMessage = () => {
                    if (!inputMessage.value) return;
                    const chat = new ChatService(this.selectChat$.getValue());
                    chat.pushMessage({
                        from: localStorage.getItem("email"),
                        to: this.selectChat$.getValue(),
                        text: inputMessage.value
                    });
                    inputMessage.value = "";
                };
                inputMessage.onkeydown = (event) => {
                    if (event.key === "Enter") {
                        sendMessage();
                    }
                };
                sendMessageBtn.onclick = () => {
                    sendMessage();
                };
                leaveGroup.onclick = () => {
                    const chat = new ChatService(this.selectChat$.getValue())
                    chat.leaveChat()
                    if (window.innerWidth < 1200) {
                        this.toChatList$.next();
                    }
                };
                appendChild(this.chatBlock, toSendBlock);
                this.chatBlock.insertAdjacentElement("afterbegin", toChatInfoBlock);
            }
        };
        checkEmpty(this.selectChat$.getValue());
        this.selectChat$.subscribe((data) => {
            checkEmpty(data);
        });
        return this.chatBlock;
    }

    getElement() {
        return this.chatBlock;
    }

    setMessages(messages: Array<message>) {
        this.messages$.next(messages);

        this.messagesBlock.innerHTML = "";
        this.eventSList.forEach((item) => item.unsubscribe());
        this.eventSList = [];

        messages.forEach((item) => {
            this.pushMessage(item);
        });
    }

    pushMessage(messageP: message) {
        let newMessages = this.messages$.getValue();
        newMessages.push(messageP);
        this.messages$.next(newMessages);

        let message = messageP.text;
        let messageElement: HTMLElement;

        if (messageP.from.email.toUpperCase() === localStorage.getItem("email").toUpperCase()) {
            messageElement = createElementFromHTML(messageMeT);
            messageElement.querySelector(".message_text").textContent = message;
        } else {
            messageElement = createElementFromHTML(messageFromT);
            messageElement.querySelector(".message_text").textContent = message;
            const userPhoto = messageElement.querySelector(".userPhoto") as HTMLImageElement;
            userPhoto.src = messageP.from.photo;
        }
        const userName = messageElement.querySelector(".message_name");
        userName.textContent = messageP.from.name;

        const subscribe = userService.setPhoto$.subscribe((user) => {
            if (user?.email !== messageP.from.email) return;

            if (messageP.from.email.toUpperCase() !== localStorage.getItem("email").toUpperCase()) {
                const timestamp = new Date().getTime();
                let userPhoto = messageElement.querySelector(".userPhoto") as HTMLImageElement;
                userPhoto.src = `${user.photo}?timestamp=${timestamp}`;
            }

        })
        this.eventSList.push(subscribe);
        messageElement.querySelector(".message_date").textContent = formatDateStringToMessage(messageP.timestamp);


        this.messagesBlock.scrollTop = this.messagesBlock.scrollHeight;
        appendChild(this.messagesBlock, messageElement);
        this.messagesBlock.scrollTop = this.messagesBlock.scrollHeight;
    }
}