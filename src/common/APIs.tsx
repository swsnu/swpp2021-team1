import axios from "axios";
import {User} from "./Interfaces";

export function fetchUser(email : string, password : string) {
    return {data : {user : {email : 'test', password : 'test', profilePicture : 'test', realName : 'test', username : 'test'},
                    friends : []}}; //example
}

export function createUser(user : User) {
    return {data : user}
    //example
}

export function fetchDummy(realName : string) {
    return {data : {user : {profilePicture : 'test', realName : 'test', username : 'test'},
            friends : []}}; //example
}

export async function fetchAllUsers() {
    const response = await axios.get('/api/users');
    const data: User[] = response.data;
    return data;
}