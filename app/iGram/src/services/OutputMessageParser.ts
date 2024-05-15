import { IEmojiParser, IOutputMessageParser } from "../../../../env/types";
import { emojiParser } from "../modules/EmojiParser";

class OutputMessageParser implements IOutputMessageParser {
    private emojiParser: IEmojiParser;

    constructor(emojiParser: IEmojiParser) {
        this.emojiParser = emojiParser
    }

    parseMessage(string: string): string {
        const parsedMessage = this.emojiParser.parseFromEmoji(string);
        return parsedMessage;
    }
}

export const outputMessageParser = new OutputMessageParser(emojiParser)