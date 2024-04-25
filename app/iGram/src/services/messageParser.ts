import { escapeHtml } from "../../../../env/helpers/escapeHTML";
import { emojiParser } from "../modules/EmojiParser";
import { IEmojiParser, IMessageParser } from "../../../../env/types";

class MessageParser implements IMessageParser {
    private emojiParser: IEmojiParser;

    constructor(emojiParser: IEmojiParser) {
        this.emojiParser = emojiParser
    }

    parseMessage(string: string): string {
        const validateString = escapeHtml(string);
        const parsedMessage = this.emojiParser.parseToEmoji(validateString);
        return parsedMessage;
    }
}

export const messageParser = new MessageParser(emojiParser);