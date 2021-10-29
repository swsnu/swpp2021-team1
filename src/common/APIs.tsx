import axios from "axios";
import {IRepository, IUser, Visibility} from "./Interfaces";
import {afterWrite} from "@popperjs/core";

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

const user = {profile_picture : 'test2', real_name : 'test2', username : 'test2'};
const user2 = {profile_picture : 'test3', real_name : 'test3', username : 'test3'};


export async function postSignIn(username : string, password : string) {
    return await axios.post<any,IUser>('/api/signin/', {username : username, password : password});
}

export async function getSignOut() {
    await axios.get('/api/signout/');
}

export async function postUsers(user : IUser) {
    return await axios.post<any,IUser>('/api/users/', user);
}

export async function getUser(username : string) {
    return await axios.get<any,IUser>(`/api/users/${username}`);
}

export async function putUser(user : IUser) {
    return await axios.put<any,IUser>(`/api/users/${user.username}`, user);
}

export async function deleteUser(username : string) {
    await axios.delete(`/api/users/${username}`);
}

export async function getFriends(username : string) {
    return await axios.get<any,IUser[]>(`/api/users/${username}/friends/`);
}

export async function postFriends(from : string, to : string) {
    await axios.post(`/api/users/${from}/friends/${to}`);
}

export async function deleteFriends(from : string, to : string) {
    await axios.delete(`/api/users/${from}/friends/${to}`);
}

export async function postRepositories(repo : IRepository) {
    return await axios.post<any, IRepository>('/api/repositories/', repo);
}

export async function getRepositories(username : string) {
    return await axios.get<any, IRepository[]>(`/api/repositories/?username=${username}`)
}

export async function getRepository(repo_id : number) {
    return await axios.get<any, IRepository>(`/api/repositories/${repo_id}`)
}

export async function deleteRepository(repo_id : number) {
    await axios.delete(`/api/repositories/${repo_id}`)
}

export async function putRepository(repo : IRepository) {
    return await axios.put<any, IRepository>(`/api/repositories/${repo.repo_id}`)
}

export async function getCollaborators(repo_id : number) {
    return await axios.get<any, IUser[]>(`/api/repositories/${repo_id}/collaborators`)
}

export async function postCollaborators(repo_id : number, users : IUser[]) {
    await axios.post(`/api/repositories/${repo_id}/collaborators/`, users)
}

export async function deleteCollaborators(repo_id : number, username : string) {
    await axios.delete(`/api/repositories/${repo_id}/collaborators/${username}/`)
}