import React from "react";
import { ListGroup } from "react-bootstrap";
import { useHistory } from "react-router";
import {
    INotification,
    IPost,
    NoticeType,
    PostType,
} from "../../common/Interfaces";

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
                        variant="primary"
                        action
                        onClick={() => history.push(`/repos/${props.notification.repository?.repo_id}`)}
                    >
                        Your repository
                        {props.notification.repository?.repo_name}
                        has been posted
                    </ListGroup.Item>
                );
            }
            return (
                <ListGroup.Item
                    className="noti_personal_post d-flex justify-content-between align-items-start"
                    variant="primary"
                    action
                    onClick={() => history.push(`/posts/${props.notification.post?.post_id}`)}
                >
                    {props.notification.from_user.username}
                    makes a post
                    {props.notification.post?.title}
                    on your repository
                    {props.notification.repository?.repo_name}
                </ListGroup.Item>
            );
        case NoticeType.NEW_DISCUSSION:
            return (
                <ListGroup.Item
                    className="noti_discussion d-flex justify-content-between align-items-start"
                    variant="primary"
                    action
                    onClick={() =>
                        history.push(`/repos/${props.notification.repository?.repo_id}
                        /discussion/${props.notification.discussion?.discussion_id}`)}
                >
                    {props.notification.from_user.username}
                    makes a discussion
                    {props.notification.discussion?.title}
                    on your repository
                    {props.notification.repository?.repo_name}
                </ListGroup.Item>
            );
        case NoticeType.COMMENT:
            if (props.notification.discussion) {
                return (
                    <ListGroup.Item
                        className="noti_comment_discussion d-flex justify-content-between align-items-start"
                        variant="primary"
                        action
                        onClick={() =>
                            history.push(`/repos/${props.notification.repository?.repo_id}
                            /discussion/${props.notification.discussion?.discussion_id}`)}
                    >
                        {props.notification.count as number > 1 ?
                            `${props.notification.from_user.username} and ${props.notification.count} others` :
                            props.notification.from_user.username}
                        comment on your discussion
                        {props.notification.discussion?.title}
                    </ListGroup.Item>
                );
            }
            return (
                <ListGroup.Item
                    className="noti_comment_post d-flex justify-content-between align-items-start"
                    variant="primary"
                    action
                    onClick={() => history.push(`/posts/${props.notification.post?.post_id}`)}
                >
                    {props.notification.count as number > 1 ?
                        `${props.notification.from_user.username} and ${props.notification.count} others` :
                        props.notification.from_user.username}
                    comment on your post
                    {props.notification.post?.title}
                </ListGroup.Item>
            );
        case NoticeType.FORK:
            return (
                <ListGroup.Item
                    className="noti_fork d-flex justify-content-between align-items-start"
                    variant="primary"
                    action
                    onClick={() => history.push(`/repos/${props.notification.repository?.repo_id}`)}
                >
                    {props.notification.count as number > 1 ?
                        `${props.notification.from_user.username} and ${props.notification.count} others` :
                        props.notification.from_user.username}
                    fork your repository
                    {props.notification.repository?.repo_name}
                </ListGroup.Item>
            );
        default:
            return <div>Error</div>;
        }
    }
    return buildContent();
}
