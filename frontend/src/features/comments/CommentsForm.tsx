import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { postPostComment } from "../../common/APIs";
import "./Comments.css";
import { newCommentPosted } from "./commentsSlice";

interface CommentsFormProps {
}

const CommentsForm = (props: CommentsFormProps) => {
    const dispatch = useAppDispatch();
    const [content, setContent] = useState("");
    const account = useAppSelector((state) => state.auth.account);

    return (
        <div className="d-flex flex-column comment-section">
            <div className="bg-light p-2">
                <div className="d-flex flex-row align-items-start">
                    <img
                        className="rounded-circle"
                        src={account?.profile_picture}
                        width="40"
                        alt="profile"
                    />
                    <textarea className="form-control ml-1 shadow-none textarea" />
                </div>
                <div className="mt-2 text-right">
                    {/* <button
                        className="btn btn-primary btn-sm shadow-none"
                        type="button"
                        onClick={() => dispatch(newCommentPosted())}
                    >
                        Post comment
                    </button> */}
                    <button className="btn btn-outline-primary btn-sm ml-1 shadow-none" type="button">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CommentsForm;
