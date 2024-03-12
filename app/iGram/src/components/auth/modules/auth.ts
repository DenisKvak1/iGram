import "../style.css";
import { createElementFromHTML } from "../../../../../../env/helpers/createElementFromHTML";
import { authBlockOptions, IAuthForm } from "../../../../../../env/types";
import { authForm } from "./template";
import { createElement } from "../../../../../../env/helpers/createDOMElements";

export class AuthForm implements IAuthForm{
    private options: authBlockOptions;
    private inputs: Array<HTMLInputElement>
    constructor(options:authBlockOptions) {
        this.options = options
        this.inputs = []
    }
    createAuthBlock(){
        let form = createElementFromHTML(authForm)
        let btn = form.querySelector('.submitAuth') as HTMLButtonElement
        let errorSpan = form.querySelector('.authError')
        btn.textContent = this.options.buttonName
        this.options.inputs.forEach((item)=>{
            let input = createElement('input') as HTMLInputElement
            input.placeholder = item.placeHolder
            this.inputs.push(input)

            btn.insertAdjacentElement('beforebegin', input)
        })
        btn.onclick = async (event)=>{
            event.preventDefault()
            let error:boolean
            this.inputs.forEach((item, index)=>{
                let regExp = new RegExp(this.options.inputs[index].regExp)
                if(!regExp.test(item.value)){
                    item.style.boxShadow = "0 0 3px red"
                    item.value = ''
                    error = true
                } else {
                    item.style.boxShadow = ''
                }
            })
            if(error) return

            let values = this.inputs.map((item)=>item.value)
            this.options.callback(...values, {
                error: (error:string)=>{
                    errorSpan.textContent = error
                },
                ok: ()=>{
                    errorSpan.textContent=''
                    form.style.boxShadow = "0 0 3px green"
                    setTimeout(()=>form.style.boxShadow = "", 3000)
                }})
            this.inputs.map((item)=>item.value = '')
        }
        return form
    }
}