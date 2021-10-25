import React from "react";

interface IUser {
    real_name : string;
    username : string;
    email : string;
    password : string;
    profile_picture : string;
    friends : IDummyUser[];
}

interface IDummyUser {
    real_name : string;
    username : string;
    profile_picture : string;
}

interface IRepository {
    repo_id : number;
    repo_name : string;
    travel_start_date : string;
    travel_end_date : string;
    collaborator_list : IDummyUser[];
}

interface Post {

}

interface Photo {

}

interface Discussion {

}

interface Comment {

}

interface Tag {

}

interface Place {

}

interface Error {

}

export type SetStateAction<T> =  React.Dispatch<React.SetStateAction<T>>

export type { IUser, IDummyUser, IRepository, Post, Photo, Discussion, Comment, Tag, Place, Error }