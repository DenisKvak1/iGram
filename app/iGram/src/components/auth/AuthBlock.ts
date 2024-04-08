import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { AuthBlockTemplate } from "./template";
import { IAppController, iComponent } from "../../../../../env/types";
import { AuthFormFabric } from "./Fabric/fabricBlanks";
import { authController } from "../../services/AuthController";

export class AuthBlock implements iComponent {
    controller: IAppController;
    private AuthBlock: HTMLElement;

    constructor() {
        this.init();
    }

    init() {
        let authBlock = createElementFromHTML(AuthBlockTemplate);
        let loginBlock: any = new AuthFormFabric("login");
        let regBlock: any = new AuthFormFabric("register");

        loginBlock.event$.subscribe((data: any) => {
            authController.login({
                email: data.credentials.email,
                password: data.credentials.password
            }, data.errorCallback);
        });

        regBlock.event$.subscribe((data: any) => {
            authController.register({
                email: data.payload.credentials.email,
                password: data.payload.credentials.password
            }, {
                name: data.payload.credentials.name
            }, data.errorCallback);
        });

        authBlock.appendChild(loginBlock.createAuthBlock());
        authBlock.appendChild(regBlock.createAuthBlock());
        this.AuthBlock = authBlock;
    }

    createElement() {
        return this.AuthBlock;
    }

    getElement() {
        return this.AuthBlock;
    }
}