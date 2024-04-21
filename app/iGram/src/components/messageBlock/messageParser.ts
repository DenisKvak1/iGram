import { escapeHtml } from "../../../../../env/helpers/escapeHTML";

class MessageParser {
    private readonly keySymbol: string;
    private readonly codeBook: { [key: string]: string };

    constructor(keySymbol: string, codeBook: { [key: string]: string }) {
        this.keySymbol = keySymbol;
        this.codeBook = codeBook;
    }

    parse(string: string): string {
        const validateString = escapeHtml(string)
        const matchesCode = this.matchCodes(this.keySymbol, validateString);
        const parsedString = this.replaceSymbolToImg(validateString, matchesCode);
        return parsedString;
    }

    private replaceSymbolToImg(string: string, matchStrings: string[]) {
        let tempString = string;
        matchStrings.forEach((item) => {
            const symbol = this.codeBook[this.trimCharacters(item)];
            if (!symbol) return;
            tempString = tempString.replace(item, `<img src="${symbol}">`);
        });
        return tempString;
    }

    private matchCodes(keySymbol: string, string: string) {
        const regExp = new RegExp(`${keySymbol}([^${keySymbol}]+)${keySymbol}`, "g");
        return string.match(regExp);
    }

    private trimCharacters(string: string) {
        string = string.substring(1);
        string = string.slice(0, -1);
        return string;
    }
}

const codeBook = {
    code1: "./dirt.png",
    code2: "./ikra.png"
};
export const messageParser = new MessageParser("#", codeBook);
