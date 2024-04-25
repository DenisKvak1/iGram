import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { iPopover } from "../../../../../env/types";
import "./style.css"
export class Popover implements iPopover{
    openElement: HTMLElement;
    content: string | HTMLElement;
    isOpen: boolean;
    contentElement: HTMLElement;

    constructor(openElement: HTMLElement, content: string | HTMLElement) {
        this.openElement = openElement;
        this.content = content;
        this.isOpen = false;
        this.init();
    }

    private init() {
        this.initHTML();
        this.initEvent();
    }

    private initHTML() {
        this.openElement.classList.add("popover-container");
        if (this.content instanceof HTMLElement) {
            this.contentElement = this.content;
        } else {
            this.contentElement = createElementFromHTML(this.content);
        }
        this.contentElement.classList.add("popover-content");
    }

    private initEvent() {
        this.openElement.onclick = (event) => {
            if(event.target === this.contentElement || this.contentElement.contains(event.target as HTMLElement)) return

            this.toggle()
        };
    }

    open() {
        this.openElement.appendChild(this.contentElement);
        setTimeout(() => this.contentElement.classList.add("show"), 0);
        this.isOpen = true;
    }

    close() {
        this.contentElement.classList.remove("show");
        setTimeout(() => this.contentElement.remove(), 110);
        this.isOpen = false;
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
}