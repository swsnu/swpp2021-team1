import React from "react";
import {DummyUser} from "../../Interfaces";

interface FriendProps {
    user : DummyUser;
}

export default function Friend(props : FriendProps) {

    return (
        <div>
            <div>Profile Image : {props.user.profilePicture}</div>
            <div>RealName : {props.user.realName}</div>
        </div>
    )
}