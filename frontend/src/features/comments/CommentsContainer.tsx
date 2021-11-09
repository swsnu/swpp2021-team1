import React from "react";
import ReactDOM from "react-dom";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./Comments.css";
import CommentsForm from "./CommentsForm";
import CommentsList from "./CommentsList";
import { commentsSelectors } from "./commentsSlice";

interface CommentsContainerProps {

}

const CommentsContainer = (props: CommentsContainerProps) => {
    const loading = useAppSelector((state) => state.comments.loading);
    const dispatch = useAppDispatch();
    const comments = commentsSelectors();
    if (loading === "succeeded") {
        return (
            <div className="container mt-5">
                <div className="d-flex justify-content-center row">
                    <div className="col-md-8">
                        <CommentsList comments={comments} />
                        <CommentsForm />
                    </div>
                </div>
            </div>
        );
    }
    if (loading === "failed") return <h3>Error!</h3>;
    return <></>;
};

export default CommentsContainer;
