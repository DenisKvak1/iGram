import { AppController } from "../appController";
import { iChat, UserInfo } from "../../../../env/types";

export async function getFriendsInviteList(): Promise<Array<UserInfo>>{
    let controller = AppController.getInstance()
    let response = await controller.server.getFriendsInvites()
    if(response.status === "OK"){
        return response.requests
    }
    return undefined
}
export async function getFriendsList(): Promise<Array<UserInfo>>{
    let controller = AppController.getInstance()
    let response = await controller.server.getFriendsList()
    if(response.status === "OK"){
        return response.requests
    }
    return undefined
}
export async function getGroupList(id?: string): Promise<Array<iChat>>{
    let controller = AppController.getInstance();
    let response = await controller.server.getChats(id);
    if (response.status === "OK") {
        return response.data
    }

    return undefined;
}

