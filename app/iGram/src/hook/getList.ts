import { AppController } from "../appController";
import { iChat } from "../../../../env/types";

export async function getFriendsInviteList(): Promise<Array<string>>{
    let controller = AppController.getInstance()
    let response = await controller.server.getFriendsInvites()
    if(response.status === "OK"){
        return response.requests as Array<string>
    }
    return undefined
}
export async function getFriendsList(): Promise<Array<string>>{
    let controller = AppController.getInstance()
    let response = await controller.server.getFriends()
    if(response.status === "OK"){
        return response.requests as Array<string>
    }
    return undefined
}
export async function getGroupList(id?: string): Promise<Array<iChat>> {
    let controller = AppController.getInstance();
    let response = await controller.server.getChats(id);

    if (response.status === "OK") {
        return id ? response.data : response.data;
    }

    return undefined;
}

