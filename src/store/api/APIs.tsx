import axios from "axios";
import {User} from "../../Interfaces";

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
    // TODO
    await setTimeout(() => {}, 100);
    return {data: [{email: 'swpp@snu.ac.kr', password: 'dsfdssd', profilePicture: 'test', realName: 'Hello', username: 'helloooo'}, {email: '3333s@snu.ac.kr', password: 'ggdfgdd', profilePicture: 'test', realName: 'Swpp', username: 'iluvswpp'}]};
}