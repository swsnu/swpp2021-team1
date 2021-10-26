import axios from "axios";
import {IDummyUser, IRepository, IUser} from "./Interfaces";

const user = {profile_picture : 'test2', real_name : 'test2', username : 'test2'};
const user2 = {profile_picture : 'test3', real_name : 'test3', username : 'test3'};

export function fetchUser(email : string, password : string) {
    return {data :
                {email : 'test', password : 'test', profile_picture : 'test',
                    real_name : 'test', username : 'test', friends : [user, user2]}}; //example
}

export function createUser(user : IUser) {
    return {data : user}
    //example
}

export function fetchDummy(realName : string) {
    return {data : {user : {profile_picture : 'test', real_name : 'test', username : 'test'},
            friends : []}}; //example
}

export async function fetchAllUsers() {
    const response = await axios.get('/api/users');
    const data: IUser[] = response.data;
    return data;
}

export async function fetchRepoList(username : string) {
    const data : IRepository[] = [];
    const repo : IRepository = {
        repo_id : 0,
        repo_name : 'Hello World',
        travel_start_date : '2020-10-11',
        travel_end_date : '2020-10-11',
        collaborator_list : []}
    return {data : [repo, repo]}; //example
}

export async function postRepo(repo : IRepository) {
    const data : IRepository = {
        repo_id : -1,
        repo_name : 'Hello World',
        travel_start_date : '2020-10-11',
        travel_end_date : '2020-10-11',
        collaborator_list : []}
    return {data : {...repo, repo_id : 0}}; //example
}

export async function putCollaborators(repoID : number, collaborators : IDummyUser[]) {
    const data : IRepository = {
        repo_id : -1,
        repo_name : 'Hello World',
        travel_start_date : '2020-10-11',
        travel_end_date : '2020-10-11',
        collaborator_list : collaborators}
    return {data : data}; //example
}

export async function fetchRepo(repoID : number) {
    const repo : IRepository = {
        repo_id : 0,
        repo_name : 'Hello World',
        travel_start_date : '2020-10-11',
        travel_end_date : '2020-10-11',
        collaborator_list : []
    }
    return {data : repo};
}