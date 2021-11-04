import axios, { AxiosResponse } from "axios";
import { afterWrite } from "@popperjs/core";
import { IRepository, IUser, Visibility } from "./Interfaces";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export async function postSignIn(username : string, password : string) {
    // ! 테스트를 위해 json-server로 임시 대체함.
    return (await axios.post<any, AxiosResponse<IUser>>("/api/signin/", { username, password })).data;
    /* const resolvedUser = {
        username: "iluvswpp",
        bio: "Everyday is a new JOURNEY!",
        profile_picture: "https://images.unsplash.com/photo-1609866975749-2238afebfa27?" +
            "ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1078&q=80",
        visibility: 0,
        real_name: "John Doe",
        email: "swpp@snu.ac.kr",
    };
    return resolvedUser; */
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
    return (await axios.get<any, AxiosResponse<IUser>>(`/api/users/${username}`)).data;
}

export async function putUser(user : IUser) {
    return (await axios.put<any, AxiosResponse<IUser>>(`/api/users/${user.username}`, user)).data;
}

export async function deleteUser(username : string) {
    await axios.delete(`/api/users/${username}`);
}

export async function getFriends(username : string) {
    return (await axios.get<any, AxiosResponse<IUser[]>>(`/api/users/${username}/friends/`)).data;
}

export async function postFriends(from : string, to : string) {
    await axios.post(`/api/users/${from}/friends/${to}`);
}

export async function deleteFriends(from : string, to : string) {
    await axios.delete(`/api/users/${from}/friends/${to}`);
}

export async function postRepositories(repo : IRepository) {
    return (await axios.post<any, AxiosResponse<IRepository>>("/api/repositories/", repo)).data;
}

export async function getRepositories(username : string) {
    return (await axios.get<any, AxiosResponse<IRepository[]>>(`/api/repositories/?username=${username}`)).data;
}

export async function getRepository(repo_id : number) {
    return (await axios.get<any, AxiosResponse<IRepository>>(`/api/repositories/${repo_id}`)).data;
}

export async function deleteRepository(repo_id : number) { // added
    await axios.delete(`/api/repositories/${repo_id}`);
}

export async function putRepository(repo : IRepository) {
    return (await axios.put<any, AxiosResponse<IRepository>>(`/api/repositories/${repo.repo_id}`)).data;
}

export async function getCollaborators(repo_id : number) {
    return (await axios.get<any, AxiosResponse<IUser[]>>(`/api/repositories/${repo_id}/collaborators`)).data;
}

export async function postCollaborators(repo_id : number, users : string[]) { // added
    await axios.post(`/api/repositories/${repo_id}/collaborators/`, users);
}

export async function deleteCollaborators(repo_id : number, username : string) { // added
    await axios.delete(`/api/repositories/${repo_id}/collaborators/${username}/`);
}
