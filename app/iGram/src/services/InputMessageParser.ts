import { escapeHtml } from "../../../../env/helpers/escapeHTML";
import { emojiParser } from "../modules/EmojiParser";
import { IEmojiParser, IInputMessageParser } from "../../../../env/types";

class InputMessageParser implements IInputMessageParser {
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

export const inputMessageParser = new InputMessageParser(emojiParser);