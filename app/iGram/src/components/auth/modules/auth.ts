import "../style.css";
import { createElementFromHTML } from "../../../../../../env/helpers/createElementFromHTML";
import { authBlockOptions, IAuthForm, iObservable } from "../../../../../../env/types";
import { authForm } from "./template";
import { createElement } from "../../../../../../env/helpers/createDOMElements";
import { Observable } from "../../../../../../env/helpers/observable";

export class AuthForm implements IAuthForm {
    private options: authBlockOptions;
    private inputs: Array<HTMLInputElement>;
    event$: iObservable<any>;

    constructor(options: authBlockOptions) {
        this.event$ = new Observable<any>();

        this.options = options;
        this.inputs = [];
    }

    createAuthBlock() {
        const form = createElementFromHTML(authForm);
        const btn = form.querySelector(".submitAuth") as HTMLButtonElement;
        const authError = form.querySelector(".authError");
        btn.textContent = this.options.buttonName;
        this.options.inputs.forEach((item) => {
            let input = createElement("input") as HTMLInputElement;
            input.placeholder = item.placeHolder;
            this.inputs.push(input);

            btn.insertAdjacentElement("beforebegin", input);
        });
        btn.onclick = async (event) => {
            event.preventDefault();
            let error: boolean;
            this.inputs.forEach((item, index) => {
                let regExp = new RegExp(this.options.inputs[index].regExp);
                if (!regExp.test(item.value)) {
                    item.style.boxShadow = "0 0 3px red";
                    item.value = "";
                    error = true;
                } else {
                    item.style.boxShadow = "";
                }
            });
            if (error) return;

            let values = this.inputs.map((item) => item.value);

            let objectValues: any = {};
            this.options.inputs.forEach((item, index) => {
                objectValues[item.nameInCredential] = values[index];
            });
            this.event$.next({
                credentials: { ...objectValues },
                errorCallback: (error: string) => {
                    authError.textContent = error;
                }
            });
            this.inputs.map((item) => item.value = "");
        };
        return form;
    }
}