import { createTemplateFromHTML } from "../../../../env/helpers/createElementFromHTML";

import { emojiConfig } from "../../../../env/config";
import { IEmojiParser } from "../../../../env/types";

class EmojiParser implements IEmojiParser {
    private readonly keySymbol: string;
    private readonly codeBook: { [key: string]: string };
    private readonly dataAttribute: string;

    constructor(dataAttribute: string, keySymbol: string, codeBook: { [key: string]: string }) {
        this.dataAttribute = dataAttribute;
        this.keySymbol = keySymbol;
        this.codeBook = codeBook;
    }

    getEmojiBySymbol(symbol: string) {
        const parsedString = this.replaceSymbolToImg(symbol, [symbol]);
        return parsedString;
    }

    parseToEmoji(string: string): string {
        const matchesCode = this.matchCodes(this.keySymbol, string);
        const parsedString = this.replaceSymbolToImg(string, matchesCode);

        return parsedString;
    }

    parseFromEmoji(string: string) {
        const template = createTemplateFromHTML(string);

        const images = template.content.querySelectorAll("img");
        images.forEach((img) => {
            const emojiAttribute = img.getAttribute(this.dataAttribute);
            const regExp = new RegExp(`<img.*?${this.dataAttribute}="${emojiAttribute}".*?>`, "g");
            string = string.replace(regExp, `${this.keySymbol}${emojiAttribute}${this.keySymbol}`);
        });
        return string;
    }

    private replaceSymbolToImg(string: string, matchStrings: string[]) {
        let tempString = string;
        matchStrings?.forEach((item) => {
            const symbol = this.trimCharacters(item);
            const src = this.codeBook[symbol];
            if (!src) return;
            tempString = tempString.replace(item, `<img src="${src}" ${this.dataAttribute}="${symbol}">`);
        });
        return tempString;
    }

    private matchCodes(keySymbol: string, string: string) {
        const regExp = new RegExp(`${keySymbol}([^${keySymbol}]+)${keySymbol}`, "g");
        return string.match(regExp);
    }

    private trimCharacters(string: string) {
        const tempString = string.replace(new RegExp(this.keySymbol, "g"), "");
        return tempString;
    }
}


export const emojiParser = new EmojiParser("data-emoji", "#", emojiConfig);
