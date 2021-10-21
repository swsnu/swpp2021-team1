import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { StoreDispatch, StoreState } from "../../store/Store";
import { DummyUser, User } from "../../Interfaces";
import { Redirect } from "react-router-dom";
import * as actionCreator from "../../store/slice/UserSlice"
import { Form, Button } from "react-bootstrap";

interface LogInProps {

}

export default function LogIn(props: LogInProps) {
    const [email, setEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const dispatch = useDispatch<StoreDispatch>();
    const [account, isLoading, hasError] =
        useSelector<StoreState, [User | null, DummyUser | null, DummyUser[], boolean, boolean]>(state =>
            [state.users.account, state.users.currentUser, state.users.friends, state.users.isLoading, state.users.hasError]);

    function onLogIn() {
        dispatch(actionCreator.logIn({ email, password }));
    }

    //error 처리 필요
    if (isLoading && !hasError) return null;
    return (
        <div>
            {account && <Redirect to={`/main/${account.nickName}`} />}
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
                <Button variant="outline-primary">Sign Up!</Button>{/*TODO : Modal SignUp.tsx with onClick*/}
                <Button variant="link">Forgot Password?</Button>{/*TODO : Modal RestorePassword.tsx with onClick*/}
            </Form>
            
        </div>
    )

}