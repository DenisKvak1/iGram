import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { emojiBtnTemplate, emojiOpenBtnTemplate, emojiPanelTemplate } from "./template";
import { Observable } from "../../../../../env/helpers/observable";
import { iComponent, iPopover } from "../../../../../env/types";
import { Popover } from "../Popover/Popover";
import "./style.css";

export class EmojiPanel implements iComponent {
    private codeBook: { [key: string]: string };
    private emojiPanel: HTMLElement;
    private emojiList: HTMLElement;
    private openButton: HTMLElement;
    private popover: iPopover;
    emoji$ = new Observable<string>();

    constructor(codeBook: { [key: string]: string }) {
        this.codeBook = codeBook;

        this.init();
    }

    openPopover() {
        this.popover.open();
    }

    closePopover() {
        this.popover.close();
    }

    private init() {
        this.initHTML();
        this.setupEmojiList();
        this.initPopover();
    }

    private initHTML() {
        this.emojiPanel = createElementFromHTML(emojiPanelTemplate);
        this.openButton = createElementFromHTML(emojiOpenBtnTemplate);
        this.emojiList = this.emojiPanel.querySelector(".emojiList");
    }

    private setupEmojiList() {
        for (const key in this.codeBook) {
            this.createEmojiElement(key);
        }
    }

    private createEmojiElement(key: string) {
        const emojiElement = createElementFromHTML(emojiBtnTemplate);
        emojiElement.onclick = () => {
            this.emoji$.next(key);
        };
        const imgElement = emojiElement.querySelector("img");
        imgElement.src = this.codeBook[key];
        this.emojiList.appendChild(emojiElement);
    }

    private initPopover() {
        this.popover = new Popover(this.openButton, this.emojiPanel);
    }

    getComponent() {
        return this.openButton;
    }

    destroy() {

    }
}
