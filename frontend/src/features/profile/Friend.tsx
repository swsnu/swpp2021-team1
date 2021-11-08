import React from "react";
import { Image, ListGroup } from "react-bootstrap";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";
import { useAppDispatch } from "../../app/hooks";
import { IUser } from "../../common/Interfaces";

interface FriendProps {
    friend : IUser;
}

export default function Friend(props : FriendProps) {
    const dispatch = useAppDispatch();
    const history = useHistory();
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
                        src={friend.profile_picture}
                        roundedCircle
                    />
                </div>
                <div className="flex-grow-1 mx-4 mb-0">
                    <h5
                        id="real-name"
                    >
                        {friend.real_name ? friend.real_name : ""}
                    </h5>
                    <p id="username" className="small text-muted mb-2">
                        @
                        {friend.username}
                        {" "}
                    </p>
                    <p className="small">{friend.bio}</p>
                </div>
            </ListGroup.Item>

        </Link>
    );
}
