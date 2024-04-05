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
            let resp = await server.getChat(chatId);
            if (!resp?.data) return undefined;
            return resp?.data;
        });
    }

    async getChat(id: string) {
        return this.cashBD[id]?.getData();
    }
}
