import { iComponent } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { addFriendBlockTemplate } from "./template";
import { Observable } from "../../../../../env/helpers/observable";
import "./style.css";
import { userService } from "../../services/UserService";

export class AddToFriendBlock implements iComponent {
    addFriendBlock: HTMLElement;
    addFriend$ = new Observable<string>();
    private friendInput: HTMLInputElement;
    private addButton: HTMLButtonElement;

    constructor() {
        this.init();
    }

    private init() {
        this.initHTML();
        this.setupAddFriendEvent();
    }

    private initHTML() {
        this.addFriendBlock = createElementFromHTML(addFriendBlockTemplate);
        this.addButton = this.addFriendBlock.querySelector("button");
        this.friendInput = this.addFriendBlock.querySelector("input");
    }

    getComponent() {
        return this.addFriendBlock;
    }

    unMounted() {
        this.addFriendBlock.remove();
    }

    private setupAddFriendEvent() {
        this.addButton.onclick = () => {
            const inputValue = this.friendInput.value;
            if (!this.inputValidate(this.friendInput)) return;
            this.addFriend$.next(inputValue);
            userService.friendRequest(inputValue);
        };
    }

    private inputValidate(input: HTMLInputElement) {
        const resultEmailValidate = this.validateEmail(input.value);
        if (resultEmailValidate) {
            input.style.boxShadow = "";
            input.value = "";
        } else {
            input.style.boxShadow = "0 0 3px #ff0000";
        }
        return resultEmailValidate;
    }

    private validateEmail(value: string) {
        const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegExp.test(value);
    }
}