import {
    componentsEvent,
    componentsEvent_COMMANDS,
    iObservable,
    requestData
} from "../../../../../env/types";
import { createElementFromHTML } from "../../../../../env/helpers/createElementFromHTML";
import { addFriendBlockTemplate } from "./template";
import { Observable } from "../../../../../env/helpers/observable";
import "./style.css";

export class AddToFriendBlock {
    addFriendBlock: HTMLElement
    addFriend$: iObservable<string>
    requestData$: iObservable<requestData>
    event$: iObservable<componentsEvent>
    constructor() {
        this.addFriend$ = new Observable<string>()

        this.requestData$ = new Observable<requestData>()
        this.event$ = new Observable<componentsEvent>()
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
                this.event$.next({
                    command: componentsEvent_COMMANDS.FRIEND_REQUEST,
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
}