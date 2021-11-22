import React, {
    FormEvent, MouseEventHandler, useEffect, useState,
} from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import { Carousel, Image, Modal } from "react-bootstrap";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getUser } from "../../common/APIs";
import { IPhoto, IUser } from "../../common/Interfaces";
import {
    fetchSinglePost, newPostComment, postCommentDeleted, postCommentEdited,
} from "./postsSlice";
import "./Posts.css";
import Comment from "../comments/Comment";
import Photo from "../photo/Photo";
import avatar from "../../common/assets/avatar.jpg";
import FocusedPhoto from "../photo/popup/FocusedPhoto";
import { editPhoto } from "../photo/photosSlice";

interface PostDetailProps {
}

const PostDetail = (props: PostDetailProps) => {
    const dispatch = useAppDispatch();
    const { post_id } = useParams<{post_id: string}>();
    const currentPost = useAppSelector((state) => state.posts.currentPost);
    const [authorLoading, setAuthorLoading] = useState<"idle" | "pending" | "succeeded" | "failed">("idle");
    const [postLoading, setPostLoading] = useState<"idle" | "pending" | "succeeded" | "failed">("idle");
    const [author, setAuthor] = useState<IUser | null>(null);
    const [index, setIndex] = useState<number>(0);
    const [photoShow, setPhotoShow] = useState<boolean>(false);
    const account = useAppSelector((state) => state.auth.account);
    const [comment, setComment] = useState("");
    const currentPhoto = currentPost?.photos[index];

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
    /* useEffect(() => {
        const getAuthorInfo = async (username: string) => {
            try {
                setAuthorLoading("pending");
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
    }, [currentPost]); */

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
                            to={`/main/${currentPost?.author?.username}`}
                            id="author-username"
                            className="text-decoration-none text-dark"
                        >
                            <img
                                src={currentPost?.author?.profile_picture ? currentPost.author.profile_picture : avatar}
                                className="rounded-circle shadow-1-strong me-3"
                                height="40"
                                alt=""
                                loading="lazy"
                            />

                            <strong>
                                @
                                {currentPost?.author?.username}

                            </strong>
                        </Link>
                        <span className="text-muted ms-1">{currentPost?.post_time}</span>
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
