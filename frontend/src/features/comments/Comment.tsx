import React, { useEffect, useState } from "react";
import { Form } from "react-bootstrap";
import { IComment, IUser } from "../../common/Interfaces";
import "./Comments.css";

interface CommentProps {
    comment: IComment,
    isEditable: boolean,
    edit: (text: string) => void,
    del: () => void,
}

const Comment = (props: CommentProps) => {
    // const dispatch = useAppDispatch();
    const {
        comment, isEditable, edit, del,
    } = props;
    // const [loading, setLoading] = useState<"idle" | "pending" | "succeeded" | "failed">("idle");
    const { author } = comment;
    const [text, setText] = useState<string>(comment.text);
    const [mode, setMode] = useState<boolean>(false);
    // const [author, setAuthor] = useState<IUser | null>(null);

    function onEdit() {
        edit(text);
        setMode(false);
    }

    function changeMode() {
        setText(comment.text);
        setMode(true);
    }
    // useEffect(() => {
    //     const getAuthorInfo = async (username: string) => {
    //         setLoading("pending");
    //         try {
    //             const user = await getUser(username);
    //             setAuthor(user);
    //             setLoading("succeeded");
    //         }
    //         catch (e) {
    //             setLoading("failed");
    //         }
    //     };
    //     if (loading === "idle" && comment.author) {
    //         getAuthorInfo(comment.author);
    //     }
    // }, [dispatch]);

    return (
        <>
            <div className="bg-white p-2">
                <div className="d-flex flex-row user-info">
                    <img
                        className="rounded-circle"
                        src={author?.profile_picture}
                        width="40"
                        alt="author profile"
                    />
                    <div className="d-flex flex-column justify-content-start ml-2">
                        <span className="d-block name">
                            @
                            {author?.username}
                        </span>
                        <span className="date text-black-50">{comment.post_time as string}</span>
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
                <div className="d-flex flex-row fs-12">
                    {/* <div className="like p-2 cursor">
                            <i className="fa fa-thumbs-o-up" />
                            <span className="ml-1">Like</span>
                        </div> */}
                    {
                        isEditable && (
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
                        )
                    }
                </div>
            </div>
        </>
    );
};

export default Comment;