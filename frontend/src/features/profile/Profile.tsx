import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useParams, useHistory } from "react-router-dom";
import { ButtonGroup, Button } from "react-bootstrap";
import { AppDispatch, RootState } from "../../app/store";
import * as actionCreator from "../auth/authSlice";
import { IUser } from "../../common/Interfaces";
import Friend from "./Friend";
import "./Profile.css";

const exampleImgSrc = "https://images.unsplash.com/photo-1609866975749-2238a" +
    "febfa27?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=1078&q=80";

interface ProfileProps {

}

export default function Profile(props : ProfileProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [account, currentUser, isLoading, hasError] =
        useSelector<RootState, [IUser|null, IUser|null, boolean, boolean]>((state) =>
            [state.auth.account, state.auth.currentUser, state.auth.isLoading, state.auth.hasError]);
    const params = useParams<{user : string}>();
    const history = useHistory();
    const [currentTab, setCurrentTab] = useState<"Post"|"Repo"|"Explore">("Explore");

    useEffect(() => {
        dispatch(actionCreator.fetchUser(params.user));
    }, [dispatch]);

    return (
        <div>
            <div id="profile-card" className="card mb-3 pt-3 pb-4">
                <div className="row g-0">
                    <div className="col-md-4 d-flex align-center">
                        <div id="profile-img">
                            <img src={exampleImgSrc} className="img-fluid" alt="profile" />
                        </div>

                    </div>
                    <div className="col-md-8">
                        <div className="card-body">
                            <div className="d-flex align-items-center mb-2">
                                <h4 className="card-title me-2 mb-0">John Doe</h4>
                                <p className="small text-muted mb-0">@johndoe</p>
                            </div>
                            <p className="card-text mb-0">
                                Dolor anim exercitation sunt amet aute dolor quis fugiat veniam dolore ipsum quis.
                            </p>
                            <ButtonGroup>
                                <Button variant="link" className="ms-0 ps-0">10 friends</Button>
                                <Button variant="link" className="ms-0 ps-0">3 repositories</Button>
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
