import React from "react";
import { Image, ListGroup } from "react-bootstrap";
import { Link } from "react-router-dom";
import { IUser } from "../../common/Interfaces";
import avatar from "../../common/assets/avatar.jpg";

interface FriendProps {
    friend : IUser;
}

export default function Friend(props : FriendProps) {
    const { friend } = props;
    return (
        <Link to={`/main/${props.friend.username}`} className="text-decoration-none">
            <ListGroup.Item
                key={props.friend.username}
                className="d-flex"
            >
                <div className="flex-shrink-0">
                    <Image
                        id="profile-image"
                        src={friend.profile_picture ? friend.profile_picture : avatar}
                        roundedCircle
                        width="100px"
                        height="100px"
                    />
                </div>
                <div className="flex-grow-1 mx-4 mb-0">
                    <p id="username" className="text-muted mb-2">
                        {friend.username}
                        {" "}
                    </p>
                    <p className="small">{friend.bio}</p>
                </div>
            </ListGroup.Item>

        </Link>
    );
}
