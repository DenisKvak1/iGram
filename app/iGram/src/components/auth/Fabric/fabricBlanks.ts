import { AuthForm } from "../modules/auth";

export class AuthFormFabric {

    constructor(type:string) {

        if(type === "login"){
            return new AuthForm({
                buttonName: 'Войти',
                inputs: [
                    {placeHolder: "email", regExp:"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"},
                    {placeHolder: "password", regExp:"^[a-zA-Z0-9!@#$%^&*()_+{}\\[\\]:;<>,.?~\\\\-]+$"}
                ]
            })
        } else if(type === "register"){
            return new AuthForm({
                buttonName: 'Зарегестрироватся',
                inputs: [
                    {placeHolder: "email", regExp:"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"},
                    {placeHolder: "password", regExp:"^[a-zA-Z0-9!@#$%^&*()_+{}\\[\\]:;<>,.?~\\\\-]+$"},
                    {placeHolder: "name", regExp:"^[a-zA-Zа-яА-Я]+(?:-[a-zA-Zа-яА-Я]+)*$"}
                ]
            })
        }
    }
}