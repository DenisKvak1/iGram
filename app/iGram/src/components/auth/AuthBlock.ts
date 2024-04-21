import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { AuthBlockTemplate } from "./template";
import { iComponent } from "../../../../../env/types";
import { AuthFormFabric } from "./Fabric/fabricBlanks";
import { authController } from "../../services/AuthController";
import { Collector } from "../../../../../env/helpers/Collector";

export class AuthBlock implements iComponent {
    private authBlock: HTMLElement;
    private loginBlock: any;
    private regBlock: any;
    private collector = new Collector();

    constructor() {
        this.init();
    }

    private init() {
        this.initHTML();
        this.setupEvents();
        this.compositionComponent();
    }

    private initHTML() {
        this.authBlock = createElementFromHTML(AuthBlockTemplate);
        this.loginBlock = new AuthFormFabric("login");
        this.regBlock = new AuthFormFabric("register");
    }

    private compositionComponent() {
        this.authBlock.appendChild(this.loginBlock.createAuthBlock());
        this.authBlock.appendChild(this.regBlock.createAuthBlock());
    }

    private setupEvents() {
        this.collector.collect(
            this.loginBlock.event$.subscribe((data: any) => this.loginBlockEventHandler(data)),
            this.regBlock.event$.subscribe((data: any) => this.registerBlockEventHandler(data))
        );
    }

    private registerBlockEventHandler(data: any) {
        authController.register({
            email: data.payload.credentials.email,
            password: data.payload.credentials.password
        }, {
            name: data.payload.credentials.name
        }, data.errorCallback);
    }

    private loginBlockEventHandler(data: any) {
        authController.login({
            email: data.credentials.email,
            password: data.credentials.password
        }, data.errorCallback);
    }

    getComponent() {
        return this.authBlock;
    }

    destroy() {
        this.collector.clear();
        this.authBlock.remove();
    }
}