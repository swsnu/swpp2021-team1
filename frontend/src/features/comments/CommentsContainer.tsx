import React from "react";
import ReactDOM from "react-dom";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import "./Comments.css";
import CommentsForm from "./CommentsForm";
import CommentsList from "./CommentsList";

interface CommentsContainerProps {

}

const CommentsContainer = (props: CommentsContainerProps) => (
    <div className="container mt-5">
        <div className="d-flex justify-content-center row">
            <div className="col-md-8">
                <CommentsList />
                <CommentsForm />
            </div>
        </div>
    </div>
);

export default CommentsContainer;
