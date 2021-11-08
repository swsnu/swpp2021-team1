import faker from "faker";
import Chance from "chance";

// import { ListGroupItem } from "react-bootstrap";
// import {
//     IUser, IRepository, IPost, IPhoto, IDiscussion, IComment, ILabel, IPlace,
// } from "../common/Interfaces";

const chance = new Chance();

class Factory {
    user = () => ({
        username: faker.internet.userName(),
        bio: faker.lorem.sentence(),
        profile_picture: faker.image.avatar(),
        visibility: faker.datatype.number(({ min: 0, max: 2 })),
        real_name: chance.name(),
        email: chance.email(),
        password: faker.internet.password(),
        friends: [],
    });

    repository = () => ({
        repo_id: faker.datatype.number(),
        repo_name: faker.lorem.sentence(2).replace(".", ""),
        owner: faker.internet.userName(),
        travel_start_date: faker.date.past(),
        travel_end_date: faker.date.past(),
        collaborators: [],
        visibility: faker.datatype.number(({ min: 0, max: 2 })),
    });

    post = () => ({
        post_id: faker.datatype.number(),
        repo_id: faker.datatype.number(),
        author: faker.internet.userName(),
        title: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
        post_time: faker.date.past(),
        images: [],
        comments: [],
    });

    photo = () => ({
        photo_id: faker.datatype.number(),
        repo_id: faker.datatype.number(),
        image: faker.image.city(),
        post_time: faker.date.past(),
        tag: faker.lorem.sentence(),
        label: [],
        place: undefined,
        uploader: faker.internet.userName(),
    });

    discussion = () => ({
        discussion_id: faker.datatype.number(),
        repo_id: faker.datatype.number(),
        author: faker.internet.userName(),
        title: faker.lorem.sentence(),
        text: faker.lorem.paragraph(),
        post_time: faker.date.past(),
        comments: [],
    });

    comment = () => ({
        comment_id: faker.datatype.number(),
        parent_id: faker.datatype.number(),
        author: faker.internet.userName(),
        text: faker.lorem.sentence(),
    });

    label = () => ({
        name: faker.lorem.word(),
    });

    place = () => ({
        name: faker.address.city(),
    });

    userGen = () => {
        const user = this.user();
        user.username = user.real_name.replace(/\s/g, "").toLowerCase();
        user.email = user.email.replace(/.*@/, `${user.username}@`);
        const n = faker.datatype.number({ min: 3, max: 10 });
        for (let i = 0; i < n; i += 1) {
            user.friends.push(this.user());
        }
        return user;
    }

    repoGen = () => {
        const repo = this.repository();
        const n = faker.datatype.number({ min: 1, max: 5 });
        for (let index = 0; index < n; index += 1) {
            repo.collaborators.push(this.userGen());
        }
        return repo;
    }

    postGen = () => {
        const post = this.post();
        const n1 = faker.datatype.number({ min: 3, max: 10 });
        for (let index = 0; index < n1; index += 1) {
            post.images.push(faker.datatype.number());
        }
        const n2 = faker.datatype.number({ min: 0, max: 8 });
        for (let index = 0; index < n2; index += 1) {
            post.images.push(this.comment());
        }
        return post;
    }

    photoGen = () => {
        const photo = this.photo();
        const n = faker.datatype.number({ min: 0, max: 2 });
        for (let i = 0; i < n; i += 1) {
            photo.label.push(this.label());
        }
        photo.place = this.place();
        return photo;
    }

    discussionGen = () => {
        const discussion = this.discussion();
        const n = faker.datatype.number({ min: 0, max: 8 });
        for (let i = 0; i < n; i += 1) {
            discussion.comments.push(this.comment());
        }
        return discussion;
    }

    commentGen = () => {
        const comment = this.comment();
        return comment;
    }

    labelGen = () => this.label()

    placeGen = () => this.place()
}

export default Factory;
