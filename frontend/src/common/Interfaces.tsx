import React from "react";
import { PlaceQueryResult } from "../features/route/routeSlice";

enum Visibility {
    ALL,
    MEMBER_AND_FRIENDS,
    ONLY_MEMBERS,
}

enum RepoTravel {
    TRAVEL_OFF,
    TRAVEL_ON,
}

function randomString() {
    return Math.random().toString(36).substr(2, 11);
}

function randomInt() {
    return Math.floor(Math.random() * 10);
}

export enum UserProfileType {
    NOT_LOGGED_IN = 0,
    MYSELF = 1,
    FRIEND = 2,
    REQUEST_SENDED = 3,
    REQUEST_PENDING = 4,
    OTHER = 5,
}

interface IUser {
    username : string;
    bio : string;
    profile_picture? : string;
    visibility? : Visibility;
    real_name? : string;
    email? : string;
    password? : string;
    friends?: IUser[];
    friend_status?: UserProfileType;
}

export function userFactory() {
    return {
        username: randomString(),
        bio: randomString(),
        profile_picture: randomString(),
        visibility: Visibility.ALL,
        real_name: randomString(),
        email: randomString(),
        password: randomString(),
    } as IUser;
}

interface IRepository {
    repo_id : number;
    repo_name : string;
    owner : string;
    travel_start_date : string;
    travel_end_date : string;
    collaborators : IUser[];
    visibility : Visibility;
    travel? : RepoTravel;
}

interface IRepositorySearch {
    repo_id : number;
    repo_name : string;
    region_address : string;
    places : {place_name : string}[];
}

export function repositoryFactory() {
    return {
        repo_id: randomInt(),
        repo_name: randomString(),
        owner: randomString(),
        travel_start_date: randomString(),
        travel_end_date: randomString(),
        collaborators: [],
        visibility: Visibility.ALL,
    } as IRepository;
}

export function repositorySearchFactory() {
    return {
        repo_id: randomInt(),
        repo_name: randomString(),
        region_address: randomString(),
        places: [{ place_name: randomString() }],
    } as IRepositorySearch;
}

interface IPost {
    post_id : number;
    post_type? : PostType;
    repo_id? : number;
    author? : IUser[];
    title : string;
    text? : string; // Post List????????? ?????? ??????
    post_time? : string;
    photos : IPhoto[];
    comments? : IComment[]; // Post List????????? ?????? ??????
    // ???????????? ?????? ????????? ??????...
}

export function postFactory() {
    return {
        post_id: randomInt(),
        post_type: randomInt() % 2,
        repo_id: randomInt(),
        author: [userFactory()],
        title: randomString(),
        text: randomString(),
        post_time: randomString(),
        photos: [],
        comments: [],
    } as IPost;
}

interface IPhoto {
    photo_id : number;
    repo_id? : number;
    image : string; // db?????? image_file????????? ??????????????? ????????????????
    post_time? : string;
    tag? : string;
    local_tag? : string;
    labels? : ILabel[];
    // place? : IPlace;
    uploader? : string; // sure?
}

export function photoFactory() {
    return {
        photo_id: randomInt(),
        repo_id: randomInt(),
        image: randomString(),
        post_time: randomString(),
        tag: randomString(),
        local_tag: randomString(),
        uploader: randomString(),
    } as IPhoto;
}

interface IDiscussion {
    discussion_id : number;
    repo_id? : number;
    author? : IUser;
    title : string;
    text? : string; // Discussion list????????? ?????? ??????
    post_time? : string;
    comments? : IComment[]; // Discussion list????????? ?????? ??????
}

export function discussionFactory() {
    return {
        discussion_id: randomInt(),
        repo_id: randomInt(),
        title: randomString(),
        text: randomString(),
        post_time: randomString(),
    } as IDiscussion;
}

interface IComment {
    comment_id : number;
    parent_id : number; // discussion_id / post_id parent_id??? ????????? ?????????
    author? : IUser;
    text : string;
    post_time? : string;
}

export function commentFactory() {
    return {
        comment_id: randomInt(),
        parent_id: randomInt(),
        text: randomString(),
        post_time: randomString(),
    };
}

interface ILabel {
    label_id : number,
    label_name : string,
}

export function labelFactory() {
    return {
        label_id: randomInt(),
        label_name: randomString(),
    } as ILabel;
}

interface IPlace {
    place_in_route_id: number,
    place_id : string,
    place_name : string,
    place_address : string,
    text? : string, // optional implementation
    latitude : number,
    longitude : number,
    time? : string, // optional implementation
    thumbnail? : string, // thumbnail image ????????? string ?????? photo_id??? ?????? ???.
    photos : IPhoto[],
}

export function placeFactory() {
    return {
        place_in_route_id: randomInt(),
        place_id: randomString(),
        place_name: randomString(),
        place_address: randomString(),
        text: randomString(),
        latitude: randomInt(),
        longitude: randomInt(),
        time: randomString(),
        thumbnail: randomString(),
        photos: [photoFactory()],
    } as IPlace;
}

interface IRoute {
    route_id : number,
    repo_id : number,
    not_assigned : IPhoto[],
    places : IPlace[], // sorted list
    region : IRegion,
}

export function routeFactory() {
    return {
        route_id: randomInt(),
        repo_id: randomInt(),
        not_assigned: [photoFactory()],
        places: [placeFactory()],
        region: regionFactory(),
    } as IRoute;
}

interface IRegion {
    region_address : string,
    place_id : number,
    latitude : number,
    longitude : number,
    north : number,
    south : number,
    west : number,
    east : number,
}

enum NoticeType {
    FRIEND_REQUEST = 0,
    INVITATION = 1,
    NEW_POST = 2,
    NEW_DISCUSSION = 3,
    LIKE = 4,
    COMMENT = 5,
    FORK = 6,
}

enum PostType {
    PERSONAL = 0,
    REPO = 1,
}

enum NoticeAnswerType {
    NO = 0,
    YES = 1,
}

interface INotification {
    notification_id : number,
    time : string,
    classification : NoticeType,
    from_user : IUser,
    repository? : IRepository,
    post? : IPost,
    discussion? : IDiscussion,
    count? : number,
}

export function notificationFactory() {
    return {
        notification_id: randomInt(),
        time: randomString(),
        classification: randomInt() % 7,
        from_user: userFactory(),
        repository: repositoryFactory(),
        post: postFactory(),
        discussion: discussionFactory(),
        count: randomInt(),
    } as INotification;
}

export function regionFactory() {
    return {
        region_address: randomString(),
        place_id: randomInt(),
        latitude: randomInt(),
        longitude: randomInt(),
        north: randomInt(),
        south: randomInt(),
        west: randomInt(),
        east: randomInt(),
    } as IRegion;
}

export function placeQueryFactory() {
    return {
        place_id: randomString(),
        name: randomString(),
        formatted_address: randomString(),
    } as PlaceQueryResult;
}

interface IFeed {
    post_id: number,
    repo_id: number,
    repo_name: string,
    author: IUser[],
    title: string,
    photos: IPhoto[],
    region: IRegion,
    post_type: PostType,
    post_time: string,
}

export function feedFactoryPersonal() {
    return {
        post_id: randomInt(),
        repo_id: randomInt(),
        repo_name: "",
        author: [userFactory()],
        title: "",
        photos: [photoFactory()],
        region: regionFactory(),
        post_type: PostType.PERSONAL,
        post_time: "",
    };
}

export function feedFactoryRepo() {
    return {
        post_id: randomInt(),
        repo_id: randomInt(),
        repo_name: "",
        author: [userFactory()],
        title: "",
        photos: [photoFactory()],
        region: regionFactory(),
        post_type: PostType.REPO,
        post_time: "",
    };
}
export type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>

export type {
    IUser, IRepository, IPost, IRepositorySearch,
    IPhoto, IDiscussion, IComment,
    ILabel, IPlace, IRoute, IRegion, INotification, IFeed,
};

export {
    Visibility, NoticeType, PostType, NoticeAnswerType, RepoTravel,
};
