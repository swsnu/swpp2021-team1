import { Button, ListGroup } from "react-bootstrap";
import React from "react";
import { Link } from "react-router-dom";
import { INotification, NoticeAnswerType, NoticeType } from "../../common/Interfaces";
import avatar from "../../common/assets/avatar.jpg";

interface NotificationInviteProps {
    notification : INotification;
    response : (id : number, answer : NoticeAnswerType) => void;
}

export default function NotificationResponse(props : NotificationInviteProps) {
    function buildContent() {
        switch (props.notification.classification) {
        case NoticeType.FRIEND_REQUEST:
            return (
                <div>
                    <Link className="noti_friend" to={`/main/${props.notification.from_user.username}`}>
                        <img
                            src={props.notification.from_user.profile_picture ?
                                props.notification.from_user.profile_picture : avatar}
                            className="rounded-circle shadow-1-strong me-3"
                            height="40"
                            alt=""
                            loading="lazy"
                        />
                        <strong>
                            @
                            {props.notification.from_user.username}
                        </strong>
                    </Link>
                    sends friend request.
                </div>
            );
        case NoticeType.INVITATION:
            return (
                <div>
                    {props.notification.from_user.username}
                    invite you to repository
                    <Link className="noti_invite" to={`/repos/${props.notification.repository?.repo_id}`}>
                        {props.notification.repository?.repo_name}
                    </Link>
                </div>
            );
        default:
            return <div>Error</div>;
        }
    }
    return (
        <ListGroup.Item
            className="d-flex justify-content-between align-items-start"
            variant="primary"
        >
            {buildContent()}
            <Button onClick={() => props.response(props.notification.notification_id, NoticeAnswerType.YES)}>
                Accept
            </Button>
            <Button onClick={() => props.response(props.notification.notification_id, NoticeAnswerType.NO)}>
                Decline
            </Button>
        </ListGroup.Item>
    );
}
