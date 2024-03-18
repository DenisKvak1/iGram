import { IAppController, iObservable, iServer, serverResponse } from "../../../env/types";
import { Server } from "./modules/Server";
import { Observable } from "../../../env/helpers/observable";
import { MainPage } from "./pages/main/main";

export class AppController implements IAppController {
    private static instance: AppController;

    server: iServer;
    isAuth$: iObservable<boolean>;
    root: HTMLElement;

    private constructor() {
        this.root = document.getElementById("app");
        this.isAuth$ = new Observable<boolean>();
        this.server = new Server("http://127.0.0.1:3000", "ws:///127.0.0.1:3000", this);
        this.server.checkAuth().then((resp: serverResponse) => {
            this.isAuth$.next(resp.status === "OK");
        });
        this.isAuth$.once(() => {
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
        let render = () => {
            let mainPage = new MainPage();
            this.root.appendChild(mainPage.createPageElement());

            this.server.webSocket.removeEventListener("open", render);
        };
        if (this.server.webSocket.readyState === WebSocket.OPEN) {
            render();
            return;
        }
        this.server.webSocket.addEventListener("open", render);
    }
}
