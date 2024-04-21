import { IAppController } from "../../../env/types";
import { MainPage } from "./pages/main/main";
import { authController } from "./services/AuthController";
import { server } from "./modules/Server";


export class AppController implements IAppController {
    private static instance: AppController;
    root: HTMLElement;

    private constructor() {
        this.root = document.getElementById("app");
        authController.isAuth$.once(() => {
            this.init();
        });
    }

    static getInstance(): AppController {
        if (!AppController.instance) {
            AppController.instance = new AppController();
        }
        return AppController.instance;
    }

    private init() {
        server.ready$.onceOr(server.ready$.getValue(), () => {
            const mainPage = new MainPage();
            this.root.appendChild(mainPage.getComponent());
        });
    }
}