import React, {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {StoreDispatch, StoreState} from "../../store/Store";
import {DummyUser, User} from "../../Interfaces";
import {Redirect} from "react-router-dom";
import * as actionCreator from "../../store/slice/UserSlice"

interface LogInProps {

}

export default function LogIn(props : LogInProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const dispatch = useDispatch<StoreDispatch>();
    const [account, isLoading, hasError] =
        useSelector<StoreState, [User|null, DummyUser|null, DummyUser[], boolean, boolean]>(state =>
            [state.users.account, state.users.currentUser, state.users.friends, state.users.isLoading, state.users.hasError]);

    function onLogIn() {
        dispatch(actionCreator.logIn({email, password}));
    }

    //error 처리 필요
    if (isLoading && !hasError) return null;
    return (
        <div>
            {account && <Redirect to={`/main/${account.nickName}`}/>}
            <div>Email : <input value={email} type="text" onChange={event => setEmail(event.target.value)}/></div>
            <div>Password : <input value={password} type="text" onChange={event => setPassword(event.target.value)}/></div>
            <button onClick={onLogIn} disabled={email === "" || password === ""}>Log In</button>
            <button>Sign Up!</button>{/*TODO : Modal SignUp.tsx with onClick*/}
            <button>Forget Password?</button>{/*TODO : Modal RestorePassword.tsx with onClick*/}
        </div>
    )

}