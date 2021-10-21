import axios from "axios";
import {User} from "../../Interfaces";

export function fetchUser(email : string, password : string) {
    return {data : {user : {email : 'test', password : 'test', profilePicture : 'test', nickname : 'test', username : 'test'},
                    friends : []}}; //example
}

export function createUser(user : User) {
    return {data : user}
    //example
}

export function fetchDummy(nickname : string) {
    return {data : {user : {profilePicture : 'test', nickname : 'test', username : 'test'},
            friends : []}}; //example
}