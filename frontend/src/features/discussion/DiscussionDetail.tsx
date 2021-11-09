import { Button, FloatingLabel, Form } from "react-bootstrap";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useHistory } from "react-router";
import { AppDispatch, RootState } from "../../app/store";
import * as actionCreators from "./discussionsSlice";
import { IDiscussion, IUser } from "../../common/Interfaces";
import { fetchDiscussion } from "./discussionsSlice";

interface DiscussionDetailProps {

}

export default function DiscussionDetail(props : DiscussionDetailProps) {
    const [title, setTitle] = useState<string>("");
    const [text, setText] = useState<string>("");
    const dispatch = useDispatch<AppDispatch>();
    const params = useParams<{id : string, id2 : string}>();
    const [isLoading, hasError, currentDiscussion] = useSelector<
            RootState,
            [boolean, boolean, IDiscussion|null]
        >((state) =>
            [state.discussions.isLoading, state.discussions.hasError, state.discussions.currentDiscussion]);
    const [mode, setMode] = useState<boolean>(false);
    const account = useSelector<RootState, IUser|null>((state) => state.auth.account);
    const history = useHistory();

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

    if (isLoading) return null;
    if (hasError) return <div>404Error : Discussion Not Found</div>;
    return (
        <div>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                {mode ? (
                    <FloatingLabel label="Title">
                        <Form.Control
                            as="textarea"
                            value={title}
                            onChange={(event) => setTitle(event.target.value)}
                        />
                    </FloatingLabel>
                ) : (
                    <h3>
                        {currentDiscussion?.title}
                    </h3>
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
            {/* TODO : Comment */}
        </div>
    );
}
