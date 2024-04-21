import { AuthForm } from "../modules/auth";

export class AuthFormFabric {

    constructor(type:string) {

        if(type === "login"){
            return new AuthForm({
                buttonName: 'Войти',
                inputs: [
                    {placeHolder: "Email", regExp:"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", nameInCredential: "email"},
                    {placeHolder: "Пароль", regExp:"^[a-zA-Z0-9!@#$%^&*()_+{}\\[\\]:;<>,.?~\\\\-]+$", nameInCredential: "password"}
                ]
            })
        } else if(type === "register"){
            return new AuthForm({
                buttonName: 'Зарегестрироватся',
                inputs: [
                    {placeHolder: "Email", regExp:"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$", nameInCredential: "email"},
                    {placeHolder: "Пароль", regExp:"^[a-zA-Z0-9!@#$%^&*()_+{}\\[\\]:;<>,.?~\\\\-]+$", nameInCredential: "password"},
                    {placeHolder: "Имя", regExp:"^[a-zA-Zа-яА-Я]+(?:-[a-zA-Zа-яА-Я]+)*$", nameInCredential: "name"}
                ]
            })
        }
    }
}