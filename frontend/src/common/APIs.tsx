import axios, { AxiosResponse } from "axios";
import { afterWrite } from "@popperjs/core";
import {
    IPhoto, IRepository, IUser, Visibility,
} from "./Interfaces";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export async function postSignIn(username : string, password : string) {
    return (await axios.post<any, AxiosResponse<IUser>>("/api/signin/", { username, password })).data;
}

export async function getSession() {
    return (await axios.get<any, AxiosResponse<IUser>>("/api/session/")).data;
}

export async function getSignOut() {
    await axios.get("/api/signout/");
}

export async function postUsers(user : IUser) {
    return (await axios.post<any, AxiosResponse<IUser>>("/api/users/", user)).data;
}

export async function getUser(username : string) {
    return (await axios.get<any, AxiosResponse<IUser>>(`/api/users/${username}/`)).data;
}

export async function putUser(user : IUser) {
    return (await axios.put<any, AxiosResponse<IUser>>(`/api/users/${user.username}/`, user)).data;
}

export async function deleteUser(username : string) {
    await axios.delete(`/api/users/${username}/`);
}

export async function getFriends(username : string) {
    return (await axios.get<any, AxiosResponse<IUser[]>>(`/api/users/${username}/friends/`)).data;
}

export async function postFriends(from : string, to : string) {
    await axios.post(`/api/users/${from}/friends/${to}/`);
}

export async function deleteFriends(from : string, to : string) {
    await axios.delete(`/api/users/${from}/friends/${to}/`);
}

export async function postRepositories(repo : IRepository) {
    return (await axios.post<any, AxiosResponse<IRepository>>("/api/repositories/", repo)).data;
}

export async function getRepositories(username : string) {
    return (await axios.get<any, AxiosResponse<IRepository[]>>(`/api/repositories/?username=${username}/`)).data;
}

export async function getRepository(repo_id : number) {
    return (await axios.get<any, AxiosResponse<IRepository>>(`/api/repositories/${repo_id}/`)).data;
}

export async function deleteRepository(repo_id : number) { // added
    await axios.delete(`/api/repositories/${repo_id}/`);
}

export async function putRepository(repo : IRepository) {
    return (await axios.put<any, AxiosResponse<IRepository>>(`/api/repositories/${repo.repo_id}/`, repo)).data;
}

export async function getCollaborators(repo_id : number) {
    return (await axios.get<any, AxiosResponse<IUser[]>>(`/api/repositories/${repo_id}/collaborators/`)).data;
}

export async function postCollaborators(repo_id : number, users : string[]) { // added
    await axios.post(`/api/repositories/${repo_id}/collaborators/`, users);
}

export async function deleteCollaborators(repo_id : number, username : string) { // added
    await axios.delete(`/api/repositories/${repo_id}/collaborators/${username}/`);
}

export async function getPhotos(repo_id : number) {
    return (await axios.get<any, AxiosResponse<IPhoto[]>>(`/api/repositories/${repo_id}/photos/`)).data;
}

export async function postPhotos(repo_id : number, images : FormData) {
    return (await axios.post<any, AxiosResponse<IPhoto[]>>(`/api/repositories/${repo_id}/photos/`, images)).data;
}

export async function putPhotos(repo_id : number, photos : IPhoto[]) {
    return (await axios.put<any, AxiosResponse<IPhoto[]>>(`/api/repositories/${repo_id}/photos/`, photos)).data;
}

export async function deletePhotos(repo_id : number, photos_id : number[]) {
    return (await axios.delete<any, AxiosResponse<IPhoto[]>>(`/api/repositories/${repo_id}/photos/`,
        { data: photos_id })).data;
}
