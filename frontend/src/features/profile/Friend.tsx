import React from "react";
import {DummyUser} from "../../common/Interfaces";

interface FriendProps {
    user : DummyUser;
}

export default function Friend(props : FriendProps) {

    return (
        <div>
            <div>Profile Image : {props.user.profile_picture}</div>
            <div>RealName : {props.user.real_name}</div>
        </div>
    )
}