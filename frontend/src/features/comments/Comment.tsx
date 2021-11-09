import React from "react";
import { useAppDispatch } from "../../app/hooks";
import "./Comments.css";

interface CommentProps {

}

const Comment = (props: CommentProps) => {
    const dispatch = useAppDispatch();
    return (
        <>
            <div className="bg-white p-2">
                <div className="d-flex flex-row user-info">
                    <img
                        className="rounded-circle"
                        src="https://i.imgur.com/RpzrMR2.jpg"
                        width="40"
                        alt="profile"
                    />
                    <div className="d-flex flex-column justify-content-start ml-2">
                        <span className="d-block font-weight-bold name">Marry Andrews</span>
                        <span className="date text-black-50">Shared publicly - Jan 2020</span>
                    </div>
                </div>
                <div className="mt-2">
                    <p className="comment-text">
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                </div>
            </div>
            <div className="bg-white">
                <div className="d-flex flex-row fs-12">
                    <div className="like p-2 cursor">
                        <i className="fa fa-thumbs-o-up" />
                        <span className="ml-1">Like</span>
                    </div>
                    <div className="like p-2 cursor">
                        <i className="fa fa-commenting-o" />
                        <span className="ml-1">Comment</span>
                    </div>
                    <div className="like p-2 cursor">
                        <i className="fa fa-share" />
                        <span className="ml-1">Share</span>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Comment;
