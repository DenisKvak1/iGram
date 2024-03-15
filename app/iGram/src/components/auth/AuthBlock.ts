import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { AuthBlockTemplate } from "./template";
import { IAppController } from "../../../../../env/types";
import { AuthFormFabric } from "./Fabric/fabricBlanks";
import { AppController } from "../../appController";

export class AuthBlock {
    controller: IAppController;
    private AuthBlock:HTMLElement
    constructor() {
        this.controller = AppController.getInstance();

        this.init()
    }
    init(){
        let authBlock = createElementFromHTML(AuthBlockTemplate);
        let render = (isAuth: boolean) => {
            let loginBlock: any = new AuthFormFabric("login", this.controller.server);
            let regBlock: any = new AuthFormFabric("register", this.controller.server);
            if (!isAuth) {
                if (authBlock.innerHTML.trim()) return;
                authBlock.appendChild(loginBlock.createAuthBlock());
                authBlock.appendChild(regBlock.createAuthBlock());
            } else {
                authBlock.innerHTML = "";
            }
        };
        this.controller.isAuth$.subscribe((isAuth) => {
            render(isAuth);
        });
        render(this.controller.isAuth$.getValue());
        this.AuthBlock = authBlock
    }
    createAuthBlock() {
        return this.AuthBlock
    }
}