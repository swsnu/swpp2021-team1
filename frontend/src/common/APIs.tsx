import axios from "axios";
import { afterWrite } from "@popperjs/core";
import { IRepository, IUser, Visibility } from "./Interfaces";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

export async function postSignIn(username : string, password : string) {
    // ! 테스트를 위해 json-server로 임시 대체함.
    // return await axios.post<any,IUser>('/api/signin/', {username : username, password : password});
    const resolvedUser = {
        username: "iluvswpp",
        bio: "Everyday is a new JOURNEY!",
        profile_picture: "https://images.unsplash.com/photo-1609866975749-2238afebfa27?" +
            "ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1078&q=80",
        visibility: 0,
        real_name: "John Doe",
        email: "swpp@snu.ac.kr",
    };
    return resolvedUser;
}

export async function getSession() {
    return await axios.get<any, IUser>("/api/session/");
}

export async function getSignOut() {
    await axios.get("/api/signout/");
}

export async function postUsers(user : IUser) {
    return await axios.post<any, IUser>("/api/users/", user);
}

export async function getUser(username : string) {
    return await axios.get<any, IUser>(`/api/users/${username}`);
}

export async function putUser(user : IUser) {
    return await axios.put<any, IUser>(`/api/users/${user.username}`, user);
}

export async function deleteUser(username : string) {
    await axios.delete(`/api/users/${username}`);
}

export async function getFriends(username : string) {
    return await axios.get<any, IUser[]>(`/api/users/${username}/friends/`);
}

export async function postFriends(from : string, to : string) {
    await axios.post(`/api/users/${from}/friends/${to}`);
}

export async function deleteFriends(from : string, to : string) {
    await axios.delete(`/api/users/${from}/friends/${to}`);
}

export async function postRepositories(repo : IRepository) { // added
    return await axios.post<any, IRepository>("/api/repositories/", repo);
}

export async function getRepositories(username : string) { // added
    return await axios.get<any, IRepository[]>(`/api/repositories/?username=${username}`);
}

export async function getRepository(repo_id : number) { // added
    return await axios.get<any, IRepository>(`/api/repositories/${repo_id}`);
}

export async function deleteRepository(repo_id : number) { // added
    await axios.delete(`/api/repositories/${repo_id}`);
}

export async function putRepository(repo : IRepository) { // added
    return await axios.put<any, IRepository>(`/api/repositories/${repo.repo_id}`);
}

export async function getCollaborators(repo_id : number) {
    return await axios.get<any, IUser[]>(`/api/repositories/${repo_id}/collaborators`);
}

export async function postCollaborators(repo_id : number, users : string[]) { // added
    await axios.post(`/api/repositories/${repo_id}/collaborators/`, users);
}

export async function deleteCollaborators(repo_id : number, username : string) { // added
    await axios.delete(`/api/repositories/${repo_id}/collaborators/${username}/`);
}
