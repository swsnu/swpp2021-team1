import React, {
    useEffect, useState,
} from "react";
import { useHistory, useParams } from "react-router";
import { Link } from "react-router-dom";
import {
    Carousel, Image, Modal, Button,
} from "react-bootstrap";
import { InputSpecificProps } from "react-select/dist/declarations/src/components/Input";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { IUser } from "../../common/Interfaces";
import {
    fetchSinglePost, newPostComment, postCommentDeleted, postCommentEdited, postDeleted,
} from "./postsSlice";
import "./Posts.css";
import Comment from "../comments/Comment";
import avatar from "../../common/assets/avatar.jpg";

// suppress no-tsx-component-props

const PostDetail = () => {
    const dispatch = useAppDispatch();
    const { post_id } = useParams<{ post_id: string }>();
    const currentPost = useAppSelector((state) => state.posts.currentPost);
    const [postLoading, setPostLoading] = useState<"idle" | "pending" | "succeeded" | "failed">("idle");
    const [index, setIndex] = useState<number>(0);
    const [photoShow, setPhotoShow] = useState<boolean>(false);
    const account = useAppSelector((state) => state.auth.account);
    const [comment, setComment] = useState("");
    const currentPhoto = currentPost?.photos[index];
    const author = currentPost?.author ? currentPost?.author[0] : undefined;
    const loading = useAppSelector((state) => state.posts.loading);
    const history = useHistory();

    const handleSelect = (selectedIndex: number, e: Record<string, unknown> | null) => {
        setIndex(selectedIndex);
    };

    useEffect(() => {
        const loadPost = async () => {
            try {
                setPostLoading("pending");
                await dispatch(fetchSinglePost(Number(post_id)));
                setPostLoading("succeeded");
            }
            catch (e) {
                setPostLoading("failed");
            }
        };
        if (postLoading === "idle") {
            loadPost();
        }
    }, [dispatch]);

    if (loading === "failed") return <div>Error</div>;
    if (loading === "pending" || loading === "idle") return <div />;
    return (
        <div className="mt-5">
            <section className="border-bottom mb-5" style={{ maxWidth: 700 }}>
                <div className="row align-items-center mb-4 mx-auto">
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
                                src={author?.profile_picture ? author?.profile_picture : avatar}
                                className="rounded-circle shadow-1-strong me-3"
                                height="40"
                                alt=""
                                loading="lazy"
                            />

                            <strong>

                                {author?.username}

                            </strong>
                        </Link>
                        <span className="text-muted ms-1">{currentPost?.post_time}</span>
                    </div>
                    <div className="w-100 d-flex justify-content-between">
                        <h1 className="fs-4">{currentPost?.title}</h1>
                        <div>
                            <Link to={`/posts/${post_id}/edit`}>Edit</Link>
                            <Button
                                onClick={() => {
                                    dispatch(postDeleted(parseInt(post_id)));
                                    window.alert("Delete successful");
                                    history.push(`/main/${account?.username}`);
                                }}
                                variant="link"
                            >
                                Delete

                            </Button>
                        </div>
                    </div>
                </div>
                <Carousel
                    activeIndex={index}
                    onSelect={handleSelect}
                    className="shadow-2-strong rounded-5 mb-4 mx-auto w-100"
                    style={{ maxWidth: 700 }}
                    interval={null}
                >
                    {currentPost?.photos.map((photo) => (
                        <Carousel.Item
                            key={photo.photo_id}
                            className="w-100"
                            onClick={(e) => {
                                setPhotoShow(true);
                            }}
                        >
                            <img
                                className="d-block w-100"
                                src={photo.image}
                                alt={`id ${photo.photo_id}`}
                                style={{ verticalAlign: "auto !important" }}
                            />
                        </Carousel.Item>
                    ))}
                </Carousel>
                <Modal
                    show={photoShow}
                    onHide={() => {
                        setPhotoShow(false);
                    }}
                >
                    <Modal.Header closeButton />
                    <Image src={currentPhoto?.image} alt={currentPhoto?.image} rounded />
                    <Modal.Footer className="justify-content-center">
                        <p>{currentPhoto?.local_tag}</p>
                    </Modal.Footer>
                </Modal>
                <p>{currentPost?.text}</p>
                <div className="mt-4">
                    {currentPost?.comments && currentPost.comments.map((comment) => (
                        <React.Fragment key={comment.comment_id}>
                            <Comment
                                comment={comment}
                                isEditable={account !== null &&
                            comment.author !== undefined &&
                            account.username === comment.author.username}
                                edit={(text) => dispatch(postCommentEdited({
                                    postId: currentPost.post_id, commentId: comment.comment_id, content: text,
                                }))}
                                del={() => dispatch(postCommentDeleted({
                                    postId: currentPost.post_id,
                                    commentId: comment.comment_id,
                                }))}
                            />
                        </React.Fragment>
                    ))}
                </div>
                <div className="d-flex flex-column comment-section">
                    <div className="bg-light p-2">
                        <div className="d-flex flex-row align-items-start">
                            <img
                                className="rounded-circle me-2"
                                src={account?.profile_picture ? account?.profile_picture : avatar}
                                width="40"
                                alt="profile"
                            />
                            <textarea
                                className="form-control ml-1 shadow-none textarea"
                                onChange={(event) => setComment(event.target.value)}
                                value={comment}
                            />
                        </div>
                        <div className="mt-2 text-right">
                            <button
                                className="btn btn-primary btn-sm shadow-none"
                                type="button"
                                onClick={({ target }) => {
                                    dispatch(newPostComment({
                                        postId: currentPost?.post_id as number,
                                        content: comment,
                                    }));
                                    setComment("");
                                }}
                                disabled={comment === ""}
                            >
                                Post comment
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default PostDetail;
