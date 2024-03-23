import { iChat } from "../../../../env/types";

export function sortChatsByNewest(chats: Array<iChat>) {
    return chats.sort((chatA, chatB) => {
        const findLatestMessageTime = (chat: iChat): Date | null => {
            let latestTime: Date | null = null;
            chat.history.forEach(message => {
                const messageTime = new Date(message.timestamp);
                if (!latestTime || messageTime > latestTime) {
                    latestTime = messageTime;
                }
            });
            return latestTime;
        };

        const lastMessageTimeA = findLatestMessageTime(chatA);
        const lastMessageTimeB = findLatestMessageTime(chatB);

        return (lastMessageTimeB && lastMessageTimeA) ? lastMessageTimeB.getTime() - lastMessageTimeA.getTime() :
            (lastMessageTimeA ? -1 : (lastMessageTimeB ? 1 : 0));
    });
}
