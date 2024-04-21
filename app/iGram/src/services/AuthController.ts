import {
    credentials,
    IAuthController,
    iObservable,
    registerOptions,
    serverResponse,
    serverWS_COMMANDS
} from "../../../../env/types";
import { Observable } from "../../../../env/helpers/observable";
import { server } from "../modules/Server";

export class AuthController implements IAuthController {
    isAuth$: iObservable<boolean>;

    constructor() {
        this.isAuth$ = new Observable<boolean>();

        this.init()
        this.checkAuth();
    }
    private init(){
        server.event$.subscribe((msg)=>{
            if(msg.command !== serverWS_COMMANDS.LOGIN) return

            this.isAuth$.next(true)
        })
    }
    login(credentials: credentials, errorCallback: Function): void {
        server.login(credentials).then((resp: any) => {
            if (resp.status === "OK") return;
            errorCallback(resp.Error);
        });
    }

    register(credentials: credentials, registerOptions: registerOptions, errorCallback: Function): void {
        server.register(credentials, registerOptions).then((resp: any) => {
            if (resp.status === "OK") return;
            errorCallback(resp.Error);
        });
    }

    logout(): void {
        localStorage.setItem("jwt", null);
        this.isAuth$.next(false);
    }

    private checkAuth() {
        server.checkAuth().then((resp: serverResponse) => {
            this.isAuth$.next(resp.status === "OK");
        });
    }
}

export const authController = new AuthController()