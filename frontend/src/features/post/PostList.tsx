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
    const [mode, setMode] = useState<"user" | "repo">(user ? "user" : "repo");
    const [writeEnabled, setWriteEnabled] = useState<boolean>(true);
    useEffect(() => {
        if (mode === "user") {
            if (user !== account?.username) setWriteEnabled(false);
            else setWriteEnabled(true);
        }
        if (mode === "repo") {
            if (currentRepo?.owner === account?.username ||
                currentRepo?.collaborators.find((user) => user.username === account?.username)) setWriteEnabled(true);
            else setWriteEnabled(false);
        }
    }, [dispatch, account, user, repo_id]);

    useEffect(() => {
        if (mode === "user") {
            setMode("user");
            dispatch(fetchUserPosts(user as string));
        }
        if (mode === "repo") {
            setMode("repo");
            dispatch(fetchRepoPosts(parseInt(repo_id as string)));
        }
    }, [user, repo_id]);

    let content;
    if (loading === "succeeded") {
        return (
            <div className="mt-5">
                <div className="row">
                    {posts.map((post) => <Post post={post} key={post.post_id} />)}
                </div>
                {mode === "repo" && writeEnabled ?
                    <PlusButton linkTo={`/repos/${repo_id as string}/posts/create`} /> : ""}
                {mode === "user" && writeEnabled ?
                    <PlusButton linkTo={`/main/${account?.username}/create`} /> : ""}
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
