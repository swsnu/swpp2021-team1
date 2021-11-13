import React, { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { RouteComponentProps, useParams } from "react-router";
import {
    ButtonGroup, Button, Image,
} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import { ALL } from "dns";
import { IUser, Visibility } from "../../common/Interfaces";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getFriends } from "../../common/APIs";
import FriendList from "./popup/FriendList";
import "./Profile.css";
import { addFriend, switchCurrentUser } from "../auth/authSlice";
import avatar from "../../common/assets/avatar.jpg";

interface ProfileProps {}

export default function Profile(props: ProfileProps) {
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
    const onFriendsClick = () => setFriendModalShow(true);
    const onClose = () => setFriendModalShow(false);

    const avatar_src = avatar;
    const profile_picture = currentUser && currentUser.profile_picture ? currentUser.profile_picture : avatar_src;

    const isBeFriendable = (currentUser?.username !== account?.username) &&
    (!(account?.friends?.find((friend) => friend.username === currentUser?.username)));

    if (isLoading) {
        return (
            <div id="profile-card" className="d-flex mx-auto">
                <div className="flex-shrink-0">
                    <Image id="profile-image" src="..." roundedCircle alt="profile" width="200px" height="200px" />
                </div>
                <div className="flex-grow-1 mx-4">
                    <div className="d-flex align-items-center mb-2">
                        <span className="placeholder col-8" />
                    </div>
                    <p className="card-text mb-0">
                        <span className="placeholder col-12" />
                        <span className="placeholder col-4" />
                    </p>
                </div>
            </div>
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
                        (isBeFriendable) ? (
                            <Button
                                id="add-friend-button"
                                onClick={onAddFriendClick}
                                variant="link"
                                className="ms-0 ps-0"
                            >
                                <FontAwesomeIcon className="me-1" icon={faUserPlus} color="#f69d72" />
                                Add friend
                            </Button>
                        ) :
                            ""
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
