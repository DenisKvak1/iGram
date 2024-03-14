import { IAppController, iChat, iObservable, message } from "../../../../../env/types";
import { AppController } from "../../appController";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { chatInfoBlockT, chatTemplate, messageFromT, messageMeT, sendChatBlockT } from "./template";
import "./style.css";
import { Observable } from "../../../../../env/helpers/observable";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { getGroupList } from "../../hook/getList";
import { AddUserToGroup } from "../addUserToGroup/addUserToGroup";
import { formatDateStringToMessage } from "../../../../../env/helpers/formatTime";

export class ChatBlock {
    controller: IAppController;
    chatBlock: HTMLElement;
    messages$: iObservable<Array<message>>;
    messagesBlock: HTMLElement;
    selectChat$: iObservable<string>;
    userData: Record<string, any>;

    constructor(selectChat: iObservable<string>) {
        this.selectChat$ = selectChat;
        this.controller = AppController.getInstance();
        this.messages$ = new Observable<Array<message>>([]);
        this.userData = {};

        this.init();
    }

    init() {
        this.chatBlock = createElementFromHTML(chatTemplate);
        this.messagesBlock = this.chatBlock.querySelector(".mainMessageBlock");

        this.selectChat$.subscribe(async (chatID) => {
            if (!chatID) return;
            getGroupList(chatID).then((chat: Array<iChat>) => {
                let historyMessages = chat[0].history;
                let groupName = chat[0].groupName;
                this.chatBlock.querySelector(".chat_name").textContent = groupName;
                this.setMessages(historyMessages);
            });
        });

        this.controller.server.event$.subscribe((message) => {
            if (message.command === "message") {
                if (message.payload.to !== this.selectChat$.getValue()) return;
                this.pushMessage(message.payload as message);
            }
        });
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
                const addToGruup = new AddUserToGroup(this.selectChat$);
                leaveGroup.insertAdjacentElement("beforebegin", addToGruup.createElement());

                uploadPhoto.onchange = () => {
                    const selectedFile = uploadPhoto.files?.[0];

                    if (selectedFile && (selectedFile.type === "image/jpeg" || selectedFile.type === "image/png")) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                            const arrayBuffer = event.target?.result as ArrayBuffer;
                            const uint8Array = new Uint8Array(arrayBuffer);

                            this.controller.server.push({
                                command: "setGroupPhoto",
                                payload: {
                                    chatID: this.selectChat$.getValue(),
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
                let sendMessage = () => {
                    if (!inputMessage.value) return;
                    this.controller.server.push({
                        "command": "message",
                        "payload": {
                            "from": localStorage.getItem("email"),
                            "to": this.selectChat$.getValue(),
                            "text": inputMessage.value
                        }
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
                    this.controller.server.push({
                        "command": "leaveGroup",
                        "payload": {
                            chatID: this.selectChat$.getValue()
                        }
                    });
                };
                appendChild(this.chatBlock, toSendBlock);
                this.chatBlock.insertAdjacentElement("afterbegin", toChatInfoBlock);
            }
        };
        checkEmpty(this.selectChat$.getValue());
        this.selectChat$.subscribe((data) => {
            checkEmpty(data);
        });
    }

    getElement() {
        return this.chatBlock;
    }

    setMessages(messages: Array<message>) {
        this.messages$.next(messages);

        this.messagesBlock.innerHTML = "";
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

        this.controller.server.event$.subscribe((data) => {
            if (data.command === "setUserPhoto" && data.payload.login === messageP.from.email) {
                if (messageP.from.email.toUpperCase() !== localStorage.getItem("email").toUpperCase()) {
                    const timestamp = new Date().getTime();
                    let userPhoto = messageElement.querySelector(".userPhoto") as HTMLImageElement;
                    userPhoto.src = `${data.payload.photo}?timestamp=${timestamp}`;
                }
            }
        });
        messageElement.querySelector(".message_date").textContent = formatDateStringToMessage(messageP.timestamp);;

        this.messagesBlock.scrollTop = this.messagesBlock.scrollHeight;
        appendChild(this.messagesBlock, messageElement);
        this.messagesBlock.scrollTop = this.messagesBlock.scrollHeight;
    }
}