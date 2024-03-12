import { AuthForm } from "../modules/auth";
import {  iServer } from "../../../../../../env/types";

// @ts-ignore
export class AuthFormFabric {
    constructor(type:string, server:iServer) {
        if(type === "login"){
            return new AuthForm({
                buttonName: 'Войти',
                inputs: [
                    {placeHolder: "email", regExp:"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"},
                    {placeHolder: "password", regExp:"^[a-zA-Z0-9!@#$%^&*()_+{}\\[\\]:;<>,.?~\\\\-]+$"}
                ],
                callback: async (email:string, password:string, callback: Record<string, any>)=> {
                    let response = await server.login({email: email, password:password})
                    if(response.status === "ERROR"){
                        callback.error(response.Error)
                    } else if(response.status === "OK") {
                        callback.ok()
                    }
                }
            })
        } else if(type === "register"){
            return new AuthForm({
                buttonName: 'Зарегестрироватся',
                inputs: [
                    {placeHolder: "email", regExp:"^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$"},
                    {placeHolder: "password", regExp:"^[a-zA-Z0-9!@#$%^&*()_+{}\\[\\]:;<>,.?~\\\\-]+$"},
                    {placeHolder: "name", regExp:"^[a-zA-Zа-яА-Я]+(?:-[a-zA-Zа-яА-Я]+)*$"}
                ],
                callback: async (email:string, password:string,name:string, callback: Record<string, any>)=> {
                    let response = await server.register({email: email, password:password},{name:name})
                    if(response.status === "ERROR"){
                        callback.error(response.Error)
                    } else if(response.status === "OK") {
                        callback.ok()
                    }
                }
            })
        }
    }
}