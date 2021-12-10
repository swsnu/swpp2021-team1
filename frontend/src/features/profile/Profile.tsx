import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router";
import {
    ButtonGroup, Button, Image,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus, faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { IUser, Visibility, UserProfileType } from "../../common/Interfaces";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getFriends } from "../../common/APIs";
import FriendList from "./popup/FriendList";
import "./Profile.css";
import { addFriend, switchCurrentUser, unfriend } from "../auth/authSlice";
import avatar from "../../common/assets/avatar.jpg";

// suppress tsx-component-no-props

export default function Profile() {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.currentUser);
    const account = useAppSelector((state) => state.auth.account);
    const isLoading = useAppSelector((state) => state.auth.isLoading);
    const hasError = useAppSelector((state) => state.auth.hasError);
    const [friendList, setFriendList] = useState<IUser[]>([]);
    const [friendModalShow, setFriendModalShow] = useState<boolean>(false);
    const { user } = useParams<{user?: string}>();

    useEffect(() => {
        const switchToUser = () => {
            dispatch(switchCurrentUser(user as string));
        };
        if (user !== currentUser?.username ||
            (user === currentUser?.username && currentUser?.username !== account?.username)) {
            switchToUser();
        }
    }, [user]);

    useEffect(() => {
        const fetchAndSetFriendList = async (username: string) => {
            const response = await getFriends(username);
            setFriendList(response);
        };
        fetchAndSetFriendList(currentUser?.username as string);
    }, [currentUser]);

    const onAddFriendClick = () => {
        dispatch(addFriend({ username: account?.username as string, fusername: currentUser?.username as string }));
    };

    const onUnfriendClick = () => {
        dispatch(unfriend({ username: account?.username as string, fusername: currentUser?.username as string }));
    };

    const onFriendsClick = () => setFriendModalShow(true);
    const onClose = () => setFriendModalShow(false);

    const avatar_src = avatar;
    const profile_picture = currentUser && currentUser.profile_picture ? currentUser.profile_picture : avatar_src;

    let friendInfo;

    switch (currentUser?.friend_status) {
    case UserProfileType.FRIEND:
        friendInfo = (
            <Button
                id="unfriend-button"
                onClick={onUnfriendClick}
                variant="link"
                className="ms-0 ps-0"
            >
                <FontAwesomeIcon className="me-1" icon={faUserMinus} color="#f69d72" />
                Unfriend
            </Button>
        );
        break;
    case UserProfileType.REQUEST_SENDED:
        friendInfo = <span className="text-muted">Friend request sent</span>;
        break;
    case UserProfileType.REQUEST_PENDING:
        friendInfo = (
            <span className="text-muted">
                A pending friend request exists
                (Please accept/decline from the Notifications tab)
            </span>
        );
        break;
    case UserProfileType.OTHER:
        friendInfo = (
            <Button
                id="add-friend-button"
                onClick={onAddFriendClick}
                variant="link"
                className="ms-0 ps-0"
            >
                <FontAwesomeIcon className="me-1" icon={faUserPlus} color="#f69d72" />
                Add friend
            </Button>
        );
        break;
    default:
        break;
    }

    if (isLoading) {
        return (
            <div />
        );
    }
    if (hasError) {
        return <div>error!</div>;
    }
    let friendListVisible = false;
    if (currentUser?.username === account?.username) friendListVisible = true;
    else if (currentUser?.visibility === Visibility.ALL) {
        friendListVisible = true;
    }
    else if (currentUser?.visibility === Visibility.MEMBER_AND_FRIENDS) {
        if (account?.friends && account?.friends
            .find((friend) => friend.username === currentUser.username)) {
            friendListVisible = true;
        }
    }

    return (
        <div id="profile-card" className="d-flex mx-auto">
            <div className="flex-shrink-0">
                <Image width="100" height="100" id="profile-image" src={profile_picture} roundedCircle alt="profile" />
            </div>
            <div className="flex-grow-1 mx-4">
                <div className="d-flex align-items-center mb-2">
                    <h4
                        id="real-name"
                        className="me-2 mb-0"
                    >
                        {currentUser ? currentUser.username : "error"}
                    </h4>
                    <p id="username" className="small text-muted mb-0">

                        {currentUser && currentUser.real_name ? currentUser.real_name : ""}
                    </p>
                </div>
                <p className="card-text mb-0">
                    {currentUser ? currentUser.bio : ""}
                </p>
                <ButtonGroup>
                    <Button
                        id="num-of-friends"
                        onClick={onFriendsClick}
                        className="ms-0 ps-0 text-decoration-none"
                        variant="link"
                        hidden={!friendListVisible}

                    >
                        <strong>{friendList.length}</strong>
                                    &nbsp;friend
                        {friendList.length === 1 ? "" : "s"}
                    </Button>
                    <FriendList
                        currentUser={currentUser ? currentUser.username : ""}
                        modalShow={friendModalShow}
                        friendList={friendList}
                        handleClose={onClose}
                    />
                    {
                        friendInfo
                    }
                </ButtonGroup>
                <div className="fit-content ms-auto d-flex">
                    <Link
                        id="view-posts-button"
                        to={`/main/${currentUser?.username}`}
                        className="me-3 text-decoration-none text-muted small"
                    >
                        Show posts

                    </Link>
                    <Link
                        id="view-repos-button"
                        to={`/main/${currentUser?.username}/repos`}
                        className="text-decoration-none small text-muted"
                    >
                        Show repos
                    </Link>
                </div>
            </div>
        </div>
    );
}
