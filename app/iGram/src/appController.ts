import { IAppController, serverResponse } from "../../../env/types";
import { MainPage } from "./pages/main/main";
import { server } from "./modules/Server";
import { authController } from "./services/AuthController";


export class AppController implements IAppController {
    private static instance: AppController;
    root: HTMLElement;

    private constructor() {
        this.root = document.getElementById("app");
        server.checkAuth().then((resp: serverResponse) => {
            authController.isAuth$.next(resp.status === "OK");
        });
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
            const mainPage = new MainPage(authController.isAuth$);
            this.root.appendChild(mainPage.createPageElement());
        });
    }
}
