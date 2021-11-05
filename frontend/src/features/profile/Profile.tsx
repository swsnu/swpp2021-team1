import React, { useEffect, useState } from "react";
import { useHistory, Link } from "react-router-dom";
import { RouteComponentProps } from "react-router";
import { ButtonGroup, Button } from "react-bootstrap";
import { IUser } from "../../common/Interfaces";
import { useAppDispatch, useAppSelector } from "../../app/hooks";
import { fetchUser } from "../auth/authSlice";
import { getFriends } from "../../common/APIs";
import FriendList from "./popup/FriendList";

interface MatchParams {
    user: string
}

interface ProfileProps extends RouteComponentProps<MatchParams> {

}

export default function Profile(props: ProfileProps) {
    const dispatch = useAppDispatch();
    const currentUser = useAppSelector((state) => state.auth.currentUser);
    const isLoading = useAppSelector((state) => state.auth.isLoading);
    const hasError = useAppSelector((state) => state.auth.hasError);
    const [friendList, setFriendList] = useState<IUser[]>([]);
    const [friendModalShow, setFriendModalShow] = useState<boolean>(false);
    const { user } = props.match.params;

    const history = useHistory();
    const [currentTab, setCurrentTab] = useState<"Post"|"Repo"|"Explore">("Explore");

    useEffect(() => {
        dispatch(fetchUser(user));
    }, [dispatch]);

    useEffect(() => {
        const fetchAndSetFriendList = async (username: string) => {
            const response = await getFriends(username);
            setFriendList(response);
        };
        if (currentUser) fetchAndSetFriendList(currentUser.username);
    }, [currentUser]);

    const onAddFriendClick = () => {
        // TODO
    };

    return (
        <div>
            <div id="profile-card" className="card mb-3 pt-3 pb-4">
                <div className="row g-0">
                    <div className="col-md-4 d-flex align-center">
                        <div id="profile-image">
                            <img src={currentUser && currentUser.profile_picture ? currentUser.profile_picture : "../../common/assets/avatar.jpg"} className="img-fluid" alt="profile" />
                        </div>

                    </div>
                    <div className="col-md-8">
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-2">
                                <h4 id="real-name" className="card-title me-2 mb-0">{currentUser ? currentUser.real_name : "Error"}</h4>
                                <p id="username" className="small text-muted mb-0">
                                    @
                                    {currentUser ? currentUser.username : "error"}
                                </p>
                            </div>
                            <p className="card-text mb-0">
                                Dolor anim exercitation sunt amet aute dolor quis fugiat veniam dolore ipsum quis.
                            </p>
                            <ButtonGroup>
                                <Button id="num-of-friends" variant="link" onClick={() => setFriendModalShow(true)} className="ms-0 ps-0">
                                    {friendList.length}
                                    {" "}
                                    friends
                                </Button>
                                <FriendList modalShow={friendModalShow} friendList={friendList} handleClose={() => setFriendModalShow(false)} />
                                <Button id="add-friend-button" onClick={onAddFriendClick} variant="link" className="ms-0 ps-0">+ Add Friend</Button>
                            </ButtonGroup>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // ! UI 먼저 짜려고 아래 로직은 일단 주석처리함
    // error에 대한 처리 필요
    // if (isLoading && !hasError) return null;
    // return (
    //     <div>
    //         {!isLoading && hasError && (!account ? <Redirect to='login'/> :
    //         <Redirect to={`/main/${account.realName}`}/>)}
    //         {/*Make Component with currentUser*/}
    //         <div>Profile Image : {currentUser?.profilePicture}</div>
    //         <div>RealName : {currentUser?.realName}</div>
    //         <div>Username : {currentUser?.username}</div>
    //         {account?.realName === currentUser?.username && <button
    //             onClick={() => history.push(`/main/${currentUser?.username}/setting`)}>
    //             Setting
    //         </button>}
    //         <div>Friends</div>
    //         {friends.map(value => <React.Fragment key={value.realName}><Friend user={value}/></React.Fragment>)}
    //         <button onClick={() => setCurrentTab("Post")}
    //                 disabled={currentTab === 'Post'}>Post</button>
    //         <button onClick={() => setCurrentTab("Repo")}
    //                 disabled={currentTab === 'Repo'}>Repository</button>
    //         <button onClick={() => setCurrentTab("Explore")}
    //                 disabled={currentTab === 'Explore'}>Explore</button>
    //     </div>
    // )
}
