import { addToFriendCommand, componentsID, iComponent, iObservable } from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { addFriendBlockTemplate } from "./template";
import { Observable } from "../../../../../env/helpers/observable";
import "./style.css";
import { channelInput$ } from "../../modules/componentDataSharing";

export class AddToFriendBlock implements iComponent{
    addFriendBlock: HTMLElement
    addFriend$: iObservable<string>
    constructor() {
        this.addFriend$ = new Observable<string>()

    }
    createElement(){
        const emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        this.addFriendBlock = createElementFromHTML(addFriendBlockTemplate)
        const btn = this.addFriendBlock.querySelector('button')
        const input = this.addFriendBlock.querySelector('input')
        btn.onclick = ()=>{
            if(!input.value) return
            if(emailRegExp.test(input.value)){
                this.addFriend$.next(input.value)
                input.style.boxShadow = ''
                channelInput$.next({
                    id: componentsID.addToFriend,
                    command: addToFriendCommand.FRIEND_REQUEST,
                    payload: {
                        login: input.value
                    }
                })


                input.value = ''
            } else {
                input.style.boxShadow = "0 0 3px #ff0000"
            }
        }
        return this.addFriendBlock
    }
    getElement(){
        return this.addFriendBlock
    }
}