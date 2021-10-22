import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { AppDispatch, RootState } from "../../../app/store";
import { DummyUser, User } from "../../../common/Interfaces";
import { Redirect } from "react-router-dom";
import * as actionCreator from "../authSlice"
import { Form, Button } from "react-bootstrap";
import SignUp from "./popup/SignUp";
import './Login.css'

interface LogInProps {

}

export default function LogIn(props: LogInProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [signupModalShow, setSignupModalShow] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const [account, isLoading, hasError] =
    useAppSelector(state =>
        [state.auth.account, state.auth.currentUser, state.auth.friends, state.auth.isLoading, state.auth.hasError]);

    function onLogIn() {
        dispatch(actionCreator.logIn({ email, password }));
    }

    function onModalClose() {
        setSignupModalShow(false);
    }

    //error 처리 필요
    if (isLoading && !hasError) return null;
    return (
        <div id="viewport" className="p-5" >
            {account && <Redirect to={`/main/${account.realName}`} />}
            <Form id="form-container" className="p-5">
                <Form.Group className="mb-3">
                    <Form.Control value={email} type="email" onChange={event => setEmail(event.target.value)} placeholder="Email" />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Control value={password} type="password" onChange={event => setPassword(event.target.value)} placeholder="Password" />
                </Form.Group>
                <div>
                    <Button id="login-button" onClick={onLogIn}
                    disabled={email === "" || password === ""}
                    variant="primary">Log In</Button>
                    <div id="signup-button" >
                        <Button onClick={() => setSignupModalShow(true)} variant="link">Sign Up!</Button>
                        <SignUp show={signupModalShow} onModalClose={onModalClose} />
                    </div>
                </div>
            </Form>

        </div>
    )

}