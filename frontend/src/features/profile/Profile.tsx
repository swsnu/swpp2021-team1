import "./Profile.css";

import { faUserPlus, faUserMinus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { Button, ButtonGroup, Image } from "react-bootstrap";
import { useParams } from "react-router";
import { Link } from "react-router-dom";

import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { getFriends } from "../../common/APIs";
import avatar_src from "../../common/assets/avatar.jpg";
import { IUser, Visibility } from "../../common/Interfaces";
import { addFriend, switchCurrentUser, unfriend } from "../auth/authSlice";
import FriendList from "./popup/FriendList";

// suppress no-tsx-component-props

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
        // params로 새로운 유저가 입력되었을 때,
        // 입력된 유저가 현재 보고 있는 유저와 다르거나,
        // 현재 '내가 아닌' 다른 유저를 보고 있는 상태에서, 동일한 유저가 입력되었으면 (왜 내가 짠 코드인데 이해를 못하겠지...)
        // 입력된 유저로 currentUser를 변경
        if (user !== currentUser?.username ||
            (user === currentUser?.username && currentUser?.username !== account?.username)) {
            dispatch(switchCurrentUser(user as string));
        }
    }, [user]);

    useEffect(() => {
        const fetchAndSetFriendList = async (username: string) => {
            const response = await getFriends(username);
            setFriendList(response);
        };
        // currentUser가 변경되면, 그 유저의 친구목록을 가져와 friendList에 세팅함.
        fetchAndSetFriendList(currentUser?.username as string);
    }, [currentUser]);

    const onAddFriendClick = () => {
        // Add Friend를 클릭했을 때, 그 유저를 친구로 추가함
        dispatch(addFriend({ username: account?.username as string, fusername: currentUser?.username as string }));
    };

    // 친구 끊기 핸들러
    const onUnfriendClick = () => {
        dispatch(unfriend({ username: account?.username as string, fusername: currentUser?.username as string }));
    };

    // 유저 프로필에서 'n Friends'를 눌렀을 때, 그 유저의 친구 목록 modal을 보여줌
    const onFriendsClick = () => setFriendModalShow(true);
    // 친구목록 modal을 닫았을때의 핸들러
    const onClose = () => setFriendModalShow(false);

    // User 오브젝트에 profile_picture이 있으면 이것으로 프로필 사진 보여줌, 없으면 기본 아바타로 보여줌
    const profile_picture = currentUser && currentUser.profile_picture ? currentUser.profile_picture : avatar_src;

    // 'Add Friend'가 뜨는 조건 : currentUser가 내가 아닌 다른 사람의 계정이고 / 내 친구목록에 그 유저가 없을 때
    const isBeFriendable = (currentUser?.username !== account?.username) &&
    (!(account?.friends?.find((friend) => friend.username === currentUser?.username)));
    // 'Unfriend'가 뜨는 조건 : currentUser가 내 친구 중 하나일 때
    const isUnFriendable = account?.friends?.find((friend) => friend.username === currentUser?.username);

    // 로딩중에는 아무것도 띄우지 않음
    if (isLoading) {
        return (
            <div />
        );
    }
    // 에러 발생시에는 에러 메시지를 띄움
    if (hasError) {
        return <div>error!</div>;
    }

    // 비공개 계정의 친구목록은 공개하지 않음
    let friendListVisible = false;
    // 내 계정이면 당연히 내 친구목록은 볼 수 있음
    if (currentUser?.username === account?.username) friendListVisible = true;
    // 다른 사람 계정이고, 공개 계정이면 친구 목록도 공개
    else if (currentUser?.visibility === Visibility.ALL) {
        friendListVisible = true;
    }
    // 다른 사람 계정이고, 친구 공개 계정이면,
    // 내 친구 목록에 그 사람이 있으면 그 사람의 친구 목록 볼 수 있음
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
                    {
                        (isUnFriendable) ? (
                            <Button
                                id="unfriend-button"
                                onClick={onUnfriendClick}
                                variant="link"
                                className="ms-0 ps-0"
                            >
                                <FontAwesomeIcon className="me-1" icon={faUserMinus} color="#f69d72" />
                                Unfriend
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
