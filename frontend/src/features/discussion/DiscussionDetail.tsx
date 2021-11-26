import { Button, FloatingLabel, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router";
import { AppDispatch, RootState } from "../../app/store";
import * as actionCreators from "./discussionsSlice";
import { IDiscussion, IUser } from "../../common/Interfaces";
import { fetchDiscussion } from "./discussionsSlice";
import Comment from "../comments/Comment";
import "../comments/Comments.css";
import "./DiscussionDetail.css";
import avatar from "../../common/assets/avatar.jpg";

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
        setMode(false);
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
                                value={title}
                                onChange={(event) => setTitle(event.target.value)}
                                style={{ width: "700px" }}
                            />
                        </FloatingLabel>
                    ) : (
                        <h4 className="pt-2">
                            {currentDiscussion?.title}
                        </h4>
                    )}
                    { account && currentDiscussion && account.username === currentDiscussion.author?.username && (
                        <div>
                            {mode ? (
                                <Button
                                    className="m-2"
                                    disabled={text === "" || title === ""}
                                    onClick={onEdit}
                                >
                                    Confirm
                                </Button>
                            ) : (
                                <Button className="m-2" onClick={changeMode}>Edit</Button>
                            )}
                            <Button className="m-2" onClick={onDelete}>Delete</Button>
                        </div>
                    )}
                </div>
                {!mode && (
                    <h6 style={{ color: "gray" }}>
                        {`${currentDiscussion?.author?.username}, ${currentDiscussion?.post_time}`}
                    </h6>
                )}
                <div className="mt-4">
                    {mode ? (
                        <FloatingLabel label="Content">
                            <Form.Control
                                as="textarea"
                                style={{ height: "400px" }}
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
                    <div className="bg-light p-3">
                        <div className="d-flex flex-row align-items-start">
                            <img
                                className="rounded-circle me-2"
                                src={account?.profile_picture ? account.profile_picture : avatar}
                                width="40"
                                alt="profile"
                            />
                            <textarea
                                className="form-control ml-1 shadow-none textarea"
                                onChange={(event) => setComment(event.target.value)}
                                value={comment}
                                style={{ height: "75px" }}
                                placeholder="Comment"
                            />
                        </div>
                        <div className="mt-2 d-flex flex-row-reverse text-right">
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
            <div className="mt-4 d-flex justify-content-end">
                <Button onClick={() => history.push(`/repos/${params.id}/discussion`)}>
                    Back to List
                </Button>
            </div>
        </div>
    );
}
