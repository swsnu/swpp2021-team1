import { Button, ListGroup } from "react-bootstrap";
import React from "react";
import { Link } from "react-router-dom";
import { INotification, NoticeAnswerType, NoticeType } from "../../common/Interfaces";
import avatar from "../../common/assets/avatar.jpg";
import "./Notification.css";

interface NotificationInviteProps {
    notification : INotification;
    response : (id : number, answer : NoticeAnswerType) => void;
}

export default function NotificationResponse(props : NotificationInviteProps) {
    function buildContent() {
        switch (props.notification.classification) {
        case NoticeType.FRIEND_REQUEST:
            return (
                <h5 className="m-2 notice-text-overflow">
                    <Link
                        className="noti_friend text-decoration-none"
                        to={`/main/${props.notification.from_user.username}`}
                    >
                        <img
                            src={props.notification.from_user.profile_picture ?
                                props.notification.from_user.profile_picture : avatar}
                            className="rounded-circle shadow-1-strong me-3"
                            height="40"
                            width="40"
                            alt=""
                            loading="lazy"
                        />
                        {props.notification.from_user.username}
                    </Link>
                    {" sends friend request. "}
                </h5>
            );
        case NoticeType.INVITATION:
            return (
                <h5 className="m-2 notice-text-overflow">
                    <img
                        src={props.notification.from_user.profile_picture ?
                            props.notification.from_user.profile_picture : avatar}
                        className="rounded-circle shadow-1-strong me-3"
                        height="40"
                        width="40"
                        alt=""
                        loading="lazy"
                    />
                    {props.notification.from_user.username}
                    {" invites you to repository "}
                    <Link
                        className="noti_invite text-decoration-none"
                        to={`/repos/${props.notification.repository?.repo_id}`}
                    >
                        {props.notification.repository?.repo_name}
                    </Link>
                </h5>
            );
        default:
            return <div>Error</div>;
        }
    }
    return (
        <ListGroup.Item
            className="d-flex justify-content-between align-items-start"
        >
            {buildContent()}
            <div>
                <Button
                    className="m-2"
                    onClick={() => props.response(props.notification.notification_id, NoticeAnswerType.YES)}
                >
                    Accept
                </Button>
                <Button
                    className="m-2"
                    onClick={() => props.response(props.notification.notification_id, NoticeAnswerType.NO)}
                >
                    Decline
                </Button>
            </div>
        </ListGroup.Item>
    );
}
