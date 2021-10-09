import axios from "axios";
import {User} from "../../Interfaces";

export function fetchUser(email : string, password : string) {
    return {data : {user : {email : 'test', password : 'test', profilePicture : 'test', nickName : 'test', name : 'test'},
                    friends : []}}; //example
}

export function createUser(user : User) {
    return {data : user}
    //example
}

export function fetchDummy(nickName : string) {
    return {data : {user : {profilePicture : 'test', nickName : 'test', name : 'test'},
            friends : []}}; //example
}