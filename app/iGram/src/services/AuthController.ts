import {
    credentials,
    IAuthController,
    iObservable, iServer,
    registerOptions,
    serverResponse,
    serverWS_COMMANDS
} from "../../../../env/types";
import { Observable } from "../../../../env/helpers/observable";
import { server } from "../modules/Server";


export class AuthController implements IAuthController {
    private server: iServer;
    isAuth$: iObservable<boolean>;

    constructor(server: iServer) {
        this.server = server;
        this.isAuth$ = new Observable<boolean>();

        this.init();
        this.checkAuth();
    }

    private init() {
        this.server.event$.subscribe((msg) => {
            if (msg.command !== serverWS_COMMANDS.LOGIN) return;

            this.isAuth$.next(true);
        });
    }

    login(credentials: credentials, errorCallback: Function): void {
        this.server.login(credentials).then((resp: any) => {
            if (resp.status === "OK") return;
            errorCallback(resp.Error);
        });
    }

    register(credentials: credentials, registerOptions: registerOptions, errorCallback: Function): void {
        this.server.register(credentials, registerOptions).then((resp: any) => {
            if (resp.status === "OK") return;
            errorCallback(resp.Error);
        });
    }

    logout(): void {
        localStorage.setItem("jwt", null);
        this.isAuth$.next(false);
    }

    private checkAuth() {
        this.server.checkAuth().then((resp: serverResponse) => {
            this.isAuth$.next(resp.status === "OK");
        });
    }
}

export const authController = new AuthController(server);