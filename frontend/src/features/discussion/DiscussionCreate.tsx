import { Button, FloatingLabel, Form } from "react-bootstrap";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useParams } from "react-router-dom";
import { AppDispatch, RootState } from "../../app/store";
import * as actionCreators from "./discussionsSlice";
import { IDiscussion } from "../../common/Interfaces";

interface DiscussionCreateProps {

}

export default function DiscussionCreate(props : DiscussionCreateProps) {
    const [title, setTitle] = useState<string>("");
    const [text, setText] = useState<string>("");
    const dispatch = useDispatch<AppDispatch>();
    const params = useParams<{id : string}>();
    const [isLoading, currentDiscussion] = useSelector<RootState, [boolean, IDiscussion|null]>((state) =>
        [state.discussions.isLoading, state.discussions.currentDiscussion]);

    function onCreate() {
        dispatch(actionCreators.createDiscussion({
            repo_id: parseInt(params.id),
            discussion: {
                discussion_id: -1,
                title,
                text,
            },
        }));
    }

    console.log(isLoading);

    return (
        <div>
            {!isLoading && currentDiscussion && (
                <Redirect
                    to={`/repos/${currentDiscussion.repo_id}/discussion/${currentDiscussion.discussion_id}`}
                />
            )}
            <h3 className="mt-4">Create Discussions</h3>
            <FloatingLabel controlId="title" label="Title" className="mt-4">
                <Form.Control
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                />
            </FloatingLabel>
            <FloatingLabel controlId="text" label="Content" className="mt-4">
                <Form.Control
                    as="textarea"
                    style={{ height: "400px" }}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                />
            </FloatingLabel>
            <div className="d-flex flex-row-reverse">
                <Button className="mt-4" disabled={text === "" || title === ""} onClick={onCreate}>Confirm</Button>
            </div>
        </div>
    );
}
