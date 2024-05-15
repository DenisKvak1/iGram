import likeImageURL from "../app/iGram/src/assets/images/emojiPack/like.png";
import dislikeImageURL from "../app/iGram/src/assets/images/emojiPack/dislike.png";
import greetingImageURL from "../app/iGram/src/assets/images/emojiPack/greeting.png";
import sadImageURL from "../app/iGram/src/assets/images/emojiPack/sad.png";
import angryImageURL from "../app/iGram/src/assets/images/emojiPack/angry.png";
import confusedImageURL from "../app/iGram/src/assets/images/emojiPack/confused.png";
import laughingImageURL from "../app/iGram/src/assets/images/emojiPack/laughing.png";
import funnyMerchantImageURL from "../app/iGram/src/assets/images/emojiPack/funnyMerchant.png";
import rainBowlikeImageURL from "../app/iGram/src/assets/images/emojiPack/like.gif"
export enum Config {
    HTTP_ADDRESS = "http://127.0.0.1:3000",
    WS_ADDRESS = "ws:///127.0.0.1:3000",
}

export const emojiConfig = {
    like: likeImageURL,
    dislike: dislikeImageURL,
    sad: sadImageURL,
    angry: angryImageURL,
    greeting: greetingImageURL,
    confused: confusedImageURL,
    laughing: laughingImageURL,
    funnyMerchant: funnyMerchantImageURL,
    rainBowLike: rainBowlikeImageURL
};