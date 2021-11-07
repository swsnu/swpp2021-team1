import { Button, ListGroup } from "react-bootstrap";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import Photo from "../photo/Photo";
import AddPhoto from "../photo/popup/AddPhoto";
import FocusedPhoto from "../photo/popup/FocusedPhoto";
import { AppDispatch, RootState } from "../../app/store";
import { IDiscussion } from "../../common/Interfaces";
import * as actionCreators from "./discussionsSlice";
import Discussion from "./Disucssion";

interface DiscussionPreviewProps {

}

export default function DiscussionPreview(props : DiscussionPreviewProps) {
    const [isLoading, hasError, discussionList] = useSelector<RootState, [boolean, boolean, IDiscussion[]]>((state) =>
        [state.discussions.isLoading, state.discussions.hasError, state.discussions.discussionList]);
    const params = useParams<{id : string}>();
    const history = useHistory();
    const dispatch = useDispatch<AppDispatch>();

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
                        id="discussion-list-button"
                        onClick={() => history.push(`/repos/${params.id}/discussion`)}
                    >
                        View More
                    </Button>
                    <Button
                        className="m-2"
                        id="discussion-create-button"
                        onClick={() => history.push(`/repos/${params.id}/discussion/create`)}
                    >
                        +
                    </Button>
                </div>
            </div>
            <ListGroup>
                {discussionList.map((value, key) =>
                    (key < 5) && (
                        <React.Fragment key={value.discussion_id}>
                            <Discussion discussion={value} />
                        </React.Fragment>
                    ))}
            </ListGroup>
        </div>
    );
}
