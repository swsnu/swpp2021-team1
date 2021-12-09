import React from "react";
import { PlaceQueryResult } from "../features/route/routeSlice";

enum Visibility {
    ALL,
    MEMBER_AND_FRIENDS,
    ONLY_MEMBERS,
}

function randomString() {
    return Math.random().toString(36).substr(2, 11);
}

function randomInt() {
    return Math.floor(Math.random() * 10);
}

interface IUser {
    username : string;
    bio : string;
    profile_picture? : string;
    visibility? : Visibility;
    real_name? : string;
    email? : string;
    password? : string;
    friends? : IUser[];
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

interface IPost {
    post_id : number;
    repo_id? : number;
    author? : IUser[];
    title : string;
    text? : string; // Post List에서는 필요 없음
    post_time? : string;
    photos : IPhoto[];
    comments? : IComment[]; // Post List에서는 필요 없음
    // 좋아요는 일단 나중에 생각...
}

interface IPhoto {
    photo_id : number;
    repo_id? : number;
    image : string; // db에는 image_file이라고 되어있는데 바꿔야하나?
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
    text? : string; // Discussion list에서는 필요 없음
    post_time? : string;
    comments? : IComment[]; // Discussion list에서는 필요 없음
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
    parent_id : number; // discussion_id / post_id parent_id로 바꿔서 줘야함
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

interface IPlace {
    place_in_route_id: number,
    place_id : string,
    place_name : string,
    place_address : string,
    text? : string, // optional implementation
    latitude : number,
    longitude : number,
    time? : string, // optional implementation
    thumbnail? : string, // thumbnail image 원하면 string 대신 photo_id로 줘도 됨.
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

export type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>

export type {
    IUser, IRepository, IPost, IPhoto, IDiscussion, IComment, ILabel, IPlace, IRoute, IRegion,
};

export { Visibility };
