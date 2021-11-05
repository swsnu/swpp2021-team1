import mocker from "mocker-data-generator";
import util from "util";

const user = {
    username: {
        faker: "internet.userName",
    },
    bio: {
        faker: "lorem.sentence",
    },
    profile_picture: {
        faker: "image.avatar",
    },
    visibility: {
        faker: "random.number({\"min\": 0, \"max\": 2})",
    },
    real_name: {
        faker: "name.fullName",
    },
    email: {
        chance: "email",
    },
    password: {
        faker: "password",
    },
    friends: {
        hasMany: "users",
        max: 7,
        unique: true,
    },
};

const repository = {
    repo_id: {
        incrementalId: 0,
    },
    repo_name: {
        faker: "hacker.phrase",
    },
    owner: {
        hasOne: "users",
        get: "username",
    },
    travel_start_date: {
        faker: "date.past",
    },
    travel_end_date: {
        faker: "date.past",
    },
    collaborators: {
        hasMany: "users",
        max: 4,
        min: 1,
        unique: true,
    },
    visibility: {
        faker: "random.number({\"min\": 0, \"max\": 2})",
    },
};

const post = {
    post_id: {
        incrementalId: 0,
    },
    repo_id: {
        hasOne: "repositories",
        get: "repo_id",
    },
    author: {
        hasOne: "users",
    },
    title: {
        faker: "lorem.sentence",
    },
    text: {
        faker: "lorem.paragraph",
    },
    post_time: {
        faker: "date.past",
    },
    images: {
        hasMany: "photos",
        max: 5,
        min: 1,
        unique: true,
    },
    comments: {
        hasMany: "comments",
        max: 6,
        unique: true,
    },
};

const photo = {
    photo_id: {
        incrementalId: 0,
    },
    repo_id: {
        hasOne: "repositories",
        get: "repo_id",
    },
    image: {
        faker: "image.city",
    },
    post_time: {
        faker: "date.past",
    },
    tag: {
        function() {
            return this.chance.word();
        },
        length: 7,
        fixedLength: false,
    },
    label: {
        hasMany: "labels",
        max: 3,
        unique: true,
    },
    place: {
        hasOne: "places",
    },
    uploader: {
        hasOne: "users",
        get: "username",
    },
};

const discussion = {
    discussion_id: {
        incrementalId: 0,
    },
    repo_id: {
        hasOne: "repositories",
        get: "repo_id",
    },
    author: {
        hasOne: "users",
        get: "username",
    },
    title: {
        faker: "lorem.sentence",
    },
    text: {
        faker: "lorem.paragraph",
    },
    post_time: {
        faker: "date.past",
    },
    comments: {
        hasMany: "comments",
        max: 6,
    },
};

const comment = {
    parent_type: {
        values: ["post", "discussion"],
    },
    comment_id: {
        incrementalId: 0,
    },
    "object.parent_type===\"post\",parent_id": {
        hasOne: "posts",
    },
    "object.parent_type===\"discussion\",parent_id": {
        hasOne: "discussions",
    },
    author: {
        hasOne: "users",
        get: "username",
    },
    text: {
        faker: "lorem.sentence",
    },
};

const label = {

};

const place = {};

mocker()
    .schema("users", user, 30)
    .schema("repositories", repository, 10)
    .schema("posts", post, 100)
    .schema("photos", photo, 150)
    .schema("discussions", discussion, 40)
    .schema("comments", comment, 100)
    .schema("labels", label, 20)
    .schema("places", place, 100)
    .build()
    .then(
        (data) => data,
        (err) => console.error(err),
    );
