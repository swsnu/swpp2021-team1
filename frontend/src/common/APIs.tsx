import axios, { AxiosResponse } from "axios";
import { PhotoWithLocalTag } from "../features/post/postsSlice";

import { PlaceQueryResult } from "../features/route/routeSlice";
import {
    IComment,
    IDiscussion,
    IFeed,
    ILabel,
    INotification,
    IPhoto,
    IPlace,
    IPost,
    IRepository, IRepositorySearch,
    IRoute,
    IUser,
    NoticeAnswerType, PostType, RepoTravel,
} from "./Interfaces";

axios.defaults.xsrfCookieName = "csrftoken";
axios.defaults.xsrfHeaderName = "X-CSRFToken";

/**
 * for authSlice
 */

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

interface ProfilePictureForm {
    profile_picture: string
}

export async function postProfilePicture(username: string, formData: FormData) {
    return (await axios.post<any, AxiosResponse<ProfilePictureForm>>(
        `/api/users/${username}/profile-picture/`, formData,
    )).data;
}

export async function deleteProfilePicture(username: string) {
    await axios.delete(`/api/users/${username}/profile-picture/`);
}

export async function deleteUser(username : string) {
    await axios.delete(`/api/users/${username}/`);
}

export async function getFriends(username : string) {
    return (await axios.get<any, AxiosResponse<IUser[]>>(`/api/users/${username}/friends/`)).data;
}

export async function postFriends(from : string, to : string) {
    return (await axios.post<any, AxiosResponse<IUser[]>>(`/api/users/${from}/friends/${to}/`)).data;
}

export async function deleteFriends(from : string, to : string) {
    await axios.delete(`/api/users/${from}/friends/${to}/`);
}

/**
 * for reposSlice
 */

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
    return (await axios.post<any, AxiosResponse<IUser[]>>(`/api/repositories/${repo_id}/collaborators/`, users)).data;
}

export async function deleteCollaborators(repo_id : number, username : string) { // added
    await axios.delete(`/api/repositories/${repo_id}/collaborators/${username}/`);
}

/**
 * for photosSlice
 */

export async function getPhotos(repo_id : number) {
    return (await axios.get<any, AxiosResponse<IPhoto[]>>(`/api/repositories/${repo_id}/photos/`)).data;
}

export async function postPhotos(repo_id : number, images : FormData) {
    return (await axios.post<any, AxiosResponse<IPhoto[]>>(`/api/repositories/${repo_id}/photos/`, images)).data;
}

export async function putPhoto(repo_id : number, photo : IPhoto) {
    return (await axios.put<any, AxiosResponse<IPhoto>>(
        `/api/repositories/${repo_id}/photos/${photo.photo_id}/`, { tag: photo.tag },
    )).data;
}

export async function deletePhotos(repo_id : number, photos_id : {photo_id : number}[]) {
    return (await axios.delete<any, AxiosResponse<IPhoto[]>>(`/api/repositories/${repo_id}/photos/`,
        { data: photos_id })).data;
}

export async function getFilteredPhotos(repo_id: number, label_name: string) {
    return (await axios.get<any, AxiosResponse<IPhoto[]>>(
        `/api/repositories/${repo_id}/photos/?label=${label_name}`,
    )).data;
}

/**
 * for discussionsSlice
 */

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

/**
 * for postsSlice
 */

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

export async function postPost(repo_id: number, post: {title: string, text: string, photos: PhotoWithLocalTag[]}) {
    return (await axios.post<any, AxiosResponse<IPost>>(
        `/api/repositories/${repo_id}/posts/`, post,
    )).data;
}

export async function postRepoPost(repo_id: number) {
    await axios.post(
        `/api/repositories/${repo_id}/posts/`, { post_type: PostType.REPO },
    );
}

export async function getPost(post_id: number) {
    return (await axios.get<any, AxiosResponse<IPost>>(
        `/api/posts/${post_id}/`,
    )).data;
}

export async function putPost(post_id: number, title: string, text: string, photos: PhotoWithLocalTag[]) {
    return (await axios.put<any, AxiosResponse<IPost>>(
        `/api/posts/${post_id}/`, { title, text, photos },
    )).data;
}

export async function putRepoPost(repo_id: number, travel: RepoTravel) {
    await axios.put(
        `/api/repositories/${repo_id}/posts/`, { post_type: PostType.REPO, travel },
    );
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

export async function putPostComment(postId: number, commentId: number, text: string) {
    return (await axios.put<any, AxiosResponse<IComment[]>>(
        `/api/posts/${postId}/comments/${commentId}/`, { text },
    )).data;
}

export async function deletePostComment(post_id: number, post_comment_id: number) {
    return (await axios.delete<any, AxiosResponse<IComment[]>>(
        `/api/posts/${post_id}/comments/${post_comment_id}/`,
    )).data;
}

/**
 * for routeSlice
 */

export async function getRoute(repo_id: number) {
    return (await axios.get<any, AxiosResponse<IRoute>>(
        `/api/repositories/${repo_id}/route/`,
    )).data;
}

export async function postRoute(repo_id: number, id : string|number, mode : "region"|"fork") {
    if (mode === "region") {
        await axios.post(`/api/repositories/${repo_id}/route/`, { place_id: id });
    }
    else {
        await axios.post(`/api/repositories/${repo_id}/route/`, { repo_id: id });
    }
}

export async function postPlaces(repo_id: number, place_id: string) {
    return (await axios.post<any, AxiosResponse<{not_assigned: IPhoto[], places: IPlace[]}>>(
        `/api/repositories/${repo_id}/route/places/${place_id}/`,
    )).data;
}

export async function putPlaces(repo_id: number, places : IPlace[]) {
    return (await axios.put<any, AxiosResponse<{not_assigned: IPhoto[], places: IPlace[]}>>(
        `/api/repositories/${repo_id}/route/places/`, places,
    )).data;
}

export async function getRegionQuery(queryString : string) {
    return (await axios.get<any, AxiosResponse<PlaceQueryResult[]>>(
        `/api/region-search/?query=${queryString}/`,
    )).data;
}

export async function getPlacesQuery(repo_id : number, queryString : string) {
    return (await axios.get<any, AxiosResponse<PlaceQueryResult[]>>(
        `/api/repositories/${repo_id}/route/places-search/?query=${queryString}/`,
    )).data;
}

/**
 * for labelSlice
 */

export async function getLabels(repo_id: number) {
    return (await axios.get<any, AxiosResponse<ILabel[]>>(
        `/api/repositories/${repo_id}/labels/`,
    )).data;
}

export async function postLabel(repo_id: number, data: {label_name: string}) {
    return (await axios.post<any, AxiosResponse<ILabel[]>>(
        `/api/repositories/${repo_id}/labels/`,
        data,
    )).data;
}

export async function putLabel(repo_id: number, label_id: number, data: { label_name: string; }) {
    return (await axios.put<any, AxiosResponse<ILabel[]>>(
        `/api/repositories/${repo_id}/labels/${label_id}/`,
        data,
    )).data;
}

export async function deleteLabel(repo_id: number, label_id: number) {
    return (await axios.delete<any, AxiosResponse<ILabel[]>>(
        `/api/repositories/${repo_id}/labels/${label_id}/`,
    )).data;
}

export async function getLabelPhotos(repo_id: number, label_id: number) {
    return (await axios.get<any, AxiosResponse<IPhoto[]>>(
        `/api/repositories/${repo_id}/labels/${label_id}/photos/`,
    )).data;
}

export async function putLabelPhotos(repo_id: number, label_id: number, data: {photo_id: number}[]) {
    return (await axios.put<any, AxiosResponse<IPhoto[]>>(
        `/api/repositories/${repo_id}/labels/${label_id}/photos/`,
        data,
    )).data;
}

/**
 * for noticeSlice
 */

export async function getNotifications() {
    return (await axios.get<any, AxiosResponse<INotification[]>>("/api/notifications/")).data;
}

export async function deleteNotifications() {
    return (await axios.delete<any, AxiosResponse<INotification[]>>("/api/notifications/")).data;
}

export async function postNotification(id : number, answer : NoticeAnswerType) {
    return (await axios.post<any, AxiosResponse<INotification[]>>(
        `/api/notifications/${id}/`, { answer },
    )).data;
}

export async function deleteNotification(id : number) {
    return (await axios.delete<any, AxiosResponse<INotification[]>>(`/api/notifications/${id}/`)).data;
}

export async function getNoticeSession() {
    return (await axios.get<any, AxiosResponse<{count : number}>>("/api/session/notifications/")).data;
}

/**
 * for searchSlice
 */

export async function getUserSearch(query : string) {
    return (await axios.get<any, AxiosResponse<IUser[]>>(`/api/explore/users/?query=${query}`)).data;
}

export async function getRepositorySearch(query : string) {
    return (await axios.get<any, AxiosResponse<IRepositorySearch[]>>(`/api/explore/repositories/?query=${query}`)).data;
}

export async function getRegionSearch(query: string) {
    return (await axios.get<any, AxiosResponse<IRepositorySearch[]>>(`/api/explore/regions/?query=${query}`)).data;
}
/* for feed */

export async function getFeed() {
    try {
        return (await axios.get<any, AxiosResponse<IFeed[]>>("/api/feeds/")).data;
    }
    catch (e: any) {
        return e;
    }
}
