import { iChat } from "../../../../env/types";

export function sortChatsByNewest(chats:Array<iChat>) {
    return chats.sort((chatA, chatB) => {
        const lastMessageTimeA = new Date(chatA.history[chatA.history.length - 1].timestamp);
        const lastMessageTimeB = new Date(chatB.history[chatB.history.length - 1].timestamp);
        if (lastMessageTimeA > lastMessageTimeB) {
            return -1;
        } else if (lastMessageTimeA < lastMessageTimeB) {
            return 1;
        } else {
            return 0;
        }
    });
}