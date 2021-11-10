import React, { useEffect, useState } from "react";
import { Pagination } from "react-bootstrap";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import store from "../../app/store";
import { IPost } from "../../common/Interfaces";
import Post from "./Post";
import { fetchRepoPosts, fetchUserPosts, postsSelectors } from "./postsSlice";

interface PostListProps {
}

// Post[], create-post-button

const PostList = (props: PostListProps) => {
    const dispatch = useAppDispatch();
    const posts = postsSelectors.selectAll(store.getState());
    const loading = useAppSelector((state) => state.posts.loading);
    const { user, id } = useParams<{user: string | undefined, id: string | undefined}>();
    useEffect(() => {
        if (loading === "idle") {
            if (user) dispatch(fetchUserPosts(user as string));
            else dispatch(fetchRepoPosts(Number(id)));
        }
    }, [dispatch]);

    let content;
    if (loading === "succeeded") {
        return (
            <main className="mt-5">
                <div className="container">
                    <div className="row">
                        {posts.map((post) => <Post post={post} key={post.post_id} />)}
                    </div>
                    {/* <Pagination>
                        <Pagination.First />
                        <Pagination.Prev />

                    </Pagination> */}
                </div>
            </main>
        );
    }
    if (loading === "failed") {
        content = (<>Failed to load posts</>);
    }
    else {
        content = <>blah</>;
    }
    return content;
};

export default PostList;
