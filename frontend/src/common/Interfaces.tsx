interface User {
    real_name : string;
    username : string;
    email : string;
    password : string;
    profile_picture : string;
}

interface DummyUser {
    real_name : string;
    username : string;
    profile_picture : string;
}

interface Repository {
    repo_id : number;
    repo_name : string;
    travel_start_date : Date;
    travel_end_date : Date;
    collaborator_list : DummyUser[];
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

export type { User, DummyUser, Repository, Post, Photo, Discussion, Comment, Tag, Place, Error }