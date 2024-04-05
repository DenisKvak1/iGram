import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { AuthBlockTemplate } from "./template";
import { authFormCommand, componentsEvent, componentsID, IAppController, iComponent } from "../../../../../env/types";
import { AuthFormFabric } from "./Fabric/fabricBlanks";
import { channelInput$ } from "../../modules/componentDataSharing";

export class AuthBlock implements iComponent{
    controller: IAppController;
    private AuthBlock: HTMLElement;
    constructor() {
        this.init();
    }

    init() {
        let authBlock = createElementFromHTML(AuthBlockTemplate);
        let loginBlock: any = new AuthFormFabric("login");
        let regBlock: any = new AuthFormFabric("register");

        loginBlock.event$.subscribe((data: componentsEvent) => channelInput$.next({
            id: componentsID.authForm,
            command: authFormCommand.LOGIN,
            payload: {
                credentials: {
                    email: data.payload.credentials.email,
                    password: data.payload.credentials.password
                }
            }
        }));

        regBlock.event$.subscribe((data: componentsEvent) => channelInput$.next({
            id: componentsID.authForm,
            command: authFormCommand.REGISTER,
            payload: {
                credentials: {
                    email: data.payload.credentials.email,
                    password: data.payload.credentials.password
                },
                registerOptions: {
                    name: data.payload.credentials.name
                }
            }
        }));

        authBlock.appendChild(loginBlock.createAuthBlock());
        authBlock.appendChild(regBlock.createAuthBlock());
        this.AuthBlock = authBlock;
    }

    createElement() {
        return this.AuthBlock;
    }
    getElement(){
        return this.AuthBlock
    }
}