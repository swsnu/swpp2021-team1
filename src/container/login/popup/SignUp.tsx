import {useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import * as actionCreators from "../../../store/slice/UserSlice"
import {StoreDispatch, StoreState} from "../../../store/Store";
import React from "react";

interface SignUpProps {

}

export default function SignUp(props : SignUpProps) {
    const [email, setEmail] = useState<string>("");
    const [nickName, setNickName] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [canUse, setCanUse] = useState<boolean|null|undefined>(undefined);
    //해당 닉네임을 이용할 수 있는지 확인하는 state
    const dispatch = useDispatch<StoreDispatch>();
    const [isLoading, hasError] = useSelector<StoreState, [boolean, boolean]>(state =>
        [state.users.isLoading, state.users.hasError]);

    function onCheck() {
        setCanUse(null);
        /*TODO : request api server to check duplication*/
    }

    function onSignUp() {
        /*정규표현식으로 signup 형식 지정(hw2 참조)*/
        let flag = true;
        if (!/^[^.@\s]+@[A-Za-z\d.]+$/.test(email)) {
            //TODO
            flag = false;
        }
        if (!/^[a-zA-Z\d][_]+$/.test(nickName)) {
            //TODO
            flag = false;
        }
        if (!/^[a-zA-Z]+$/.test(name)) {
            //TODO
            flag = false;
        }
        if (!/^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{8,}$/.test(password)) {
            //TODO
            flag = false;
        }
        if (!flag || canUse !== true) return;
        dispatch(actionCreators.signUp({email : email, nickName : nickName, name : name, password : password, profilePicture : 'default'}));
    }

    //error에 대한 처리 필요
    if (isLoading && !hasError) return null;
    return (
        <div>
            <div>Email :  <input value={email} type={"text"} onChange={event => setEmail(event.target.value)}/></div>
            <div>NickName :  <input value={nickName} type={"text"} onChange={event => setNickName(event.target.value)}/></div>
            <button onClick={onCheck}>Check Duplicated NickName</button>
            <div>{canUse === true ? 'Acceptable NickName' :
                    canUse === false ? 'Duplicated NickName' :
                    canUse === null ? 'Loading...' : 'Duplication Check Please'}</div>
            <div>Name :  <input value={name} type={"text"} onChange={event => setName(event.target.value)}/></div>
            <div>Password :  <input value={password} type={"text"} onChange={event => setPassword(event.target.value)}/></div>
            <button onClick={onSignUp}>Confirm</button>
        </div>
    )
}