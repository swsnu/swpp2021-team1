import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Button, ListGroup } from "react-bootstrap";
import { AppDispatch, RootState } from "../../app/store";
import { IDiscussion } from "../../common/Interfaces";
import * as actionCreators from "./discussionsSlice";
import Discussion from "./Disucssion";

interface DiscussionListProps {

}

export default function DiscussionList(props : DiscussionListProps) {
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
    return (
        <div>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4 className="m-2">Discussions</h4>
                <div>
                    <Button
                        className="m-2"
                        id="discussion-create-button"
                        onClick={() => {
                            actionCreators.toBeLoaded(null);
                            history.push(`/repos/${params.id}/discussion/create`);
                        }}
                    >
                        +
                    </Button>
                </div>
            </div>
            <ListGroup>
                {discussionList.slice(index, index + 20).map((value) =>
                    (
                        <React.Fragment key={value.discussion_id}>
                            <Discussion discussion={value} />
                        </React.Fragment>
                    ))}
            </ListGroup>
            <Button
                disabled={(index <= 0)}
                onClick={() => setIndex(index - 20)}
            >
                Prev
            </Button>
            <Button
                disabled={(index + 20 >= discussionList.length)}
                onClick={() => setIndex(index + 20)}
            >
                Next
            </Button>
        </div>
    );
}
