import { ListGroup } from "react-bootstrap";
import React from "react";
import { useHistory } from "react-router-dom";
import { IDiscussion } from "../../common/Interfaces";

interface DiscussionProps {
    discussion : IDiscussion;
}

export default function Discussion(props : DiscussionProps) {
    const history = useHistory();

    return (
        <ListGroup.Item
            className="d-flex justify-content-between align-items-start"
            action
            onClick={() =>
                history.push(`/repos/${props.discussion.repo_id}/discussion/${props.discussion.discussion_id}`)}
        >
            <div className="ms-2 me-auto">
                <h5 className="fw-normal">{props.discussion.title}</h5>
                <div className="text-muted">
                    {props.discussion.author?.username}
                </div>
            </div>
            <div>
                {props.discussion.post_time}
            </div>
        </ListGroup.Item>
    );
}
