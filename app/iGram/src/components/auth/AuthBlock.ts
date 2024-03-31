import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { AuthBlockTemplate } from "./template";
import {
    componentsEvent,
    componentsEvent_COMMANDS,
    externalData,
    IAppController,
    iObservable,
    requestData
} from "../../../../../env/types";
import { AuthFormFabric } from "./Fabric/fabricBlanks";
import { Observable } from "../../../../../env/helpers/observable";

export class AuthBlock {
    controller: IAppController;
    private AuthBlock: HTMLElement;

    externalEvent$: iObservable<externalData>;
    requestData$: iObservable<requestData>;
    event$: iObservable<componentsEvent>;

    constructor() {
        this.externalEvent$ = new Observable<externalData>;
        this.requestData$ = new Observable<requestData>();
        this.event$ = new Observable<componentsEvent>();

        this.init();
    }

    init() {
        let authBlock = createElementFromHTML(AuthBlockTemplate);
        let loginBlock: any = new AuthFormFabric("login");
        let regBlock: any = new AuthFormFabric("register");

        loginBlock.event$.subscribe((data: componentsEvent) => this.event$.next({
            command: componentsEvent_COMMANDS.LOGIN,
            payload: {
                credentials: {
                    email: data.payload.credentials.email,
                    password: data.payload.credentials.password
                }
            }
        }));
        loginBlock.requestData$.subscribe((data: requestData) => this.requestData$.next(data));
        this.externalEvent$.subscribe((data) => loginBlock.externalEvent$.next(data));

        regBlock.event$.subscribe((data: componentsEvent) => this.event$.next({
            command: componentsEvent_COMMANDS.REGISTER,
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
        regBlock.requestData$.subscribe((data: requestData) => this.requestData$.next(data));
        this.externalEvent$.subscribe((data) => regBlock.externalEvent$.next(data));

        authBlock.appendChild(loginBlock.createAuthBlock());
        authBlock.appendChild(regBlock.createAuthBlock());
        this.AuthBlock = authBlock;
    }

    createAuthBlock() {
        return this.AuthBlock;
    }
}