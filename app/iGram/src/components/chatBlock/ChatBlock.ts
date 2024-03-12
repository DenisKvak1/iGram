import { IAppController, iObservable, message } from "../../../../../env/types";
import { AppController } from "../../appController";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { chatInfoBlockT, chatTemplate, messageFromT, messageMeT, sendChatBlockT } from "./template";
import "./style.css";
import { Observable } from "../../../../../env/helpers/observable";
import { appendChild } from "../../../../../env/helpers/appendRemoveChildDOMElements";
import { getGroupList } from "../../hook/getList";
import { AddUserToGroup } from "../addUserToGroup/addUserToGroup";

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
            getGroupList(chatID).then((chat) => {
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
                            chatID: this.selectChat$.getValue(),
                            login: localStorage.getItem("email")
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

        const date = new Date(messageP.timestamp);
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const formattedTime = `${hours}:${minutes}`;

        if (messageP.from.toUpperCase() === localStorage.getItem("email").toUpperCase()) {
            messageElement = createElementFromHTML(messageMeT);
            messageElement.querySelector(".message_text").textContent = message;
        } else {
            messageElement = createElementFromHTML(messageFromT);
            messageElement.querySelector(".message_text").textContent = message;
        }

        let messageName = messageElement.querySelector(".message_name");
        if (!this.userData[messageP.from])  {
            this.controller.server.getUser(messageP.from).then((data) => {
                this.userData[messageP.from] = {};
                this.userData[messageP.from].photo = data.user.photo;
                this.userData[messageP.from].user = data.user.name;
                messageName.textContent = this.userData[messageP.from].user;
                if(messageP.from.toUpperCase() !== localStorage.getItem("email").toUpperCase()){
                    let userPhoto = messageElement.querySelector(".userPhoto") as HTMLImageElement;
                    userPhoto.src = this.userData[messageP.from].photo
                }
            });
        } else {
            messageName.textContent = this.userData[messageP.from].user;
            if(messageP.from.toUpperCase() !== localStorage.getItem("email").toUpperCase()){
                let userPhoto = messageElement.querySelector(".userPhoto") as HTMLImageElement;
                userPhoto.src = this.userData[messageP.from].photo
            }
        }
        this.controller.server.event$.subscribe((data) => {
            if (data.command === "setUserPhoto" && data.payload.login === messageP.from) {
                if(messageP.from.toUpperCase() !== localStorage.getItem("email").toUpperCase()){
                    const timestamp = new Date().getTime();
                    let userPhoto = messageElement.querySelector(".userPhoto") as HTMLImageElement;
                    userPhoto.src = `${userPhoto.src}?timestamp=${timestamp}`;
                }
            }
        });
        messageElement.querySelector(".message_date").textContent = formattedTime;

        appendChild(this.messagesBlock, messageElement);
    }
}