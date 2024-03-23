import { iCache, iChat, iChatsCache } from "../../../../../../env/types";
import { Cache } from "../Cache";
import { server } from "../../../appController";

export class ChatsCache implements iChatsCache {
    cashBD: { [key: string]: iCache<Promise<iChat>> };

    constructor() {
        this.cashBD = {};
    }

    addChat(chatId: string) {
        if (this.cashBD[chatId]) return;
        this.cashBD[chatId] = new Cache<Promise<iChat>>(500, async () => {
            let resp = await server.getChats(chatId);
            if (resp?.data?.length === 0 || !resp.data) return undefined;
            if (resp?.data[0]) {
                return resp?.data[0];
            } else {
                return undefined;
            }
        });
    }

    async getChat(id: string) {
        return this.cashBD[id]?.getData();
    }
}
