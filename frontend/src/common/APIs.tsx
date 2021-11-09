import axios, { Axios, AxiosResponse } from "axios";
import { afterWrite } from "@popperjs/core";
import {
    IComment,
    IDiscussion,
    IPhoto, IPost, IRepository, IUser, Visibility,
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
    return (await axios.post(`/api/users/${from}/friends/${to}/`)).data;
}

export async function deleteFriends(from : string, to : string) {
    await axios.delete(`/api/users/${from}/friends/${to}/`);
}

export async function postRepositories(repo : IRepository) {
    return (await axios.post<any, AxiosResponse<IRepository>>("/api/repositories/", repo)).data;
}

export async function getRepositories(username : string) {
    return (await axios.get<any, AxiosResponse<IRepository[]>>(`/api/repositories/?username=${username}`)).data;
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

export async function postCollaborators(repo_id : number, users : {username : string}[]) { // added
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

export async function deletePhotos(repo_id : number, photos_id : {photo_id : number}[]) {
    return (await axios.delete<any, AxiosResponse<IPhoto[]>>(`/api/repositories/${repo_id}/photos/`,
        { data: photos_id })).data;
}

export async function getDiscussions(repo_id : number) {
    return (await axios.get<any, AxiosResponse<IDiscussion[]>>(`/api/repositories/${repo_id}/discussions/`)).data;
}

export async function postDiscussions(repo_id : number, discussion : IDiscussion) {
    return (await axios.post<any, AxiosResponse<IDiscussion>>(
        `/api/repositories/${repo_id}/discussions/`, discussion,
    )).data;
}

export async function getDiscussion(discussion_id : number) {
    return (await axios.get<any, AxiosResponse<IDiscussion>>(`/api/discussions/${discussion_id}/`)).data;
}

export async function putDiscussion(discussion : IDiscussion) {
    return (await axios.put<any, AxiosResponse<IDiscussion>>(
        `/api/discussions/${discussion.discussion_id}/`, discussion,
    )).data;
}

export async function deleteDiscussion(discussion_id : number) {
    await axios.delete(`/api/discussions/${discussion_id}/`);
}

export async function getDiscussionComments(discussion_id : number) {
    return (await axios.get<any, AxiosResponse<IComment[]>>(`/api/discussions/${discussion_id}/comments/`)).data;
}

export async function postDiscussionComment(discussion_id : number, text: string) {
    return (await axios.post<any, AxiosResponse<IComment[]>>(
        `/api/discussions/${discussion_id}/comments/`, { text },
    )).data;
}

export async function getDiscussionComment(discussion_id : number, comment_id : number) {
    return (await axios.get<any, AxiosResponse<IComment>>(
        `/api/discussions/${discussion_id}/comments/${comment_id}/`,
    )).data;
}

export async function putDiscussionComment(discussionId: number, commentId: number, text: string) {
    return (await axios.put<any, AxiosResponse<IComment[]>>(
        `/api/discussions/${discussionId}/comments/${commentId}/`, { text },
    )).data;
}

export async function deleteDiscussionComment(discussion_id : number, comment_id : number) {
    return (await axios.delete<any, AxiosResponse<IComment[]>>(
        `/api/discussions/${discussion_id}/comments/${comment_id}/`,
    )).data;
}

export async function getUserPosts(username: string) {
    return (await axios.get<any, AxiosResponse<IPost[]>>(
        `/api/users/${username}/posts/`,
    )).data;
}

export async function getRepositoryPosts(repo_id: number) {
    return (await axios.get<any, AxiosResponse<IPost[]>>(
        `/api/repositories/${repo_id}/posts/`,
    )).data;
}

interface ILocalPhoto {
    photo_id: number,
    local_tag: string,
    image: string
}

export async function postPost(repo_id: number, post: {title: string, text: string, photos: ILocalPhoto[]}) {
    return (await axios.post<any, AxiosResponse<IPost>>(
        `/api/respositories/${repo_id}/posts/`, post,
    )).data;
}

export async function getPost(post_id: number) {
    return (await axios.get<any, AxiosResponse<IPost>>(
        `/api/posts/${post_id}/`,
    )).data;
}

export async function putPost(post_id: number, title: string, text: string, photos: ILocalPhoto[]) {
    return (await axios.put<any, AxiosResponse<IPost>>(
        `/api/posts/${post_id}/`, { title, text, photos },
    )).data;
}

export async function deletePost(post_id: number) {
    await axios.delete(`/api/posts/${post_id}`);
}

export async function getPostComments(post_id: number) {
    return (await axios.get<any, AxiosResponse<IComment[]>>(
        `/api/posts/${post_id}/comments/`,
    )).data;
}

export async function postPostComment(post_id: number, text: string) {
    return (await axios.post<any, AxiosResponse<IComment[]>>(
        `/api/posts/${post_id}/comments/`, { text },
    )).data;
}

export async function getPostComment(post_id: number, post_comment_id: number) {
    return (await axios.get<any, AxiosResponse<IComment>>(
        `/api/posts/${post_id}/comments/${post_comment_id}/`,
    )).data;
}

export async function putPostComment(postId: number, commentId: number, content: string) {
    return (await axios.put<any, AxiosResponse<IComment[]>>(
        `/api/posts/${postId}/comments/${commentId}/`, { content },
    )).data;
}

export async function deletePostComment(post_id: number, post_comment_id: number) {
    await axios.delete(`/api/posts/${post_id}/comments/${post_comment_id}/`);
}
