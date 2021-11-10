import React, { useEffect, useState } from "react";
import { Pagination } from "react-bootstrap";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { setConstantValue } from "typescript";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { IPost } from "../../common/Interfaces";
import PlusButton from "../../common/plusButton/PlusButton";
import Post from "./Post";
import { fetchRepoPosts, fetchUserPosts, postsSelectors } from "./postsSlice";

interface PostListProps {
}

// Post[], create-post-button

const PostList = (props: PostListProps) => {
    const dispatch = useAppDispatch();
    const account = useAppSelector((state) => state.auth.account);
    const posts = postsSelectors.selectAll(store.getState());
    const loading = useAppSelector((state) => state.posts.loading);
    const currentRepo = useAppSelector((state) => state.repos.currentRepo);
    const currentUser = useAppSelector((state) => state.auth.currentUser);
    const { user, repo_id } = useParams<{user: string | undefined, repo_id: string | undefined}>();
    const [mode, setMode] = useState<"user" | "repo" | "disabled">(user ? "user" : "repo");
    useEffect(() => {
        if (mode === "user") {
            if (user !== account?.username) setMode("disabled");
        }
        if (mode === "repo") {
            if (currentRepo?.owner === account?.username ||
                currentRepo?.collaborators.find((user) => user.username === account?.username)) setMode("repo");
            else setMode("disabled");
        }
        if (loading === "idle") {
            if (mode === "user") {
                dispatch(fetchUserPosts(user as string));
            }
            if (mode === "repo") {
                dispatch(fetchRepoPosts(parseInt(repo_id as string)));
            }
        }
    }, [account, currentUser]);

    let content;
    if (loading === "succeeded") {
        return (
            <div className="container mt-5">
                <div className="row">
                    {posts.map((post) => <Post post={post} key={post.post_id} />)}
                </div>
                {mode === "repo" ? <PlusButton linkTo={`/repos/${repo_id as string}/posts`} /> : ""}
                {mode === "user" ? <PlusButton linkTo={`/main/${account?.username}/create`} /> : ""}
            </div>
        );
    }
    if (loading === "failed") {
        content = (<>Failed to load posts</>);
    }
    else {
        content = <></>;
    }
    return content;
};

export default PostList;
