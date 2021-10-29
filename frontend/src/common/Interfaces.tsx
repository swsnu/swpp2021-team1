import React from "react";

enum Visibility {
    ALL,
    MEMBER_AND_FRIENDS,
    ONLY_MEMBERS,
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

interface IRepository {
    repo_id : number;
    repo_name : string;
    owner : string;
    travel_start_date : string;
    travel_end_date : string;
    collaborators : IUser[];
    visibility : Visibility;
}

interface IPost {

}

interface IPhoto {

}

interface IDiscussion {

}

interface IComment {

}

interface ITag {

}

interface IPlace {

}

export type SetStateAction<T> =  React.Dispatch<React.SetStateAction<T>>

export type { IUser, IRepository, IPost, IPhoto, IDiscussion, IComment, ITag, IPlace }

export { Visibility }