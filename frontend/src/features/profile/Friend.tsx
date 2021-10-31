import React from "react";
import { ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { IUser } from "../../common/Interfaces";

interface FriendProps {
    friend : IUser;
}

export default function Friend(props : FriendProps) {
    return (
        <Link to={`/main/${props.friend.username}`}>
            <ListGroup.Item key={props.friend.username}>
                <div className="d-flex">
                    <img id="profile-image" src={props.friend.profile_picture ? props.friend.profile_picture : "../../common/assets/avatar.jpg"} alt={`profile picture of ${props.friend.username}`} />
                    <div>
                        <h4 id="real-name">{props.friend.real_name}</h4>
                        <span id="username" className="small text-muted">@{props.friend.username}</span>
                    </div>
                </div>
            </ListGroup.Item>
        </Link>
    );
}
