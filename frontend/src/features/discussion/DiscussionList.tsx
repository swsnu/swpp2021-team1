import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { AppDispatch, RootState } from "../../app/store";
import { IDiscussion } from "../../common/Interfaces";
import * as actionCreators from "./discussionsSlice";
import Discussion from "./Disucssion";
import "./DiscussionDetail.css";

// suppress tsx-no-component-props
export default function DiscussionList() {
    const [isLoading, hasError, discussionList] = useSelector<RootState, [boolean, boolean, IDiscussion[]]>((state) =>
        [state.discussions.isLoading, state.discussions.hasError, state.discussions.discussionList]);
    const params = useParams<{id : string}>();
    const history = useHistory();
    const dispatch = useDispatch<AppDispatch>();
    const [index, setIndex] = useState<number>(0);

    useEffect(() => {
        dispatch(actionCreators.fetchDiscussions(parseInt(params.id)));
    }, [dispatch]);

    if (isLoading) return null;
    if (hasError) return null;
    return (
        <div className="mt-4 p-2 discussion-list-wrapper">
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h3>Discussions</h3>
                <div>
                    <Button
                        id="discussion-create-button"
                        onClick={() => {
                            dispatch(actionCreators.toBeLoaded(null));
                            history.push(`/repos/${params.id}/discussion/create`);
                        }}
                    >
                        New Discussion
                    </Button>
                </div>
            </div>
            <ListGroup className="mt-4">
                {discussionList.slice(index, index + 20).map((value) =>
                    (
                        <React.Fragment key={value.discussion_id}>
                            <Discussion discussion={value} />
                        </React.Fragment>
                    ))}
            </ListGroup>
            <div className="mt-4 d-flex justify-content-center">
                <Button
                    disabled={(index <= 0)}
                    onClick={() => setIndex(index - 20)}
                    variant="link"
                    className="ms-1 me-1 text-decoration-none"
                >
                    {"<Prev"}
                </Button>
                {[-2, -1, 0, 1, 2].map((value) => {
                    if (value === 0) {
                        return (
                            <React.Fragment key={value.toString()}>
                                <Button
                                    variant="primary"
                                    className="ms-1 me-1"
                                >
                                    {(index / 20 + 1).toString()}
                                </Button>
                            </React.Fragment>
                        );
                    }
                    if (index + 20 * value >= 0 && index + 20 * value < discussionList.length) {
                        return (
                            <React.Fragment key={value.toString()}>
                                <Button
                                    variant="outline-primary"
                                    onClick={() => setIndex(index + 20 * value)}
                                    className="ms-1 me-1"
                                >
                                    {(index / 20 + value + 1).toString()}
                                </Button>
                            </React.Fragment>
                        );
                    }
                    return null;
                })}
                <Button
                    disabled={(index + 20 >= discussionList.length)}
                    onClick={() => setIndex(index + 20)}
                    variant="link"
                    className="ms-1 me-1 text-decoration-none"
                >
                    {"Next>"}
                </Button>
            </div>
        </div>
    );
}
