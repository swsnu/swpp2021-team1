import React from "react";
import { ListGroup } from "react-bootstrap";
import { useHistory } from "react-router";
import {
    INotification,
    IPost,
    NoticeType,
    PostType,
} from "../../common/Interfaces";
import avatar from "../../common/assets/avatar.jpg";
import "./Notification.css";
import fork from "../../common/assets/fork.svg";

interface NotificationProps {
    notification : INotification;
}

export default function Notification(props : NotificationProps) {
    const history = useHistory();

    function buildContent() {
        switch (props.notification.classification) {
        case NoticeType.NEW_POST:
            if ((props.notification.post as IPost).post_type === PostType.REPO) {
                return (
                    <ListGroup.Item
                        className="noti_repo_post d-flex justify-content-between align-items-start"
                        action
                        onClick={() => history.push(`/repos/${props.notification.repository?.repo_id}`)}
                    >
                        <h5 className="m-2 notice-text-overflow-long">
                            <img
                                src={fork}
                                height="40"
                                className="me-3"
                                alt=""
                            />
                            {"Your repository "}
                            {props.notification.repository?.repo_name}
                            {" was posted."}
                        </h5>
                    </ListGroup.Item>
                );
            }
            return (
                <ListGroup.Item
                    className="noti_personal_post d-flex justify-content-between align-items-start"
                    action
                    onClick={() => history.push(`/posts/${props.notification.post?.post_id}`)}
                >
                    <h5 className="m-2 notice-text-overflow-long">
                        <img
                            src={props.notification.from_user.profile_picture ?
                                props.notification.from_user.profile_picture : avatar}
                            className="rounded-circle shadow-1-strong me-3"
                            height="40"
                            alt=""
                            loading="lazy"
                        />
                        {props.notification.from_user.username}
                        {" makes a post "}
                        {props.notification.post?.title}
                        {" on your repository "}
                        {props.notification.repository?.repo_name}
                    </h5>
                </ListGroup.Item>
            );
        case NoticeType.NEW_DISCUSSION:
            return (
                <ListGroup.Item
                    className="noti_discussion d-flex justify-content-between align-items-start"
                    action
                    onClick={() =>
                        history.push(`/repos/${props.notification.repository?.repo_id}
                        /discussion/${props.notification.discussion?.discussion_id}`)}
                >
                    <h5 className="m-2 notice-text-overflow-long">
                        <img
                            src={props.notification.from_user.profile_picture ?
                                props.notification.from_user.profile_picture : avatar}
                            className="rounded-circle shadow-1-strong me-3"
                            height="40"
                            alt=""
                            loading="lazy"
                        />
                        {props.notification.from_user.username}
                        {" makes a discussion "}
                        {props.notification.discussion?.title}
                        {" on your repository "}
                        {props.notification.repository?.repo_name}
                    </h5>
                </ListGroup.Item>
            );
        case NoticeType.COMMENT:
            if (props.notification.discussion) {
                return (
                    <ListGroup.Item
                        className="noti_comment_discussion d-flex justify-content-between align-items-start"
                        action
                        onClick={() =>
                            history.push(`/repos/${props.notification.repository?.repo_id}
                            /discussion/${props.notification.discussion?.discussion_id}`)}
                    >
                        <h5 className="m-2 notice-text-overflow-long">
                            <img
                                src={props.notification.from_user.profile_picture ?
                                    props.notification.from_user.profile_picture : avatar}
                                className="rounded-circle shadow-1-strong me-3"
                                height="40"
                                alt=""
                                loading="lazy"
                            />
                            {props.notification.count as number > 1 ?
                                `${props.notification.from_user.username} and ${props.notification.count} others` :
                                props.notification.from_user.username}
                            {" comment on your discussion "}
                            {props.notification.discussion?.title}
                        </h5>
                    </ListGroup.Item>
                );
            }
            return (
                <ListGroup.Item
                    className="noti_comment_post d-flex justify-content-between align-items-start"
                    action
                    onClick={() => history.push(`/posts/${props.notification.post?.post_id}`)}
                >
                    <h5 className="m-2 notice-text-overflow-long">
                        <img
                            src={props.notification.from_user.profile_picture ?
                                props.notification.from_user.profile_picture : avatar}
                            className="rounded-circle shadow-1-strong me-3"
                            height="40"
                            alt=""
                            loading="lazy"
                        />
                        {props.notification.count as number > 1 ?
                            `${props.notification.from_user.username} and ${props.notification.count} others` :
                            props.notification.from_user.username}
                        {" comment on your post "}
                        {props.notification.post?.title}
                    </h5>
                </ListGroup.Item>
            );
        case NoticeType.FORK:
            return (
                <ListGroup.Item
                    className="noti_fork d-flex justify-content-between align-items-start"
                    action
                    onClick={() => history.push(`/repos/${props.notification.repository?.repo_id}`)}
                >
                    <h5 className="m-2 notice-text-overflow-long">
                        <img
                            src={props.notification.from_user.profile_picture ?
                                props.notification.from_user.profile_picture : avatar}
                            className="rounded-circle shadow-1-strong me-3"
                            height="40"
                            alt=""
                            loading="lazy"
                        />
                        {props.notification.count as number > 1 ?
                            `${props.notification.from_user.username} and ${props.notification.count} others` :
                            props.notification.from_user.username}
                        {" fork from your repository "}
                        {props.notification.repository?.repo_name}
                    </h5>
                </ListGroup.Item>
            );
        default:
            return <div>Error</div>;
        }
    }
    return buildContent();
}
