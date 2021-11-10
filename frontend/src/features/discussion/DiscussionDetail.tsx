import { Button, FloatingLabel, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router";
import { AppDispatch, RootState } from "../../app/store";
import * as actionCreators from "./discussionsSlice";
import { IComment, IDiscussion, IUser } from "../../common/Interfaces";
import { fetchDiscussion } from "./discussionsSlice";
import Comment from "../comments/Comment";
import "../comments/Comments.css";
import "./DiscussionDetail.css";

interface DiscussionDetailProps {

}

export default function DiscussionDetail(props : DiscussionDetailProps) {
    const [title, setTitle] = useState<string>("");
    const [text, setText] = useState<string>("");
    const dispatch = useDispatch<AppDispatch>();
    const params = useParams<{id : string, id2 : string}>();
    const [isUserLoading] = useSelector<RootState, [boolean]>((state) => [state.auth.isLoading]);
    const [isLoading, hasError, currentDiscussion] = useSelector<
            RootState,
            [boolean, boolean, IDiscussion|null]
        >((state) =>
            [state.discussions.isLoading, state.discussions.hasError, state.discussions.currentDiscussion]);
    const [mode, setMode] = useState<boolean>(false);
    const account = useSelector<RootState, IUser|null>((state) => state.auth.account);
    const history = useHistory();
    const [comment, setComment] = useState<string>("");

    useEffect(() => {
        if (!currentDiscussion || currentDiscussion.discussion_id !== parseInt(params.id2)) {
            dispatch(fetchDiscussion(parseInt(params.id2)));
        }
    }, [dispatch]);

    function onEdit() {
        dispatch(actionCreators.editDiscussion({
            discussion_id: (currentDiscussion as IDiscussion).discussion_id,
            title,
            text,
        }));
    }

    function changeMode() {
        setTitle((currentDiscussion as IDiscussion).title);
        setText((currentDiscussion as IDiscussion).text as string);
        setMode(true);
    }

    function onDelete() {
        dispatch(actionCreators.removeDiscussion(parseInt(params.id2))).then(() => {
            history.push(`/repos/${params.id}/discussion`);
        });
    }

    function onAddComment() {
        dispatch(actionCreators.createComment({ discussion_id: parseInt(params.id2), text: comment }));
        setComment("");
    }

    function onDeleteComment(id : number) {
        dispatch(actionCreators.removeComment({ discussion_id: parseInt(params.id2), comment_id: id }));
    }

    function onEditComment(id : number, text : string) {
        dispatch(actionCreators.editComment({ discussion_id: parseInt(params.id2), comment_id: id, text }));
    }

    if (isLoading || isUserLoading) return null;
    if (hasError) return <div>404Error : Discussion Not Found</div>;
    return (
        <div>
            <div className="p-3 mt-5 discussion-wrapper">
                <div className="d-flex justify-content-between align-items-start">
                    {mode ? (
                        <FloatingLabel label="Title">
                            <Form.Control
                                as="textarea"
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                            />
                        </FloatingLabel>
                    ) : (
                        <h4>
                            {currentDiscussion?.title}
                        </h4>
                    )}
                    { account && currentDiscussion && account.username === currentDiscussion.author?.username && (
                        <div>
                            {mode ? (
                                <Button disabled={text === "" || title === ""} onClick={onEdit}>Confirm</Button>
                            ) : (
                                <Button onClick={changeMode}>Edit</Button>
                            )}
                            <Button onClick={onDelete}>Delete</Button>
                        </div>
                    )}
                </div>
                <h6 className="mt-2">
                    {`${currentDiscussion?.author?.username}, ${currentDiscussion?.post_time}`}
                </h6>
                <div className="mt-4">
                    {mode ? (
                        <FloatingLabel label="Content">
                            <Form.Control
                                as="textarea"
                                style={{ height: "600px" }}
                                value={text}
                                onChange={(event) => setText(event.target.value)}
                            />
                        </FloatingLabel>
                    ) : (
                        <p>
                            {currentDiscussion?.text}
                        </p>
                    )}
                </div>
            </div>
            <div className="p-3">
                <div className="mt-4">
                    {currentDiscussion?.comments && currentDiscussion.comments.map((value) => (
                        <React.Fragment key={value.comment_id}>
                            <Comment
                                comment={value}
                                isEditable={account !== null &&
                            value.author !== undefined &&
                            account.username === value.author.username}
                                edit={(text) => onEditComment(value.comment_id, text)}
                                del={() => onDeleteComment(value.comment_id)}
                            />
                        </React.Fragment>
                    ))}
                </div>
                <div className="d-flex flex-column comment-section">
                    <div className="bg-light p-2">
                        <div className="d-flex flex-row align-items-start">
                            <img
                                className="rounded-circle"
                                src={account?.profile_picture}
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
                                onClick={onAddComment}
                                disabled={comment === ""}
                            >
                                Post comment
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
