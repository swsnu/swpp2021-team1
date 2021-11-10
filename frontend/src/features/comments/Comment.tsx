import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { IComment, IUser } from "../../common/Interfaces";
import "./Comments.css";
import avatar from "../../common/assets/avatar.jpg";

interface CommentProps {
    comment: IComment,
    isEditable: boolean,
    edit: (text: string) => void,
    del: () => void,
}

const Comment = (props: CommentProps) => {
    const {
        comment, isEditable, edit, del,
    } = props;
    const [text, setText] = useState<string>(comment.text);
    const [mode, setMode] = useState<boolean>(false);

    function onEdit() {
        edit(text);
        setMode(false);
    }

    function changeMode() {
        setText(comment.text);
        setMode(true);
    }

    return (
        <>
            <div className="bg-white p-2">
                <div className="d-flex flex-row user-info">
                    <img
                        className="rounded-circle me-2"
                        src={comment.author?.profile_picture ? comment.author?.profile_picture : avatar}
                        width="40"
                        height="40"
                        alt="author profile"
                    />
                    <div className="d-flex flex-column justify-content-start ml-2">
                        <strong className="d-block name text-dark">
                            {comment.author?.username}
                        </strong>
                        <span className="small text-black-50">{comment.post_time as string}</span>
                    </div>
                </div>
                { mode ? (
                    <Form.Control
                        as="textarea"
                        className="mt-2"
                        value={text}
                        onChange={(event) => setText(event.target.value)}
                        style={{ height: "75px" }}
                    />
                ) : (
                    <div className="mt-2">
                        <p className="comment-text">{comment.text}</p>
                    </div>
                )}
            </div>
            <div className="bg-white">
                <div className="d-flex flex-row">
                    {isEditable && (
                        <>
                            {mode ? (
                                <div
                                    className="like p-2 cursor"
                                    role="button"
                                    tabIndex={0}
                                    onClick={onEdit}
                                    onKeyDown={onEdit}
                                >
                                    <i className="fa fa-edit-o" />
                                    <span className="ml-1">Commit</span>
                                </div>
                            ) : (
                                <div
                                    className="like p-2 cursor"
                                    role="button"
                                    tabIndex={0}
                                    onClick={changeMode}
                                    onKeyDown={changeMode}
                                >
                                    <i className="fa fa-edit-o" />
                                    <span className="ml-1">Edit</span>
                                </div>
                            )}
                            <div
                                className="like p-2 cursor"
                                role="button"
                                tabIndex={0}
                                onClick={del}
                                onKeyDown={del}
                            >
                                <i className="fa fa-trash" />
                                <span className="ml-1">Delete</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default Comment;
