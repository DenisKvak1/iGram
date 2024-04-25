import { iComponent, iObservable, iReactiveMessage } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";

import { formatDateStringToMessage } from "../../../../../env/helpers/formatTime";
import { reactivity, reactivityHTML } from "../../../../../env/reactivity2.0/reactivity";
import { reactivityAttribute } from "../../../../../env/reactivity2.0/reactivityAttribute";
import { Collector } from "../../../../../env/helpers/Collector";
import { computed } from "../../../../../env/reactivity2.0/computed";
import { messageParser } from "../../services/messageParser";
import { messageFromT, messageMeT } from "./template";
import { Modal } from "../modal/Modal";
import { createElement } from "../../../../../env/helpers/createDOMElements";
import "./style.css"
export class MessageBlock implements iComponent {
    private message: iObservable<iReactiveMessage>;
    private messageBlock: HTMLElement;
    private photo: HTMLImageElement;
    private nameBlock: HTMLElement;
    private messageDate: HTMLElement;
    private messageText: HTMLElement;
    private messagePhoto: HTMLImageElement;
    private collector = new Collector();

    constructor(msg: iObservable<iReactiveMessage>) {
        this.message = msg;

        this.init();
    }

    private init() {
        this.initHTML();
        this.setupHTMLUpdate();
        this.setupPhotoModal()
    }

    private initHTML() {
        if (this.checkMeMessage()) {
            this.messageBlock = createElementFromHTML(messageMeT);
        } else {
            this.messageBlock = createElementFromHTML(messageFromT);
        }
        this.photo = this.messageBlock.querySelector(".userPhoto") as HTMLImageElement;
        this.nameBlock = this.messageBlock.querySelector(".message_name");
        this.messageDate = this.messageBlock.querySelector(".message_date");
        this.messageText = this.messageBlock.querySelector(".message_text");
        this.messagePhoto = this.messageBlock.querySelector(".message_photo");
    }

    private setupHTMLUpdate() {
        const messageValue = this.message.getValue();
        const { text, from, photo } = messageValue;
        const { userPhoto, name } = from;

        const messageTextComputed = computed(text, () => messageParser.parseMessage(text.getValue()));
        this.collector.collect(
            reactivityHTML(messageTextComputed.observer, this.messageText),
            reactivity(name, this.nameBlock),
            messageTextComputed.subscribe
        );
        if (photo.getValue()) {
            this.messagePhoto.src = photo.getValue();
        }

        if (!this.checkMeMessage()) this.collector.collect(reactivityAttribute(userPhoto, this.photo, "src"));
        this.messageDate.textContent = formatDateStringToMessage(this.message.getValue().timestamp);
    }
    private setupPhotoModal(){
        const imageToModal = createElement('img') as HTMLImageElement
        imageToModal.src = this.message.getValue().photo.getValue()
        imageToModal.classList.add('imageToModal')

        const modal = new Modal(imageToModal);
        modal.setOptions({padding: '0', maxWidth: '95%', maxHeight: '80%', background: 'none', boxShadow: '0px 0 0 0'})
        this.messagePhoto.onclick = () => modal.open();
    }
    private checkMeMessage() {
        const emailFromLocalStorage = localStorage.getItem("email").toUpperCase();
        const messageEmail = this.message.getValue().from.email.getValue().toUpperCase();

        return messageEmail === emailFromLocalStorage;
    }

    getComponent() {
        return this.messageBlock;
    }

    destroy() {
        this.collector.clear();
        this.messageBlock.remove();
    }
}