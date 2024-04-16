import { iReactiveChatInfo } from "../types";

export function sortChatsByNewest(chats: Array<iReactiveChatInfo>) {
    return chats.sort((chatA, chatB) => {
        const findLatestMessageTime = (chat: iReactiveChatInfo): Date | null => {
            let latestTime: Date | null = null;
            chat.history.getValue().forEach(message => {
                const messageTime = new Date(message.getValue().timestamp);
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
