import React from "react"
import { useDispatch, useSelector } from 'react-redux';
import {StoreDispatch, StoreState} from "../../store/Store";
import {useEffect, useState} from "react";
import {Redirect, useParams, useHistory} from "react-router-dom";
import * as actionCreator from "../../store/slice/UserSlice";
import {DummyUser, User} from "../../Interfaces";
import Friend from "../../component/friend/Friend";


interface ProfileProps {

}

export default function Profile(props : ProfileProps) {
    const dispatch = useDispatch<StoreDispatch>();
    const [account, currentUser, friends, isLoading, hasError] =
        useSelector<StoreState, [User|null, DummyUser|null, DummyUser[], boolean, boolean]>(state =>
        [state.users.account, state.users.currentUser, state.users.friends, state.users.isLoading, state.users.hasError]);
    const params = useParams<{user : string}>();
    const history = useHistory();
    const [currentTab, setCurrentTab] = useState<'Post'|'Repo'|'Explore'>('Explore');

    useEffect(() => {
        dispatch(actionCreator.getUser(params.user));
    },[dispatch]);

    //error에 대한 처리 필요
    if (isLoading && !hasError) return null;
    return (
        <div>
            {!isLoading && hasError && (!account ? <Redirect to='login'/> : <Redirect to={`/main/${account.realName}`}/>)}
            {/*Make Component with currentUser*/}
            <div>Profile Image : {currentUser?.profilePicture}</div>
            <div>RealName : {currentUser?.realName}</div>
            <div>Username : {currentUser?.username}</div>
            {account?.realName === currentUser?.username && <button
                onClick={() => history.push(`/main/${currentUser?.username}/setting`)}>
                Setting
            </button>}
            <div>Friends</div>
            {friends.map(value => <React.Fragment key={value.realName}><Friend user={value}/></React.Fragment>)}
            <button onClick={() => setCurrentTab("Post")}
                    disabled={currentTab === 'Post'}>Post</button>
            <button onClick={() => setCurrentTab("Repo")}
                    disabled={currentTab === 'Repo'}>Repository</button>
            <button onClick={() => setCurrentTab("Explore")}
                    disabled={currentTab === 'Explore'}>Explore</button>
        </div>
    )
}