import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { Carousel } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getUser } from "../../common/APIs";
import { IUser } from "../../common/Interfaces";
import { fetchSinglePost } from "./postsSlice";
import "./Posts.css";

interface PostDetailProps {
}

const PostDetail = (props: PostDetailProps) => {
    const dispatch = useAppDispatch();
    const { post_id } = useParams<{post_id: string}>();
    const loading = useAppSelector((state) => state.posts.loading);
    const currentPost = useAppSelector((state) => state.posts.currentPost);
    const [authorLoading, setAuthorLoading] = useState<"idle" | "pending" | "succeeded" | "failed">("idle");
    const [author, setAuthor] = useState<IUser | null>(null);
    useEffect(() => {
        if (loading === "idle") {
            dispatch(fetchSinglePost(Number(post_id)));
        }
    }, [dispatch]);
    useEffect(() => {
        const getAuthorInfo = async (username: string) => {
            setAuthorLoading("pending");
            try {
                const user = await getUser(username);
                setAuthor(user);
                setAuthorLoading("succeeded");
            }
            catch (e) {
                setAuthorLoading("failed");
            }
        };
        if (authorLoading === "idle" && currentPost && currentPost.author) {
            getAuthorInfo(currentPost.author);
        }
    }, [currentPost]);

    return (
        <main className="mt-5">
            <div className="container">
                <section className="border-bottom mb-4">
                    <div className="row align-items-center mb-2">
                        <div
                            className="col-lg-6 text-center
                        text-lg-start mb-3 m-lg-0 d-flex align-items-center justify-content-between"
                            style={{ width: "100%" }}
                        >
                            <Link
                                to={`/main/${author?.username}`}
                                id="author-username"
                                className="text-decoration-none text-dark"
                            >
                                <img
                                    src={author?.profile_picture}
                                    className="rounded-circle shadow-1-strong me-3"
                                    height="40"
                                    alt=""
                                    loading="lazy"
                                />

                                @
                                {author?.username}
                            </Link>
                            <span className="text-muted small ms-1">{currentPost?.post_time}</span>
                        </div>
                    </div>
                    <Carousel />
                    <img
                        src="https://mdbootstrap.com/img/Photos/Slides/img%20(144).jpg"
                        className="img-fluid shadow-2-strong rounded-5 mb-4"
                        alt=""
                    />
                </section>
            </div>
        </main>
    );
};

export default PostDetail;
