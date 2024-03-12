import { AppController } from "../appController";

export function addToFriendHook(login:string){
    const controller = AppController.getInstance()
    controller.server.push({
        command: "friendRequest",
        payload: {
            login: login
        }
    })
}