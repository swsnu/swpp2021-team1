import React, { useState } from "react";
import { useAppDispatch, useAppSelector } from "../../../app/hooks";
import { AppDispatch, RootState } from "../../../app/store";
import { DummyUser, User } from "../../../common/Interfaces";
import { Redirect } from "react-router-dom";
import * as actionCreator from "../authSlice"
import { Form, Button } from "react-bootstrap";
import SignUp from "./popup/SignUp";

interface LogInProps {

}

export default function LogIn(props: LogInProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [signupModalShow, setSignupModalShow] = useState<boolean>(false);
    const dispatch = useAppDispatch();
    const [account, isLoading, hasError] =
    useAppSelector(state =>
            [state.users.account, state.users.currentUser, state.users.friends, state.users.isLoading, state.users.hasError]);

    function onLogIn() {
        dispatch(actionCreator.logIn({ email, password }));
    }

    function onModalClose() {
        setSignupModalShow(false);
    }

    //error 처리 필요
    if (isLoading && !hasError) return null;
    return (
        <div>
            {account && <Redirect to={`/main/${account.realName}`} />}
            <Form>
                <Form.Group className="mb-3" controlId="formBasicEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control value={email} type="email" onChange={event => setEmail(event.target.value)} />
                </Form.Group>
                <Form.Group className="mb-3" controlId="formBasicPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control value={password} type="password" onChange={event => setPassword(event.target.value)} />
                </Form.Group>
                <Button onClick={onLogIn} disabled={email === "" || password === ""} variant="primary">Log In</Button>
            </Form>
            <div id="signup">
                <Button onClick={() => setSignupModalShow(true)} variant="outline-primary">Sign Up!</Button>
                <SignUp show={signupModalShow} onModalClose={onModalClose} />
            </div>
            <Button variant="link">Forgot Password?</Button>
            {/*TODO : Modal RestorePassword.tsx with onClick*/}
        
        </div>
    )

}