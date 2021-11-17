import { Button, ListGroup } from "react-bootstrap";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useParams } from "react-router-dom";
import Photo from "../photo/Photo";
import AddPhoto from "../photo/popup/AddPhoto";
import FocusedPhoto from "../photo/popup/FocusedPhoto";
import { AppDispatch, RootState } from "../../app/store";
import { IDiscussion, IRepository, IUser } from "../../common/Interfaces";
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

    const [user, repo] = useSelector<RootState, [IUser|null, IRepository|null]>((state) =>
        [state.auth.account, state.repos.currentRepo]);
    const auth = user && repo && repo.collaborators.filter((value) => value.username === user.username).length > 0;

    useEffect(() => {
        dispatch(actionCreators.fetchDiscussions(parseInt(params.id)));
    }, [dispatch]);

    if (isLoading) return null;
    if (!auth) return null;
    return (
        <div>
            <div className="d-flex mt-4 justify-content-between align-items-start">
                <h4>Discussions</h4>
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
                        onClick={() => {
                            dispatch(actionCreators.toBeLoaded(null));
                            history.push(`/repos/${params.id}/discussion/create`);
                        }}
                    >
                        +
                    </Button>
                </div>
            </div>
            <ListGroup className="mt-4">
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
