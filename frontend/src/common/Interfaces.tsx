import React from "react";

enum Visibility {
    ONLY_MEMBERS,
    MEMBER_AND_FRIENDS,
    ALL,
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
    repo_id : number;
    author : string;
    title : string;
    text? : string; // Post List에서는 필요 없음
    post_time : string;
    images? : string[];
    comments? : IComment[]; // Post List에서는 필요 없음
    // 좋아요는 일단 나중에 생각...
}

interface IPhoto {
    photo_id : number;
    repo_id : number;
    image : string; // db에는 image_file이라고 되어있는데 바꿔야하나?
    post_time : string;
    tag? : string;
    label? : ILabel[];
    place? : IPlace;
    uploader : string; // sure?
}

interface IDiscussion {
    discussion_id : number;
    repo_id : number;
    author : string;
    title : string;
    text? : string; // Discussion list에서는 필요 없음
    post_time : string;
    comments? : IComment[]; // Discussion list에서는 필요 없음
}

interface IComment {
    comment_id : number;
    parent_id : number; // discussion_id / post_id parent_id로 바꿔서 줘야함
    author : string;
    text : string;
}

interface ILabel {

}

interface IPlace {

}

export type SetStateAction<T> = React.Dispatch<React.SetStateAction<T>>

export type {
    IUser, IRepository, IPost, IPhoto, IDiscussion, IComment, ILabel, IPlace,
};

export { Visibility };
